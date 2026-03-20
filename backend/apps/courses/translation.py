from modeltranslation.translator import register, TranslationOptions

from .models import Course, Schedule, TheoryLesson


@register(Course)
class CourseTranslationOptions(TranslationOptions):
    fields = ("name", "description")


@register(Schedule)
class ScheduleTranslationOptions(TranslationOptions):
    fields = ("location_name",)


@register(TheoryLesson)
class TheoryLessonTranslationOptions(TranslationOptions):
    fields = ("title", "content")

