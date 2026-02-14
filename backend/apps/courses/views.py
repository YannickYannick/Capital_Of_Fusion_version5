"""
Vues API Courses — liste des cours avec filtres optionnels (style, level, node).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Course
from .serializers import CourseSerializer


class CourseListAPIView(APIView):
    """
    GET /api/courses/
    Liste des Course actifs. Query params optionnels : style, level, node (slugs ou UUID).
    """

    def get(self, request):
        qs = Course.objects.filter(is_active=True).select_related(
            "style", "level", "node"
        )
        style = request.query_params.get("style")
        if style:
            qs = qs.filter(style__slug=style)
        level = request.query_params.get("level")
        if level:
            qs = qs.filter(level__slug=level)
        node = request.query_params.get("node")
        if node:
            # node peut être slug ou UUID
            if len(node) == 36 and "-" in node:
                qs = qs.filter(node_id=node)
            else:
                qs = qs.filter(node__slug=node)
        serializer = CourseSerializer(qs, many=True)
        return Response(serializer.data)
