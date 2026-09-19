from django.contrib.auth.models import User
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Project, Site
from .serializers import (
	ProjectSerializer, SiteSerializer, RegisterSerializer, UserSerializer,
)


class RegisterView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()
		return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class ProjectViewSet(viewsets.ModelViewSet):
	queryset = Project.objects.all()
	serializer_class = ProjectSerializer
	permission_classes = [permissions.IsAuthenticated]


class SiteViewSet(viewsets.ModelViewSet):
	queryset = Site.objects.all()
	serializer_class = SiteSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		qs = super().get_queryset()
		proj = self.request.query_params.get('project')
		if proj:
			try:
				proj_id = int(proj)
				qs = qs.filter(project_id=proj_id)
			except ValueError:
				return qs.none()
		return qs

	def perform_create(self, serializer):
		# Basic heuristic metrics: area is optional; if geojson provided, use number of coords
		geojson = serializer.validated_data.get('geojson')
		area = serializer.validated_data.get('area', 0.0)
		carbon = serializer.validated_data.get('carbon_score', 0.0)
		biodiversity = serializer.validated_data.get('biodiversity_score', 0.0)

		if geojson and isinstance(geojson, dict):
			# count coordinates roughly to derive simple demo metrics
			def count_coords(obj):
				if isinstance(obj, (int, float)):
					return 0
				if isinstance(obj, list):
					return sum(count_coords(i) for i in obj)
				if isinstance(obj, dict):
					return count_coords(obj.get('coordinates', []))
				return 0

			coord_count = count_coords(geojson)
			if not area:
				area = float(coord_count) * 0.1
			if not carbon:
				carbon = round(area * 0.5, 3)
			if not biodiversity:
				biodiversity = round(max(0.0, 10.0 - area * 0.1), 3)

		serializer.save(area=area, carbon_score=carbon, biodiversity_score=biodiversity)
