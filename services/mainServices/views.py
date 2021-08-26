from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
# Create your views here.
from mainServices.models import *

from rest_framework.views import APIView
from rest_framework.response import Response

class UserView(APIView):
	def get(self, request, *args, **kwargs):
		print("entra")
		return Response("nada")

	def post(self, request, *args, **kwargs):
		return JsonResponse(data={'error': False}, safe=False)

def index(request):
	return HttpResponse("Hola mundo")
