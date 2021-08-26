from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.hashers import make_password, check_password
# Create your views here.
from mainServices.models import *

from rest_framework.views import APIView
from rest_framework.response import Response
import json

class UserView(APIView):
	def get(self, request, *args, **kwargs):
		email = request.GET.get('username','')
		password =  request.GET.get('pass','')

		if len(email) == 0 or len(password) == 0:
			return JsonResponse(data={"error": True, "message": 'incomplete_data' })
		user = User.objects.filter(username= email).first()
		if user and check_password(password, user.password) :
			return JsonResponse(data={"error": False, "id":3})
		return JsonResponse(data={"error": True, "message": 'wrong_login_data'})



	def post(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			print(data)
			check_email = User.objects.filter(username=data['email']).all()
			print(check_email)
			if check_email:
				return JsonResponse(data={'error': True, 'message':'email_already_registered'}, safe=False)
			new_pass = make_password(data['password'])
			print(new_pass)
			new_user = User.objects.create(first_name=data['first_name'], last_name=data['last_name'], birthday=data['birthday'], username=data['email'], password=new_pass)
			return JsonResponse(data={'error': False, 'id': new_user.id}, safe=False)
		except Exception as e:
			print(e)

def index(request):
	return HttpResponse("Hola mundo")
