from django.contrib import admin
from .models import Project, Site


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'created_at')


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'project', 'area', 'carbon_score', 'biodiversity_score')
