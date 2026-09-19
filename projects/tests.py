from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status


class AuthTests(APITestCase):
	def test_register_and_login_flow(self):
		register_url = '/api/auth/register/'
		login_url = '/api/auth/login/'
		refresh_url = '/api/auth/refresh/'
		projects_url = '/api/projects/'

		# Register a new user
		data = {
			'username': 'tester',
			'email': 'tester@example.com',
			'password': 'strongpassword123'
		}
		resp = self.client.post(register_url, data, format='json')
		self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
		self.assertIn('username', resp.data)

		# Login to get tokens
		resp = self.client.post(login_url, {'username': 'tester', 'password': 'strongpassword123'}, format='json')
		self.assertEqual(resp.status_code, status.HTTP_200_OK)
		self.assertIn('access', resp.data)
		self.assertIn('refresh', resp.data)

		access = resp.data['access']
		refresh = resp.data['refresh']

		# Access a protected endpoint
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
		resp = self.client.get(projects_url)
		# 200 OK and returns a list
		self.assertEqual(resp.status_code, status.HTTP_200_OK)

		# Test refresh token
		resp = self.client.post(refresh_url, {'refresh': refresh}, format='json')
		self.assertEqual(resp.status_code, status.HTTP_200_OK)
		self.assertIn('access', resp.data)


class ProjectSiteTests(APITestCase):
	def setUp(self):
		# create and login a user
		self.register_url = '/api/auth/register/'
		self.login_url = '/api/auth/login/'
		self.projects_url = '/api/projects/'
		self.sites_url = '/api/sites/'

		self.user = {'username': 'owner', 'email': 'o@example.com', 'password': 'pass12345'}
		self.client.post(self.register_url, self.user, format='json')
		resp = self.client.post(self.login_url, {'username': 'owner', 'password': 'pass12345'}, format='json')
		self.access = resp.data['access']

	def auth(self):
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access}')

	def test_unauthenticated_project_access(self):
		# no credentials provided
		resp = self.client.get(self.projects_url)
		self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_authenticated_project_creation_and_listing(self):
		self.auth()
		payload = {'name': 'Project A', 'description': 'Test project'}
		resp = self.client.post(self.projects_url, payload, format='json')
		self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
		self.assertEqual(resp.data['name'], 'Project A')

		# list
		resp = self.client.get(self.projects_url)
		self.assertEqual(resp.status_code, status.HTTP_200_OK)
		self.assertGreaterEqual(len(resp.data), 1)

	def test_site_creation_and_listing_and_filtering(self):
		self.auth()
		# create two projects
		p1 = self.client.post(self.projects_url, {'name': 'P1'}, format='json').data
		p2 = self.client.post(self.projects_url, {'name': 'P2'}, format='json').data

		# valid polygon (triangle)
		poly = {
			'type': 'Polygon',
			'coordinates': [
				[
					[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 2.0]
				]
			]
		}

		s1 = self.client.post(self.sites_url, {'project': p1['id'], 'name': 'S1', 'geojson': poly}, format='json')
		self.assertEqual(s1.status_code, status.HTTP_201_CREATED)

		s2 = self.client.post(self.sites_url, {'project': p2['id'], 'name': 'S2', 'geojson': poly}, format='json')
		self.assertEqual(s2.status_code, status.HTTP_201_CREATED)

		# list all sites
		resp = self.client.get(self.sites_url)
		self.assertEqual(resp.status_code, status.HTTP_200_OK)
		self.assertGreaterEqual(len(resp.data), 2)

		# filter by project p1
		resp = self.client.get(self.sites_url + f'?project={p1["id"]}')
		self.assertEqual(resp.status_code, status.HTTP_200_OK)
		# should only contain 1 (s1)
		self.assertEqual(len(resp.data), 1)

	def test_invalid_polygon_data(self):
		self.auth()
		p = self.client.post(self.projects_url, {'name': 'BadProj'}, format='json').data
		bad_geo = {'type': 'Point', 'coordinates': [0, 0]}
		resp = self.client.post(self.sites_url, {'project': p['id'], 'name': 'BadSite', 'geojson': bad_geo}, format='json')
		self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('geojson', resp.data)
