from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.hashers import make_password, check_password
# Create your views here.
from mainServices.models import *

from rest_framework.views import APIView
from rest_framework.response import Response
import json
from datetime import datetime, timedelta
import hashlib
import random
from django.template.loader import render_to_string
from django.core.mail import send_mail
from services.settings import EMAIL_HOST, ANGULAR_DIR
from django.db.models import F

class UserView(APIView):
	def get(self, request, *args, **kwargs):
		email = request.GET.get('username','')
		password =  request.GET.get('pass','')

		if len(email) == 0 or len(password) == 0:
			return JsonResponse(data={"error": True, "message": 'incomplete_data' })
		user = User.objects.filter(username= email).first()
		if user and check_password(password, user.password) :
			return JsonResponse(data={"error": False, "id":user.id})
		return JsonResponse(data={"error": True, "message": 'wrong_login_data'})



	def post(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			print(data)
			check_email = User.objects.filter(username=data['email']).all()
			print(check_email)
			if  not ('first_name' in data and 'last_name' in data and 'birthday' in data and 'email' in data and 'password' in data):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			if check_email:
				return JsonResponse(data={'error': True, 'message':'email_already_registered'}, safe=False)
			new_pass = make_password(data['password'])
			print(new_pass)
			new_user = User.objects.create(first_name=data['first_name'], last_name=data['last_name'], birthday=data['birthday'], username=data['email'], password=new_pass)
			return JsonResponse(data={'error': False, 'id': new_user.id}, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

class passwordView(APIView):

	def get(self, request, *args, **kwargs):
		try:
			print("Entra")
			token = request.GET.get('token','')
			if len(token) == 0:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			user_token = UserRecoveryToken.objects.filter(token = token, active = True).first()
			if not user_token:
				return JsonResponse(data={"error": True,  "message":"invalid_token"})
			return JsonResponse(data={'error': False}, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def post(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			print(data)
			if not 'email' in data:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			user = User.objects.filter(username = data['email']).first()
			print(user)
			if not user:
				return JsonResponse(data={ "error": True, "message":"user_not_exists" })
			user_token = UserRecoveryToken.objects.filter(user=user.id, active = True).first()
			if  user_token and ((user_token.created_at + timedelta( days = 1)).timestamp()	 > datetime.now().timestamp()):
				print("enviar correo1")
				self.send_mail(user,user_token)
				return JsonResponse(data={"error": False})	
			elif user_token : 
				user_token.active = False
				user_token.save()
			token = hashlib.md5(str(datetime.now().timestamp() + random.randint(0,1000000)).encode()).hexdigest()
			print(token)
			user_token = UserRecoveryToken.objects.create(user=user, created_at=datetime.now(), token = token)
			print("enviar correo2")
			self.send_mail(user,user_token)
			return JsonResponse(data={"error": False})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})
	def put(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			print(data)
			if not ('token' in data and 'pass' in data):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			user_token = UserRecoveryToken.objects.filter(token = data['token'], active = True).first()
			if  user_token and ((user_token.created_at + timedelta( days = 1)).timestamp()	 > datetime.now().timestamp()):
				User.objects.filter(id= user_token.user_id).update(password= make_password(data['pass']) )
				user_token.active = False;
				user_token.save();
				return JsonResponse(data={"error": False})
			return JsonResponse(data={"error": True, "message": 'invalid_token' })
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def send_mail(self,user,user_token):
		context = {
			'username' : user.first_name + ' ' + user.last_name,
			'url': ANGULAR_DIR + 'recuperar_contraseña/' + user_token.token
		}
		send_mail('una prueba', 'esta es una prueba', EMAIL_HOST, [user.username], fail_silently= False, html_message=render_to_string('mainServices/test.html',context))


def index(request):
	return HttpResponse("Hola mundo")
