"""
Modèles Courses — Course, Schedule, Enrollment. Alignés MCD Phase 1 section 1.4.
"""
from django.db import models
from apps.core.models import BaseModel


class Course(BaseModel):
    """
    Cours : style, niveau, noeud, actif, image, enseignants (M-N User).
    """

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    description = models.TextField(blank=True)
    style = models.ForeignKey(
        "core.DanceStyle",
        on_delete=models.CASCADE,
        related_name="courses",
    )
    level = models.ForeignKey(
        "core.Level",
        on_delete=models.CASCADE,
        related_name="courses",
    )
    node = models.ForeignKey(
        "organization.OrganizationNode",
        on_delete=models.CASCADE,
        related_name="courses",
    )
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to="courses/", null=True, blank=True)
    teachers = models.ManyToManyField(
        "users.User",
        related_name="taught_courses",
        blank=True,
    )

    class Meta:
        verbose_name = "Cours"
        verbose_name_plural = "Cours"

    def __str__(self):
        return self.name


class Schedule(BaseModel):
    """Horaire récurrent d'un cours (jour, créneau, lieu)."""

    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="schedules"
    )
    DAY_CHOICES = [
        (0, "Lundi"),
        (1, "Mardi"),
        (2, "Mercredi"),
        (3, "Jeudi"),
        (4, "Vendredi"),
        (5, "Samedi"),
        (6, "Dimanche"),
    ]
    day_of_week = models.PositiveSmallIntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    location_name = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = "Horaire"
        verbose_name_plural = "Horaires"

    def __str__(self):
        return f"{self.course.name} — {self.get_day_of_week_display()} {self.start_time}"


class Enrollment(BaseModel):
    """Inscription d'un utilisateur à un cours (unicité user + course)."""

    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="enrollments"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="enrollments"
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Inscription"
        verbose_name_plural = "Inscriptions"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "course"], name="unique_user_course_enrollment"
            )
        ]

    def __str__(self):
        return f"{self.user} → {self.course}"


class TheoryLesson(BaseModel):
    """
    Leçon de théorie musicale / danse.
    Catégories : rythme, technique, histoire, culture.
    """

    CATEGORY_CHOICES = [
        ("rythme", "Rythme & Musique"),
        ("technique", "Technique"),
        ("histoire", "Histoire"),
        ("culture", "Culture"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="technique")
    level = models.ForeignKey(
        "core.Level",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="theory_lessons",
    )
    content = models.TextField(blank=True, help_text="Contenu en Markdown")
    video_url = models.URLField(blank=True, help_text="URL YouTube embed (optionnel)")
    duration_minutes = models.PositiveSmallIntegerField(default=5)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Leçon de théorie"
        verbose_name_plural = "Leçons de théorie"
        ordering = ["category", "level__order"]

    def __str__(self):
        return self.title
