from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Project, Site


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = (
            'id', 'project', 'name', 'description', 'geojson', 'area',
            'carbon_score', 'biodiversity_score', 'created_at', 'updated_at',
        )

    def validate(self, data):
        # Ensure required fields are present
        if 'project' not in data and self.instance is None:
            raise serializers.ValidationError({'project': 'This field is required.'})
        if 'name' not in data and self.instance is None:
            raise serializers.ValidationError({'name': 'This field is required.'})
        # GeoJSON polygon validation: require a Polygon geometry or a Feature with Polygon geometry
        geo = data.get('geojson')
        if geo is None:
            raise serializers.ValidationError({'geojson': 'GeoJSON polygon is required.'})
        # Accept Feature or direct geometry
        geom = geo
        if isinstance(geo, dict) and geo.get('type') == 'Feature':
            geom = geo.get('geometry')
        if not isinstance(geom, dict):
            raise serializers.ValidationError({'geojson': 'Invalid GeoJSON structure.'})
        if geom.get('type') != 'Polygon':
            raise serializers.ValidationError({'geojson': 'GeoJSON must be a Polygon geometry.'})
        if 'coordinates' not in geom:
            raise serializers.ValidationError({'geojson': 'GeoJSON Polygon must include coordinates.'})
        # Basic coordinates shape check
        coords = geom.get('coordinates')
        if not isinstance(coords, list) or len(coords) == 0:
            raise serializers.ValidationError({'geojson': 'Coordinates must be a non-empty list.'})
        return data

    def validate_geojson(self, value):
        # Basic GeoJSON validation: must be a dict with type and coordinates
        if value is None:
            return value
        if not isinstance(value, dict):
            raise serializers.ValidationError('geojson must be a JSON object')
        if 'type' not in value:
            raise serializers.ValidationError('geojson must have a "type"')
        if 'coordinates' not in value and value.get('type') != 'Feature':
            raise serializers.ValidationError('geojson must include "coordinates" or be a Feature')
        return value


class ProjectSerializer(serializers.ModelSerializer):
    sites = SiteSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'created_at', 'updated_at', 'sites')
