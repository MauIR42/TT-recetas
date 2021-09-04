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
from django.db.models import F, Q, Case, When, Value, Max
from ast import literal_eval
import json

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
			check_email = User.objects.filter(username=data['email']).all()
			if  not ('first_name' in data and 'last_name' in data and 'birthday' in data and 'email' in data and 'password' in data and 'height' in data):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			if check_email:
				return JsonResponse(data={'error': True, 'message':'email_already_registered'}, safe=False)
			new_pass = make_password(data['password'])
			new_user = User.objects.create(first_name=data['first_name'], last_name=data['last_name'], birthday=data['birthday'], username=data['email'], password=new_pass, gender=data['gender'], height= data['height'])
			return JsonResponse(data={'error': False, 'id': new_user.id}, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def put(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
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
			if not 'email' in data:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			user = User.objects.filter(username = data['email']).first()
			if not user:
				return JsonResponse(data={ "error": True, "message":"user_not_exists" })
			user_token = UserRecoveryToken.objects.filter(user=user.id, active = True).first()
			if  user_token and ((user_token.created_at + timedelta( days = 1)).timestamp()	 > datetime.now().timestamp()):
				self.send_mail(user,user_token)
				return JsonResponse(data={"error": False})	
			elif user_token : 
				user_token.active = False
				user_token.save()
			token = hashlib.md5(str(datetime.now().timestamp() + random.randint(0,1000000)).encode()).hexdigest()
			user_token = UserRecoveryToken.objects.create(user=user, created_at=datetime.now(), token = token)
			self.send_mail(user,user_token)
			return JsonResponse(data={"error": False})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})
	def put(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
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
				if( user_stats):
					return JsonResponse(data={"error": False, 'data':  { 'info':list(user_stats.values()), 'has_data': True} })
				stats = list(Stat.objects.all().values())
				return JsonResponse(data={"error": False, 'data': { 'info':stats, 'has_data':False} })
			return JsonResponse(data={"error": True, "message": 'user_not_exists'})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def post(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			week = 1

			data['weight'] = round(float(data['weight']), 2)
			data['imc'] = round(float(data['imc']), 2)
			data['diameter'] = round(float(data['diameter']), 2)

			if not ( data['user_id'] and data['imc'] and data['weight'] and data['diameter']):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })

			last_week = UserStat.objects.filter(user_id=data['user_id'], active=True)
			print(last_week)
			if last_week['week_number__max'] :
				week = last_week['week_number__max'] + 1
			stats = []
			stats.append(UserStat(value=data['imc'], week_number=week, stat_type_id=2, user_id=data['user_id']))
			stats.append(UserStat(value=data['weight'], week_number=week, stat_type_id=3, user_id=data['user_id']))
			stats.append(UserStat(value=data['diameter'], week_number=week, stat_type_id=4, user_id=data['user_id']))
			UserStat.objects.bulk_create( stats )

			return JsonResponse(data={"error": False})


		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})



class ScaleView(APIView):
	def get(self, request, *args, **kwargs):
		try:
			user_id = request.GET.get('user_id','')
			user_type = User.objects.filter(id = user_id).first()
			if user_type.user_type:
				if user_type.user_type.id == 5:
					user_type.user_type = UserType.objects.get(id = 1)
					user_type.scale = None
					user_type.save()
					return JsonResponse(data={"error": False, 'user_type': 5 })
				if user_type.user_type.id == 3:
					current_users = list(User.objects.filter( Q(scale = user_type.scale) & Q(active= True ) & ~Q(id= user_id) ).values('first_name', 'last_name', 'id', 'user_type'))
					return JsonResponse(data={"error": False, 'user_type': user_type.user_type.id, 'current_users': current_users, 'scale_id':user_type.scale_id })
				return JsonResponse(data={"error": False, 'user_type': user_type.user_type.id })
			return JsonResponse(data={"error": True, "message": 'incomplete_data' })
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def post(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
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
				ScaleUpdate.objects.create(user_id = user.id, scale_id = scale.id, update_type_id = 3 )
			user.scale = scale
			user.save()
			return JsonResponse(data={'error': False, 'user_type': user.user_type.id}, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def put(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			if not ( 'user_id' in data and 'status_id' in data ):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			user = User.objects.filter( id= data['user_id']).first()
			user.user_type_id = data['status_id'];
			if data['status_id'] == '1':
				pending_update = ScaleUpdate.objects.filter(active=True, user = user, update_type_id = 3).first()
				if pending_update:
					pending_update.active = False
					pending_update.save()
				else:
					ScaleUpdate.objects.create(user_id = user.id, scale = user.scale, update_type_id = 4 )
				user.scale = None

			elif 'admin_id' in data :
				User.objects.filter(id= data['admin_id']).update( user_type_id = 2 )
			elif data['status_id'] == '2':
				pending_update = ScaleUpdate.objects.filter(active=True, user = user, update_type_id = 4).first()
				if pending_update:
					pending_update.active = False
					pending_update.save()
				else:
					ScaleUpdate.objects.create(user_id = user.id, scale = user.scale, update_type_id = 3 )
			user.save()
			return JsonResponse(data={'error': False }, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def delete(self, request, *args, **kwargs):
		try:
			scale_id_s = request.GET.get('scale_id','-1')
			scale_id = int(scale_id_s)
			User.objects.filter(scale_id = scale_id).update(scale_id = None, user_type_id = 1)
			return JsonResponse(data={'error': False }, safe=False)

		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

class IngredientView(APIView):

	def get(self, request, *args, **kwargs):
		try:
			ingredients = list(Ingredient.objects.filter(~Q(type_id = 2) & Q(active=True)).annotate(
				unit = Case(
					When(type_id = 1, then=Value('pzs')),
					When(type_id = 3, then=Value('ml')),
					)
				).values('unit','id','name'))
			return JsonResponse(data={'error': False, 'ingredients' : ingredients }, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

class StockView(APIView):

	def get(self, request, *args, **kwargs):
		try:
			user_id = request.GET.get('user_id','')
			user_stock = Inventory.objects.filter(user_id = user_id, active= True, quantity__gt=0).annotate(unit = Case(
					When(ingredient__type_id = 1, then=Value('pzs')),
					When(ingredient__type_id = 3, then=Value('ml')),
					When(ingredient__type_id = 2, then=Value('gr')),
					), ingredient_name=F('ingredient__name')).values()
			user_stock = list(user_stock)
			subidos = []
			pendientes = []
			units = {
				'gr' : 'Kg',
				'ml' : 'L',
			}
			for element in user_stock:
				if element['quantity'] >= 1000 and element['unit'] in units:
					element['quantity'] = element['quantity'] / 1000
					element['unit'] = units[ element['unit'] ]
				if element['type_id'] == 1:
					subidos.append(element)
				else:
					pendientes.append(element)

			return JsonResponse(data={'error': False, 'subidos' : subidos, 'pendientes': pendientes }, safe=False)

		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def post(self, request, *args, **kwargs):
		try:
			data =  request.POST.dict()
			if not ( 'user_id' in data and 'ingredients' in data ):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			data['ingredients'] = literal_eval(data['ingredients'])
			pending = Inventory.objects.filter(active= True, type_id=2, user_id= data['user_id'])

			index_pending = {}
			for pen in pending:
				index_pending[ pen.ingredient_id ] = pen
			to_bulk = []
			to_update = []
			for ing in data['ingredients']:
				if ing['id'] in index_pending:
					index_pending[ ing['id'] ].quantity -= ing['quantity']
					to_update.append( index_pending[ ing['id'] ] )
				to_bulk.append( Inventory(quantity=ing['quantity'], ingredient_id=ing['id'], user_id=data['user_id'], type_id=ing['type']) )
			Inventory.objects.bulk_create( to_bulk )
			if len(to_update) > 0 :
				Inventory.objects.bulk_update( to_update, ['quantity'] )
			return JsonResponse(data={'error': False}, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def put(self, request, *args, **kwargs):
		try:
			data =  request.POST.dict()
			if not ('item_id' in data) :
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			if 'deactivate' in data:
				print(data)
				updated = Inventory.objects.filter(id= data['item_id']).first()
				pending = Inventory.objects.filter(active = True, ingredient_id = data['item_id'], type_id = 2 ).first()
				if pending:
					pending.quantity += updated.quantity
					pending.save()
				updated.active = False
				updated.save()
				return JsonResponse(data={'error': False}, safe=False)
			pending = Inventory.objects.filter(active = True, ingredient_id = data['ingredient_id'], type_id = 2 ).first()
			if pending:
				pending.quantity += float(data['difference'])
				pending.save()
			Inventory.objects.filter(id= data['item_id']).update(quantity=data['quantity'], ingredient_id=data['ingredient_id'], type_id=data['type'])
			return JsonResponse(data={'error': False}, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

class EmbebbedScaleView(APIView):

	def get(self, request, *args, **kwargs):
		try:
			access_code = request.GET.get('access_code','')
			print(access_code)
			if not access_code:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			scale = Scale.objects.filter(access_code= access_code, active=True).first()
			if not scale:
				return JsonResponse(data={"error": True,  "message":"scale_not_exists"})

			updates = ScaleUpdate.objects.filter(scale=scale, active=True).annotate(username=F('user_id__username')).order_by('update_type_id').values()

			format_updates = {
				'add':{

				},
				'delete': {

				},
				'ingredients': {

				}
			}

			not_checked = []
			for update in updates:
				print(update['update_type_id'])
				if update['update_type_id'] == 3:
					format_updates['add'][update['username']] = update['user_id']
				if update['update_type_id'] == 4:
					format_updates['delete'][update['username']] = update['user_id']
				if update['update_type_id'] == 5:
					if update['username'] in format_updates['delete']:
						continue
					else:
						print("obteniendo ingredientes")
						print("id_usuario: ",update['user_id'])
						pending = Inventory.objects.filter(user_id = update['user_id'], active = True, type_id=2, ingredient_id__type_id=2)\
						.annotate(ingredient_name=F('ingredient_id__name')).order_by('ingredient_name').values()
						if len(pending) > 0:
							format_updates['ingredients'][update['username']] = {}
							user_ingr = format_updates['ingredients'][update['username']]
							for pen in pending:
								print(pen['ingredient_name'])
								user_ingr[pen['ingredient_name']] = pen['ingredient_id']
			ScaleUpdate.objects.filter(scale=scale, active=True).update(active = False)			
			return JsonResponse(data={"error": False, 'add': format_updates['add'], 'delete': format_updates['delete'], 'ingredients':format_updates['ingredients']})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def post(self, request, *args, **kwargs):
		try:
			data =  request.POST.dict()
			if not ( 'user_id' in data and 'access_code' in data and 'quantity' in data and 'ingredient_id' in data):
					return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			scale = Scale.objects.filter(access_code= data['access_code'], active=True).first()
			if not scale:
					return JsonResponse(data={"error": True,  "message":"scale_not_exists"})
			Inventory.objects.create(quantity=data['quantity'], ingredient_id=data['ingredient_id'], type_id=1, user_id = data['user_id'])
			return JsonResponse(data={"error": False})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})


