from django.db import models


# Simple Project model
class Project(models.Model):
	name = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.name


# Site model stores GeoJSON in a JSONField to avoid PostGIS complexity.
class Site(models.Model):
	project = models.ForeignKey(Project, related_name='sites', on_delete=models.CASCADE)
	name = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	# Store GeoJSON geometry or feature as JSON
	geojson = models.JSONField(null=True, blank=True)
	area = models.FloatField(default=0.0)
	carbon_score = models.FloatField(default=0.0)
	biodiversity_score = models.FloatField(default=0.0)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"{self.name} ({self.project.name})"

	class Meta:
		ordering = ['-created_at']
