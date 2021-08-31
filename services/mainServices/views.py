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
from django.db.models import F, Q

class AuthUserView(APIView):
	def get(self, request, *args, **kwargs):
		email = request.GET.get('username','')
		password =  request.GET.get('pass','')
		if len(email) == 0 or len(password) == 0:
			return JsonResponse(data={"error": True, "message": 'incomplete_data' })
		user = User.objects.filter(username= email).first()
		if user and check_password(password, user.password) :
			return JsonResponse(data={"error": False, "id":user.id})
		return JsonResponse(data={"error": True, "message": 'wrong_login_data'})

class UserView(APIView):
	def get(self, request, *args, **kwargs):
		try:
			user_id = request.GET.get('user_id','')
			if len(user_id) == 0:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			user = User.objects.filter(id= user_id, active = True)
			if user:
				return JsonResponse(data={"error": False, "user_info":user.values('first_name','last_name','username','birthday','gender', 'height')[0]})
			return JsonResponse(data={"error": True, "message": 'user_not_exists'})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})



	def post(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			print(data)
			check_email = User.objects.filter(username=data['email']).all()
			print(check_email)
			if  not ('first_name' in data and 'last_name' in data and 'birthday' in data and 'email' in data and 'password' in data and 'height' in data):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			if check_email:
				return JsonResponse(data={'error': True, 'message':'email_already_registered'}, safe=False)
			new_pass = make_password(data['password'])
			print(new_pass)
			new_user = User.objects.create(first_name=data['first_name'], last_name=data['last_name'], birthday=data['birthday'], username=data['email'], password=new_pass, gender=data['gender'], height= data['height'])
			return JsonResponse(data={'error': False, 'id': new_user.id}, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def put(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			print(data)
			if  not ('first_name' in data and 'last_name' in data and 'birthday' in data  and 'gender' in data and 'user_id' in data and 'height' in data):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			user = User.objects.filter(id= data['user_id']).first()
			if not user:
				return JsonResponse(data={"error": True, "message": 'user_not_exists' })
			user.first_name = data['first_name']
			user.last_name = data['last_name']
			user.birthday = data['birthday']
			user.gender = data['gender']
			user.height = data['height']
			if 'password' in data:	
				user.password = make_password(data['password'])
			if 'username' in data:
				check_email = User.objects.filter(username=data['email']).all()
				if check_email:
					return JsonResponse(data={'error': True, 'message':'email_already_registered'}, safe=False)
				user.username = data['email']
			user.save()
			return JsonResponse(data={'error': False}, safe=False)
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

class UserStatView(APIView):
	def get(self, request, *args, **kwargs):
		try:
			user_id = request.GET.get('user_id','')
			if len(user_id) == 0:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			user = User.objects.filter(id= user_id, active = True)
			if user:
				user_stats = UserStat.objects.filter(user_id = user_id);
				print(user_stats)
				if( user_stats):
					return JsonResponse(data={"error": False, 'data':  { 'info':user_stats.values(), 'has_data': True} })
				stats = list(Stat.objects.all().values())
				return JsonResponse(data={"error": False, 'data': { 'info':stats, 'has_data':False} })
			return JsonResponse(data={"error": True, "message": 'user_not_exists'})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})


class ScaleView(APIView):
	def get(self, request, *args, **kwargs):
		try:
			user_id = request.GET.get('user_id','')
			print(user_id)
			user_type = User.objects.filter(id = user_id).first()
			if user_type.user_type:
				if user_type.user_type.id == 5:
					user_type.user_type = UserType.objects.get(id = 1)
					user_type.scale = None
					user_type.save()
					return JsonResponse(data={"error": False, 'user_type': 5 })
				if user_type.user_type.id == 3:
					current_users = list(User.objects.filter( Q(scale = user_type.scale) & Q(active= True ) & ~Q(id= user_id) ).values('first_name', 'last_name', 'id', 'user_type'))
					print(current_users)
					return JsonResponse(data={"error": False, 'user_type': user_type.user_type.id, 'current_users': current_users })
				return JsonResponse(data={"error": False, 'user_type': user_type.user_type.id })
			return JsonResponse(data={"error": True, "message": 'incomplete_data' })
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def post(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			print(data)
			if  not ('user_id' in data and 'scale_code' in data) :
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			scale = Scale.objects.filter(access_code=data['scale_code'], active= True).first()
			if not scale:
				return JsonResponse(data={"error": True,  "message":"scale_not_exists"})
			users = User.objects.filter(scale=scale, active= True)
			user = User.objects.filter(id = data['user_id']).first()
			if users:
				user.user_type = UserType.objects.get(name='pending user');
			else:
				user.user_type = UserType.objects.get(name='scale administrator');
			user.scale = scale
			user.save()
			return JsonResponse(data={'error': False, 'user_type': user.user_type.id}, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def put(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			print(data)
			if not ( 'user_id' in data and 'status_id' in data ):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			user = User.objects.filter( id= data['user_id']).first()
			user.user_type_id = data['status_id'];
			if data['status_id'] == '1':
				user.scale = None
			if 'admin_id' in data :
				User.objects.filter(id= data['admin_id']).update( user_type_id = 1 )
			user.save()
			return JsonResponse(data={'error': False }, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})
