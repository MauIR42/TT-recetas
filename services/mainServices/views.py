from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.hashers import make_password, check_password
# Create your views here.
from mainServices.models import *
from django.forms.models import model_to_dict
from rest_framework.views import APIView
from rest_framework.response import Response
import json
from datetime import datetime, timedelta, date
import hashlib
import random
from django.template.loader import render_to_string
from django.core.mail import send_mail
from services.settings import EMAIL_HOST, ANGULAR_DIR
from django.db.models import F, Q, Case, When, Value, Max, Sum, OuterRef, Subquery

from django.db import transaction
from ast import literal_eval
import json
import unidecode

import traceback

import simpful as sf

class SED:
	def __init__(self):
		self.FS = sf.FuzzySystem()

		print("configurando sabor")
		taste_bad = sf.TrapezoidFuzzySet(a= 0, b=0, c=3.21, d= 6.23, term="bad")
		taste_ok = sf.TriangleFuzzySet(a=4,b=6,c=8, term="ok")
		taste_good = sf.TrapezoidFuzzySet(a= 6.3, b=8.5, c=10, d=10, term="good")

		self.FS.add_linguistic_variable("taste", sf.LinguisticVariable([taste_bad, taste_ok, taste_good], universe_of_discourse=[0,10]))

		print("configurando dificultad")
		difficult_easy = sf.TrapezoidFuzzySet(a= 0, b=0, c=3, d=5, term="easy")
		difficult_normal = sf.TriangleFuzzySet(a=3,b=5,c=7, term="normal")
		difficult_hard = sf.TrapezoidFuzzySet(a= 5, b=7, c=10, d=10, term="hard")

		self.FS.add_linguistic_variable("difficulty", sf.LinguisticVariable([difficult_easy, difficult_normal, difficult_hard], universe_of_discourse=[0,10]))

		print("configurando tiempo")
		time_good = sf.TrapezoidFuzzySet(a= 0, b=0, c=15, d=45, term="little")
		time_average = sf.TriangleFuzzySet(a=20,b=45,c=70, term="average")
		time_bad = sf.TrapezoidFuzzySet(a= 45, b=75, c=120, d=120, term="much")

		self.FS.add_linguistic_variable("time", sf.LinguisticVariable([time_good, time_average, time_bad], universe_of_discourse=[0,120]))

		print("configurando salida")
		little = sf.TrapezoidFuzzySet(a= 0, b=0, c=10, d=25, term="little")
		regular = sf.TriangleFuzzySet(a=10,b=27.5,c=45, term="regular")
		ok = sf.TriangleFuzzySet(a=25,b=50,c=75, term="ok")
		much = sf.TriangleFuzzySet(a=55,b=72.5,c=90, term="much")
		pretty = sf.TrapezoidFuzzySet(a= 75, b=90, c=100, d=100, term="pretty")


		self.FS.add_linguistic_variable("recommendation", sf.LinguisticVariable([little, regular, ok, much, pretty], universe_of_discourse=[0,100]))

		self.FS.add_rules([
			"IF (taste IS good) AND (time IS little) THEN (recommendation IS pretty)",
			"IF (taste IS good) AND (difficulty IS easy) AND (time IS average) THEN (recommendation IS pretty)",
			"IF (taste IS good) AND (difficulty IS normal) AND (time IS average) THEN (recommendation IS much)",
			"IF (taste IS good) AND (difficulty IS hard) AND (time IS average) THEN (recommendation IS much)",
			"IF (taste IS good) AND (difficulty IS easy) AND (time IS much) THEN (recommendation IS much)",
			"IF (taste IS good) AND (time IS much) THEN (recommendation IS ok)",
			"IF (taste IS ok) AND (time IS little) THEN (recommendation IS ok)",
			"IF (taste IS ok) AND (difficulty IS easy) AND (time IS average) THEN (recommendation IS ok)",
			"IF (taste IS ok) AND (difficulty IS normal) AND (time IS average) THEN (recommendation IS regular)",
			"IF (taste IS ok) AND (difficulty IS hard) AND (time IS average) THEN (recommendation IS regular)",
			"IF (taste IS ok) AND (difficulty IS easy) AND (time IS much) THEN (recommendation IS regular)",
			"IF (taste IS ok) AND (time IS much) THEN (recommendation IS little)",
			"IF (taste IS bad) AND (time IS little) THEN (recommendation IS regular)",
			"IF (taste IS bad) THEN (recommendation IS little)",
			])

sed = SED()

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
				check_email = User.objects.filter(Q(username=data['username']) & ~Q(id= data['user_id']) ).all()
				if check_email:
					return JsonResponse(data={'error': True, 'message':'email_already_registered'}, safe=False)
				user.username = data['username']
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
			# print(data)
			if not 'email' in data:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			user = User.objects.filter(username = data['email']).first()
			# print(user)
			if not user:
				return JsonResponse(data={ "error": True, "message":"user_not_exists" })
			user_token = UserRecoveryToken.objects.filter(user=user.id, active = True).first()
			# print(user_token)
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
				# user
				user_stats = WeekStat.objects.filter(week__user_id = user_id, active = True).annotate(week_number= F("week__week_number"), week_start= F("week__week_start"), unit=F("stat_type_id__unit"), stat_name=F("stat_type_id__name")).order_by('week_start','stat_type_id').distinct('week_start','stat_type_id')
				if( user_stats):
					res = {}
					for stat in list(user_stats.values()):
						if stat['stat_type_id'] in res:
							res[ stat['stat_type_id'] ]['labels'].append(stat['week_start'])
							res[ stat['stat_type_id'] ]['value'].append( float(stat['value']) )
						else:
							res[ stat['stat_type_id'] ] = {
								'labels' : [ stat['week_start'] ],
								'value' : [ float(stat['value']) ],
								'unit' : stat['unit'],
								'stat' : stat['stat_name']
							}
					return JsonResponse(data={"error": False, 'data':  { 'info':res, 'has_data': True} })
				stats = list(Stat.objects.all().values())
				return JsonResponse(data={"error": False, 'data': { 'info':stats, 'has_data':False} })
			return JsonResponse(data={"error": True, "message": 'user_not_exists'})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def post(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			# week = 1

			data['weight'] = round(float(data['weight']), 2)
			data['imc'] = round(float(data['imc']), 2)
			data['diameter'] = round(float(data['diameter']), 2)

			if not ( data['user_id'] and data['imc'] and data['weight'] and data['diameter']):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })

			week_day = date.today().isocalendar()
			current_start = date.today() - timedelta(days=(week_day[2]) - 1)
			current_week = UserWeek.objects.filter(active = True, week_start= current_start)

			if not current_week :
				last_week =  UserWeek.objects.filter(active = True).order_by('-week_number').first()
				if not last_week :
					current_week = UserWeek.objects.create(user_id = data['user_id'], week_number = 1, week_start = current_start,has_stats = True)
				else:
					current_week = UserWeek.objects.create(user_id = data['user_id'], week_number = last_week.week_number + 1, week_start = current_start,has_stats = True)
			else:
				current_week.update(has_stats = True)
			stats = []

			stats.append(WeekStat(value=data['imc'],stat_type_id=2, week = current_week[0]))
			stats.append(WeekStat(value=data['weight'], stat_type_id=3, week = current_week[0]))
			stats.append(WeekStat(value=data['diameter'], stat_type_id=4, week = current_week[0]))
			WeekStat.objects.bulk_create( stats )

			return JsonResponse(data={"error": False})


		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})



class ScaleView(APIView):
	def get(self, request, *args, **kwargs):
		try:
			user_id = request.GET.get('user_id','')
			user_type = User.objects.filter(id = user_id).annotate(scale_identifier= F("scale__access_code") ).first()
			if user_type.user_type:
				if user_type.user_type.id == 5:
					user_type.user_type = UserType.objects.get(id = 1)
					user_type.scale = None
					user_type.save()
					return JsonResponse(data={"error": False, 'user_type': 5 })
				if user_type.user_type.id == 3:
					current_users = list(User.objects.filter( Q(scale = user_type.scale) & Q(active= True ) & ~Q(id= user_id) ).values('first_name', 'last_name', 'id', 'user_type'))
					return JsonResponse(data={"error": False, 'user_type': user_type.user_type.id, 'current_users': current_users, 'scale_id':user_type.scale_id, 'scale_identifier':user_type.scale_identifier, 'username':user_type.scale_name })
				return JsonResponse(data={"error": False, 'user_type': user_type.user_type.id, 'scale_identifier':user_type.scale_identifier, 'username':user_type.scale_name })
			return JsonResponse(data={"error": True, "message": 'incomplete_data' })
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def post(self, request, *args, **kwargs):
		try:
			data = request.POST.dict()
			if  not ('user_id' in data and 'scale_code' in data and 'scale_name' in data) :
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			scale = Scale.objects.filter(access_code=data['scale_code'], active= True).first()
			if not scale:
				return JsonResponse(data={"error": True,  "message":"scale_not_exists"})
			has_reset = ScaleUpdate.objects.filter(scale_id = scale.id, update_type_id = 6, active = True )
			if has_reset :
				return JsonResponse(data={"error": True,  "message":"scale_must_restart"})
			users = User.objects.filter(scale=scale, active= True)
			user = User.objects.filter(id = data['user_id']).first()
			if users:
				for scale_user in users:
					if scale_user.scale_name == data['scale_name'] :
						return JsonResponse(data={"error": True,  "message":"scale_name_repeated"})
				user.user_type = UserType.objects.get(name='pending user');
			else:
				user.user_type = UserType.objects.get(name='scale administrator');
				ScaleUpdate.objects.create(user_id = user.id, scale_id = scale.id, update_type_id = 3 )
				has_pending = Inventory.objects.filter(user_id = user.id, type_id=2, ingredient_id__type_id=2)
				if has_pending:
					ScaleUpdate.objects.create(user_id = user.id, scale_id = scale.id, update_type_id = 5 )
			user.scale_name = data['scale_name']
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
				ScaleUpdate.objects.filter(user_id = user.id, scale = user.scale, update_type_id = 5 ).update(active = False)

			elif 'admin_id' in data :
				User.objects.filter(id= data['admin_id']).update( user_type_id = 2 )
			elif data['status_id'] == '2':
				pending_update = ScaleUpdate.objects.filter(active=True, user = user, update_type_id = 4).first()
				if pending_update:
					pending_update.active = False
					pending_update.save()
				else:
					ScaleUpdate.objects.create(user_id = user.id, scale = user.scale, update_type_id = 3 )
				has_pending = Inventory.objects.filter(user_id = user.id, type_id=2, ingredient_id__type_id=2)
				if has_pending:
					ScaleUpdate.objects.create(user_id = user.id, scale = user.scale, update_type_id = 5 )
			user.save()
			return JsonResponse(data={'error': False }, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def delete(self, request, *args, **kwargs):
		try:
			user_id_s = request.GET.get('user_id','-1')
			user_id = int(user_id_s)
			user = User.objects.filter(id = user_id).first()
			# print(user.user_type_id)
			if user.user_type_id != 3 :
				return JsonResponse(data={"error": True,  "message":"user_not_administrator"})
			User.objects.filter(scale = user.scale).update(scale_id = None, user_type_id = 1)
			ScaleUpdate.objects.filter(scale = user.scale, active = True).update(active = False)
			ScaleUpdate.objects.create(scale = user.scale, user = user, update_type_id = 6)
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
			is_planning = int(request.GET.get('planning','0'))
			user_stock = Inventory.objects.filter(user_id = user_id, active= True, quantity__gt=0)
			if is_planning:
				user_stock = user_stock.filter(type_id = 1)
			else:
				user_stock = user_stock.annotate(unit = Case(
					When(ingredient__type_id = 1, then=Value('pzs')),
					When(ingredient__type_id = 3, then=Value('ml')),
					When(ingredient__type_id = 2, then=Value('gr')),
					), ingredient_name=F('ingredient__name'))
			user_stock = list(user_stock.order_by('type_id','created_at').values())
			subidos = []
			pendientes = []
			units = {
				'gr' : 'Kg',
				'ml' : 'L',
			}

			current_items = {}
			# if is_planning :
			pending_items = {}
			# print("entra")
			for element in user_stock:
				if element['type_id'] == 1:
					if not is_planning:
						subidos.append(element)
					if not element['ingredient_id'] in current_items:
						current_items[ element['ingredient_id'] ] = element['quantity']
					else:
						current_items[ element['ingredient_id'] ] += element['quantity']
				else:
					if element['ingredient_id'] in current_items:
						aux = current_items[ element['ingredient_id'] ]
						if aux == element['quantity']:
							del current_items[ element['ingredient_id'] ]
						elif aux > element['quantity']:
							current_items[ element['ingredient_id'] ] = current_items[ element['ingredient_id'] ] - element['quantity']
						else :
							element['quantity'] -= aux	
							del current_items[ element['ingredient_id'] ]			
							pendientes.append(element)
					else: 
						pendientes.append(element)
			if is_planning :
				return JsonResponse(data={'error': False, 'subidos' : current_items }, safe=False)
			for element in user_stock:
				if element['quantity'] >= 1000 and element['unit'] in units:
					element['quantity'] = element['quantity'] / 1000
					element['unit'] = units[ element['unit'] ]

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
			# pending = Inventory.objects.filter(active= True, type_id=2, user_id= data['user_id'])

			# index_pending = {}
			# for pen in pending:
				# index_pending[ pen.ingredient_id ] = pen
			to_bulk = []
			# to_update = []
			for ing in data['ingredients']:
				# if ing['id'] in index_pending:
					# index_pending[ ing['id'] ].quantity -= ing['quantity']
					# to_update.append( index_pending[ ing['id'] ] )
				to_bulk.append( Inventory(quantity=ing['quantity'], ingredient_id=ing['id'], user_id=data['user_id'], type_id=ing['type']) )
			Inventory.objects.bulk_create( to_bulk )
			# if len(to_update) > 0 :
				# Inventory.objects.bulk_update( to_update, ['quantity'] )
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
				# print(data)
				updated = Inventory.objects.filter(id= data['item_id']).first()
				# pending = Inventory.objects.filter(active = True, ingredient_id = data['item_id'], type_id = 2 ).first()
				# if pending:
					# pending.quantity += updated.quantity
					# pending.save()
				updated.active = False
				updated.save()
				return JsonResponse(data={'error': False}, safe=False)
			# pending = Inventory.objects.filter(active = True, ingredient_id = data['ingredient_id'], type_id = 2 ).first()
			# if pending:
				# pending.quantity += float(data['difference'])
				# pending.save()
			Inventory.objects.filter(id= data['item_id']).update(quantity=data['quantity'], ingredient_id=data['ingredient_id'], type_id=data['type'])
			return JsonResponse(data={'error': False}, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})
	def delete(self, request, *args, **kwargs):
		try:
			user_id = int(request.GET.get('user_id','0'))
			to_delete = literal_eval(request.GET.get('to_delete', "[]"))

			if user_id <= 0 :
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			if len(to_delete) == 0:
				week_day = date.today().isocalendar()
				current_start = date.today() - timedelta(days=(week_day[2]) - 1)
				UserWeek.objects.filter(active = True, week_start= current_start).update(inventory_updated = True)
				return JsonResponse(data={"error": False, 'to_delete':to_delete })
			deactivated = Inventory.objects.filter(user_id = user_id, id__in=to_delete)

			# to_check = []
			# to_modify = {}
			# for item in deactivated:
				# to_check.append(item.ingredient_id)
				# to_modify[item.ingredient_id] = item.quantity
			deactivated.update(active = False)
			# pending = Inventory.objects.filter(user_id = user_id, ingredient_id__in = to_check, type_id = 2)
			# for item in pending :
				# print(item)
				# if item.ingredient_id in to_modify:
					# item.quantity +=  to_modify[ item.ingredient_id ]
					# print("hecho")
					# del to_modify[ item.ingredient_id ]
			# print("termina")
			# Inventory.objects.bulk_update( pending, ['quantity'])

			week_day = date.today().isocalendar()
			current_start = date.today() - timedelta(days=(week_day[2]) - 1)
			UserWeek.objects.filter(active = True, week_start= current_start).update(inventory_updated = True)

			# print(user_id)
			# print(to_delete)
			return JsonResponse(data={"error": False, 'to_delete':to_delete })
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

class EmbebbedScaleView(APIView):

	def get(self, request, *args, **kwargs):
		try:
			access_code = request.GET.get('access_code','')
			# print(access_code)
			if not access_code:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			scale = Scale.objects.filter(access_code= access_code, active=True).first()
			if not scale:
				return JsonResponse(data={"error": True,  "message":"scale_not_exists"})

			updates = ScaleUpdate.objects.filter(scale=scale, active=True).annotate(username=F('user_id__scale_name')).order_by('update_type_id').values()

			format_updates = {
				'add':'',
				'delete': '',
				'ingredients': ''
			}
			not_checked = []
			for update in updates:
				# print(update['update_type_id'])
				if update['update_type_id'] == 6:
					ScaleUpdate.objects.filter(scale=scale, active=True).update(active = False)	
					return JsonResponse(data={"error": False,  "reset": True})
				if update['update_type_id'] == 3:
					format_updates['add'] += update['username'] + ',4,' +str(update['user_id']) + ' '
				if update['update_type_id'] == 4:
					format_updates['delete'] += update['username'] + ','
				if update['update_type_id'] == 5:
					if update['username'] in format_updates['delete']:
						continue
					else:
						# print("obteniendo ingredientes")
						# print("id_usuario: ",update['user_id'])
						pending = Inventory.objects.filter(user_id = update['user_id'], active = True, type_id=2, ingredient_id__type_id=2, quantity__gt= 0)\
						.annotate(ingredient_name=F('ingredient_id__name')).order_by('ingredient_name').values()
						if len(pending) > 0:
							format_updates['ingredients'] += update['username'] +';' 
							# user_ingr = format_updates['ingredients'][update['username']]

							for pen in pending:
								# print(pen['ingredient_name'])
								format_updates['ingredients'] += unidecode.unidecode(pen['ingredient_name']) + ',1,' + str(pen['ingredient_id']) + '#'
							format_updates['ingredients'] += ';'
			ScaleUpdate.objects.filter(scale=scale, active=True).update(active = False)			
			return JsonResponse(data={"error": False, 'scale#delete': format_updates['delete'], 'scale#add': format_updates['add'], 'scale#ingredients':format_updates['ingredients']})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def post(self, request, *args, **kwargs):
		try:
			data =  json.loads(request.body)
			# data =  request.POST.dict()
			is_pending = False
			print(data)
			print(data['user_id'])
			if not ( 'user_id' in data and 'access_code' in data and 'quantity' in data and 'ingredient_id' in data):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			scale = Scale.objects.filter(access_code= data['access_code'], active=True).first()
			if not scale:
				return JsonResponse(data={"error": True,  "message":"scale_not_exists"})
			others_created = Inventory.objects.filter(ingredient_id = data['ingredient_id'], active = True, type_id= 1).aggregate(Sum('quantity'))
			upload = Inventory.objects.create(quantity=int(data['quantity']), ingredient_id=data['ingredient_id'], type_id=1, user_id = data['user_id'])
			if others_created :
				total = int(data['quantity']) + others_created['quantity__sum']
			else:
				total = int(data['quantity'])
			all_pending = Inventory.objects.filter(ingredient_id = data['ingredient_id'], active= True, type_id= 2, user_id = data['user_id']).aggregate(Sum('quantity'))
			# print(all_pending)
			if all_pending['quantity__sum'] and all_pending['quantity__sum'] > total :
				is_pending = True
			# print(all_pending['quantity__sum'])
			# print(total)
			# pending = Inventory.objects.filter(active = True, quantity__gt=0 ,ingredient_id=data['ingredient_id'], user_id= data['user_id'], type_id= 2).first()
			# if pending:
				# pending.quantity -= float(data["quantity"])
				# pending.save()
				# if pending.quantity <= 0:
					# is_pending = False
			# else:

			### falta obtener si ya se cumplió con la cantidad requerida
			upload.save()

			return JsonResponse(data={"error": False, "pending": is_pending})
		except Exception as e:
			traceback.print_exc()
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def put(self, request, *args, **kwargs):
		try:
			data = json.loads(request.body)
			if not ('access_code' in data) :
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			scale = Scale.objects.filter(access_code= data['access_code'], active=True).first()
			if not scale:
				return JsonResponse(data={"error": True,  "message":"scale_not_exists"})
			if 'reset' in data:
				User.objects.filter(scale=scale, active=True).update(user_type_id=1, scale_id=None)
				ScaleUpdate.objects.filter(scale=scale, active=True).update(active = False)
				return JsonResponse(data={"error": False, "reset": True})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})




class TestSED(APIView):
	def get(self, request, *args, **kwargs):

		try:
			time = float( request.GET.get('time','0') )
			taste = float( request.GET.get('taste','0') )
			difficulty = float( request.GET.get('difficulty','0') )
			print(time,taste,difficulty)
			if time < 0 and taste < 0 and difficulty < 0:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			FS = sf.FuzzySystem()

			print("configurando sabor")
			taste_bad = sf.TrapezoidFuzzySet(a= 0, b=0, c=3.21, d= 6.23, term="bad")
			taste_ok = sf.TriangleFuzzySet(a=4,b=6,c=8, term="ok")
			taste_good = sf.TrapezoidFuzzySet(a= 6.3, b=8.5, c=10, d=10, term="good")

			FS.add_linguistic_variable("taste", sf.LinguisticVariable([taste_bad, taste_ok, taste_good], universe_of_discourse=[0,10]))

			print("configurando dificultad")
			difficult_easy = sf.TrapezoidFuzzySet(a= 0, b=0, c=3, d=5, term="easy")
			difficult_normal = sf.TriangleFuzzySet(a=3,b=5,c=7, term="normal")
			difficult_hard = sf.TrapezoidFuzzySet(a= 5, b=7, c=10, d=10, term="hard")

			FS.add_linguistic_variable("difficulty", sf.LinguisticVariable([difficult_easy, difficult_normal, difficult_hard], universe_of_discourse=[0,10]))

			print("configurando tiempo")
			time_good = sf.TrapezoidFuzzySet(a= 0, b=0, c=15, d=45, term="little")
			time_average = sf.TriangleFuzzySet(a=20,b=45,c=70, term="average")
			time_bad = sf.TrapezoidFuzzySet(a= 45, b=75, c=120, d=120, term="much")

			FS.add_linguistic_variable("time", sf.LinguisticVariable([time_good, time_average, time_bad], universe_of_discourse=[0,120]))

			print("configurando salida")
			little = sf.TrapezoidFuzzySet(a= 0, b=0, c=10, d=25, term="little")
			regular = sf.TriangleFuzzySet(a=10,b=27.5,c=45, term="regular")
			ok = sf.TriangleFuzzySet(a=25,b=50,c=75, term="ok")
			much = sf.TriangleFuzzySet(a=55,b=72.5,c=90, term="much")
			pretty = sf.TrapezoidFuzzySet(a= 75, b=90, c=100, d=100, term="pretty")


			FS.add_linguistic_variable("recommendation", sf.LinguisticVariable([little, regular, ok, much, pretty], universe_of_discourse=[0,100]))

			FS.add_rules([
				"IF (taste IS good) AND (time IS little) THEN (recommendation IS pretty)",
				"IF (taste IS good) AND (difficulty IS easy) AND (time IS average) THEN (recommendation IS pretty)",
				"IF (taste IS good) AND (difficulty IS normal) AND (time IS average) THEN (recommendation IS much)",
				"IF (taste IS good) AND (difficulty IS hard) AND (time IS average) THEN (recommendation IS much)",
				"IF (taste IS good) AND (difficulty IS easy) AND (time IS much) THEN (recommendation IS much)",
				"IF (taste IS good) AND (time IS much) THEN (recommendation IS ok)",
				"IF (taste IS ok) AND (time IS little) THEN (recommendation IS ok)",
				"IF (taste IS ok) AND (difficulty IS easy) AND (time IS average) THEN (recommendation IS ok)",
				"IF (taste IS ok) AND (difficulty IS normal) AND (time IS average) THEN (recommendation IS regular)",
				"IF (taste IS ok) AND (difficulty IS hard) AND (time IS average) THEN (recommendation IS regular)",
				"IF (taste IS ok) AND (difficulty IS easy) AND (time IS much) THEN (recommendation IS regular)",
				"IF (taste IS ok) AND (time IS much) THEN (recommendation IS little)",
				"IF (taste IS bad) AND (time IS little) THEN (recommendation IS regular)",
				"IF (taste IS bad) THEN (recommendation IS little)",
				])

			FS.set_variable("time", time)
			FS.set_variable("taste", taste)
			FS.set_variable("difficulty", difficulty)

			response = FS.inference()
			return JsonResponse(data={'error': False, 'evaluation': response }, safe=False)
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})


class PlanningView(APIView):
	def get(self, request, *args, **kwargs):
		try:
			week_start =  request.GET.get('week_start',None) 
			user_id =  request.GET.get('user_id',None)
			# create = request.GET.get('create', False) == 'True'
			is_current_week = int(request.GET.get('current_week', '0'))

			if not week_start or not user_id:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })

			current_week = UserWeek.objects.filter(user_id= user_id, week_start = week_start, active = True)
			recipes = [
				[],
				[],
				[],
				[],
				[],
				[],
				[]
			]
			if not current_week :
				# if create :
				print("crear la semana")
				last_week =  UserWeek.objects.filter(active = True,user_id= user_id).order_by('-week_number').first()
				# week_day = date.today().isocalendar()
				# current_start = date.today() - timedelta(days=(week_day[2]) - 1)
				if not last_week :
					num = 1
					if not is_current_week:
						num = 2
					current_week = UserWeek.objects.create(user_id = user_id, week_number = num, week_start = week_start)
				else: #todas los registros anteriores se desactivan
					# WeekRecipe.objects.filter(week_id = last_week.id).update(status_id = 1)
					current_week = UserWeek.objects.create(user_id = user_id, week_number = last_week.week_number + 1, week_start = week_start)
					#se deben desactivar, semanas, pendientes y recetas pasadas
					if last_week.week_number > 1:
						WeekRecipe.objects.filter(active=True, week__user_id= user_id, week__week_number__lt = last_week.week_number).update(active=False)
						Inventory.objects.filter(active=True, user_id= user_id, week__week_number__lt = last_week.week_number, type_id=2).update(active = False)
						UserWeek.objects.filter(active=True, user_id= user_id, week_number__lt = last_week.week_number).update(active = False)


				
				to_return = {
					"active": True,
					"has_stats": current_week.has_stats,
					"id": current_week.id,
					"inventory_updated": current_week.inventory_updated,
					"week_number": current_week.week_number,
					'total' : 0,
					'id': current_week.id,
					'week_done' : [0,0,0,0,0,0,0]
				}
				return JsonResponse( data = {'error': False, 'week_info': to_return, 'week_recipes' : recipes})
				# else :
					# return JsonResponse(data={"error": True, "message": 'week_not_exists' })

			current_week = list(current_week.values("has_stats","id","inventory_updated","week_number"))[0]
			if is_current_week:
				has_from_past_week = WeekRecipe.objects.filter(week_id = current_week['id'], active=True, status_id = 4)
				print(has_from_past_week)
				if has_from_past_week:
					has_from_past_week.update(status_id = 1)
			week_recipes = list(WeekRecipe.objects.filter(week_id = current_week['id'], active=True).values())

			recipes_to_collect = []
			done = [0,0,0,0,0,0,0]
			total = 0
			total_done = 0
			for recipe in week_recipes :
				week_date = (recipe['preparation_date'].isocalendar()[2]) -1
				total += 1
				recipes[ week_date ].append(recipe)
				if not ( recipe['recipe_id'] in recipes_to_collect):
					recipes_to_collect.append( recipe['recipe_id'] )
				if recipe['status_id'] == 2:
					total_done += 1
					done[ week_date ] += 1
				elif not is_current_week:
					done[week_date ] += 1
			# recipe_ingredient = RecipeIngredient.objects.filter(recipe_id = OuterRef('pk'))
			recipes_data =  Recipe.objects.filter(active = True, id__in=recipes_to_collect)
			rate_data = list(UserRecipe.objects.filter(recipe_id__in=recipes_to_collect, user_id=user_id).values('count','last_evaluation','recipe_id'))
			rate_info = {}
			for recipe in rate_data:
				rate_info[ recipe['recipe_id'] ] = {'last_evaluation': recipe['last_evaluation'], 'count':recipe['count']}
			# recipes_data =  Recipe.objects.filter(active = True, id__in=recipes_to_collect).annotate(ingredients_list = Subquery(recipe_ingredient.values()[:1] ) )
			if recipes_data:
				recipes_data = list( recipes_data.values() )
			else:
				recipes_data = []

			for recipe_in in recipes_data :
				dict_ingredient = {}
				ingredients = list(RecipeIngredient.objects.filter(recipe_id = recipe_in['id']).values('ingredient_id','recipe_id', 'is_optional','quantity'))
				for ingredient in ingredients :
					dict_ingredient[ ingredient['ingredient_id'] ] = ingredient

				recipe_in['ingredient_list'] = dict_ingredient
				if recipe_in['id'] in rate_info :
					recipe_in['user_data'] = rate_info[ recipe_in['id'] ]
				else:
					recipe_in['user_data'] = {'last_evaluation': 0, 'count':0}

			current_week['total'] = total
			current_week['total_done'] = total_done
			current_week['week_done'] = done

			return JsonResponse( data = {'error': False, 'week_info': current_week, 'week_recipes' : recipes, 'recipes':recipes_data})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})
	def post(self, request, *args, **kwargs):
		try:	
			data = request.data

			if not ('to_add' in data and 'to_delete' in data and 'quantity' in data and 'user_id' in data and 'week_id' in data):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })

			to_add = json.loads(data['to_add'])
			to_delete = json.loads(data['to_delete'])
			quantity = json.loads(data['quantity'])

			bulk_create = []
			bulk_update = []
			
			for add in to_add :
				new = WeekRecipe(recipe_id = add['recipe_id'], week_id = data['week_id'], status_id=4, quantity = add['quantity'], preparation_date = add['preparation_date'] )
				bulk_create.append(new)
			WeekRecipe.objects.bulk_create(bulk_create)
			if len(to_delete) > 0: #checar algun dia la eficencia de buscar todos y luego solo actualizar los necesarios o buscar uno por uno
				with transaction.atomic():
					for delete in to_delete:
						WeekRecipe.objects.filter(id =delete['id']).update(quantity = delete['quantity'], preparation_date = delete['preparation_date'], active=delete['active'])
			item_update = []
			item_create = []
			if len(quantity) > 0:
				items = Inventory.objects.filter(active = True, week_id= data['week_id'], type_id = 2)
				if items:
					for item in items:
						key = str(item.ingredient_id)
						if key in quantity :
							item.quantity += quantity[ key ]
							del quantity[ key ]
							item_update.append( item )
				print(quantity)
				for ingredient in quantity :
					item_create.append( Inventory( ingredient_id = ingredient, quantity= quantity[ingredient], 
													user_id = data['user_id'], type_id = 2, week_id = data['week_id']) )

				Inventory.objects.bulk_update(item_update, ['quantity'])
				Inventory.objects.bulk_create(item_create)

				user_info = User.objects.filter(id = data['user_id']).values()[0]
				if user_info['user_type_id'] == 2 or user_info['user_type_id'] == 3:
					has_update = ScaleUpdate.objects.update_or_create(active= True, update_type_id=5, user_id = user_info['id'], scale_id=user_info['scale_id'])





			return JsonResponse( data = {'error': False } )
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})
	def put(self, request, *args, **kwargs):
		try:
			# print("entra")
			data = request.POST.dict()
			# print(data)
			if not ('user_recipe' in data  and  'quantity' in data  and 'status_id' in data):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			recipe_id = WeekRecipe.objects.filter(id=data['user_recipe'], active=True)
			ingredients = RecipeIngredient.objects.filter( recipe_id = recipe_id[0].recipe_id, active=True ).values()
			user_id = list(WeekRecipe.objects.filter( id=data['user_recipe'], active=True ).annotate(user_id=F('week__user_id')).values('user_id'))[0]['user_id']
			to_update = {}
			# print(to_update)
			for  ingredient in ingredients:
				to_update[ ingredient['ingredient_id'] ] = ingredient['quantity']
			new_inventory = []
			if data['status_id'] == '1':
				inventory = Inventory.objects.filter(active = True, type_id = 2, user_id=user_id).order_by("created_at")
			else:
				inventory = Inventory.objects.filter(active = True, type_id = 2, quantity__gt=0, user_id=user_id).order_by("created_at")
			print('inicia')
			for ingredient in inventory :
				print(to_update)
				if ingredient.ingredient_id in to_update :
					# print(ingredient.quantity)
					if data['status_id'] == '3':
						ingredient.quantity -= to_update[  ingredient.ingredient_id ]
					else:
						ingredient.quantity += to_update[  ingredient.ingredient_id ]
					# print(ingredient.quantity)
					new_inventory.append( ingredient )
					del to_update[  ingredient.ingredient_id ]
			print("termina")
			Inventory.objects.bulk_update( new_inventory, ['quantity'])
			recipe_id.update(status_id=data['status_id'], quantity=data['quantity'])
			user_info = User.objects.filter(id = user_id).values()[0]
			if user_info['user_type_id'] == 2 or user_info['user_type_id'] == 3:
				has_update = ScaleUpdate.objects.update_or_create(active= True, update_type_id=5, user_id = user_info['id'], scale_id=user_info['scale_id'])
			return JsonResponse(data={"error": False})
		except Exception as e:
			print(e)
			print("hubo un error")
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})


class RecipeEvaluationView(APIView):
	def post(self, request, *args, **kwargs):
		try:

			data =  request.POST.dict()
			print(data)

			if not ( ( ('time' in data  and  'taste' in data  and 'difficulty' in data ) or 'no_evaluation' in data)  and 'user_recipe' in data and 'recipe_id' in data and 'user_id' in data and 'items_used' in data):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })

			items_used = json.loads(data['items_used'])
			if 'time' in data:
				sed.FS.set_variable("time", data['time'])
				sed.FS.set_variable("taste", data['taste'])
				sed.FS.set_variable("difficulty", data['difficulty'])
				evaluation = sed.FS.inference()['recommendation']
			else:
				evaluation = 0.00
			print("resultado: ", evaluation)
			has_evaluation = UserRecipe.objects.filter(user_id=data['user_id'], recipe_id = data['recipe_id'])
			if has_evaluation:
				has_evaluation.update( count = F('count') + 1, last_evaluation= round(evaluation,2), updated_at= datetime.now() )
			else:
				UserRecipe.objects.create( count = 1, last_evaluation = round(evaluation,2), recipe_id = data['recipe_id'], user_id= data['user_id'] )
			recipe = WeekRecipe.objects.filter(id=data['user_recipe'], active= True)
			week_id = recipe[0].week_id			
			recipe.update( status_id=2 )
			to_update = []
			ingredients = Inventory.objects.filter( Q(active= True, user_id=data['user_id']) & ( Q(week_id= week_id, type_id = 2) | Q(type_id = 1) ) )
			print("antes")
			for ingredient in ingredients :
				print(ingredient)
				key = str(ingredient.ingredient_id)
				if key in items_used :
					if(ingredient.type_id == 2):
						ingredient.quantity -= items_used[ key ]['original']
						to_update.append( ingredient )
					elif 'used' in items_used[ key ]:
						if items_used[ key ]['used'] > ingredient.quantity :
							items_used[ key ]['used'] -= ingredient.quantity
							ingredient.quantity = 0
							ingredient.active = False
						else : #<=
							aux = ingredient.quantity
							ingredient.quantity -= items_used[ key ]['used']
							items_used[ key ]['used'] -= aux
							print(aux,ingredient.quantity,items_used[ key ]['used'])
							del items_used[ key ]['used']
							if ingredient.quantity == 0:
								ingredient.active = 0
						to_update.append( ingredient )
					print(ingredient)
					# del items_used[ key ]
			Inventory.objects.bulk_update(to_update, ['quantity','active'] )
			# print("resultado: ", evaluation)
			return JsonResponse( data = {'error': False, 'evaluation':evaluation})
		except Exception as e:
			traceback.print_exc()
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

class RecommendationView(APIView):

	def get_by_stock(self,data,recipe_info):
		try:
			to_add = []
			recipe_list = []
			ingredients_ids = []
			for key in data['ingredients'] :
				ingredients_ids.append( key )
			to_obtain = RecipeIngredient.objects.filter(Q(active= True, is_optional= False, ingredient_id__in=ingredients_ids) 
				& ~Q(recipe_id__in=data['not_include']) ).order_by('recipe_id').distinct('recipe_id').values_list('recipe_id', flat=True)
			if to_obtain :
				user_cal = UserRecipe.objects.filter(user_id = data['user_id'], recipe_id = OuterRef('pk'))
				recipes = list(Recipe.objects.filter(active = True, id__in=to_obtain).annotate(cal=Subquery(user_cal.values("last_evaluation")[:1]) ).values() )#faltan los ingredientes necesarios
				rate_info = {}
				rate_data = list(UserRecipe.objects.filter(recipe_id__in=to_obtain, user_id=data['user_id']).values('count','last_evaluation','recipe_id'))
				for recipe in rate_data:
					rate_info[ recipe['recipe_id'] ] = {'last_evaluation': recipe['last_evaluation'], 'count':recipe['count']}
				ingredients = list(RecipeIngredient.objects.filter(active=True, recipe_id__in=to_obtain, is_optional= False).order_by('recipe_id').values())
				previous_id = ingredients[0]['recipe_id']
				current_recipe = {}
				ingredients_data = {} 
				#se necesita guardar la suma de los porcentajes de cada ingrediente
				#y su calificación
				total = 0
				#obteniendo los ingredientes juntos por receta y su porcentaje con respecto al stock actual
				for ingredient in ingredients:
					# print(ingredient)
					key = str(ingredient['ingredient_id'])
					if previous_id != ingredient['recipe_id']:
						total = round(total / len(current_recipe))
						ingredients_data[ previous_id ] = {'percentage':total,'ingredients':current_recipe}
						current_recipe = {}
						# print("total: ",total)
						total = 0
						previous_id = ingredient['recipe_id']

					current_recipe[ ingredient['ingredient_id'] ] = ingredient
					if key in data['ingredients'] :
						# key_ingr = ingredient['ingredient_id']
						if data['ingredients'][ key ] >= ingredient['quantity'] :
							total += 100
						else:
							total += (data['ingredients'][ key ] * 100) / ingredient['quantity']
				total = round( total / len(current_recipe) )
				# print("total: ",total)
				ingredients_data[ previous_id ] = {'percentage':total,'ingredients':current_recipe}
				for recipe in recipes:
					if recipe['cal'] == None:
						recipe['cal'] = 0.0
					else:
						recipe['cal'] = float( recipe['cal'])
					recipe_list.append({'recipe_id':recipe['id'],
										'ingredient_percentage':ingredients_data[recipe['id']]['percentage'],
										'user_evaluation': recipe['cal'] })
					recipe['ingredient_list'] =  ingredients_data[ recipe['id'] ]['ingredients']
					if recipe['id'] in rate_info :
						recipe['user_data'] = rate_info[ recipe['id'] ]
					else:
						recipe['user_data'] = {'last_evaluation': 0, 'count':0}
					ingredients_data[ recipe['id'] ] = recipe
				has_more = False

				if len(recipe_list) - data['limit'] > 0:
					has_more = True
				recipe_list = sorted(recipe_list, key = lambda k: (-k["ingredient_percentage"], -k["user_evaluation"]))[: data['limit']]
				ids = []
				for ele in recipe_list :
					key = ele['recipe_id']
					if not key in recipe_info:
						recipe_info[ key ] = 1
						to_add.append( ingredients_data[ key ] )
					ids.append(key)

				return to_add, {'recipe':recipe_list,'has_more':has_more, 'not_include':ids}
			else:
				return [],{'recipe':[], 'has_more':False,'not_include':[]}

		except Exception as e:
			# print("aqui")
			print(e)
			return [],{'recipe':[], 'has_more':False,'not_include':[]}
	def get_by_recommendation(self,data,recipe_info):
		try:
			to_add = []
			recipe_list = []
			ids = []
			key_ingr = ''
			recipes = list(UserRecipe.objects.filter( Q(user_id=data['user_id']) & ~Q(recipe_id__in=data['not_include'])).annotate(name=F("recipe__name"),
				description=F('recipe__description'),image_url=F('recipe__image_url'), sodium=F("recipe__sodium"), carbohydrates=F("recipe__carbohydrates"),
				cholesterol=F("recipe__cholesterol"), total_time=F("recipe__total_time"), portions=F("recipe__portions")).order_by('last_evaluation','count').values())
			if len(recipes):
				has_more = (len(recipes) - data['limit']) > 0
				recipes = recipes[: data['limit']]
				for recipe in recipes :
					ingredients = list(RecipeIngredient.objects.filter(recipe_id = recipe['recipe_id'], is_optional= False, active= True ).values())
					total = 0
					ingredient_dict = {}
					# print("entrando")
					for ingredient in ingredients:
						key_ingr = str(ingredient['ingredient_id'])
						if key_ingr in data['ingredients']:
							if data['ingredients'][ key_ingr ] >= ingredient['quantity']:
								total += 100
							else:
								total += (data['ingredients'][ key_ingr ] * 100) / ingredient['quantity']
						ingredient_dict[ ingredient['ingredient_id'] ] = ingredient
					total = round( total / len(ingredients) )
					if recipe['last_evaluation'] == None:
			 			recipe['last_evaluation'] = 0.0
					else:
			 			recipe['last_evaluation'] = float( recipe['last_evaluation'])
					recipe_list.append({'recipe_id':recipe['recipe_id'],
				 		'ingredient_percentage': total,
				 		'last_evaluation' : recipe['last_evaluation'],
				 		'count': recipe['count'],
				 		})
					if not recipe['recipe_id'] in recipe_info:
				 		recipe['ingredient_list'] = ingredient_dict
				 		aux = {
				 			'id': recipe['recipe_id'],
				 			'name': recipe['name'],
				 			'description': recipe['description'],
				 			'image_url': recipe['image_url'],
				 			'sodium': recipe['sodium'],
				 			'carbohydrates': recipe['carbohydrates'],
				 			'cholesterol': recipe['cholesterol'],
				 			'total_time': recipe['total_time'],
				 			'portions': recipe['portions'],
				 			'ingredient_list' : ingredient_dict,
				 			'user_data':{ 'last_evaluation' : recipe['last_evaluation'],
				 				'count': recipe['count']} 
				 		}
				 		to_add.append(aux)
				 		recipe_info[ recipe['recipe_id'] ] = 1
					ids.append( recipe['recipe_id'])
				recipe_list = sorted(recipe_list, key = lambda k: (-k["last_evaluation"], -k['count'],-k["ingredient_percentage"]))[: data['limit']]
				return to_add, {'recipe':recipe_list,'has_more':has_more, 'not_include':ids}
			else:
				return [],{'recipe':[], 'has_more':False,'not_include':[]}

		except Exception as e:
			# print("hubo un error")
			traceback.print_exc()
			print(e)
			return [],{'recipe':[], 'has_more':False,'not_include':[]}

	def get_by_count(self,data,recipe_info):
		try:
			to_ignore = UserRecipe.objects.filter( Q(user_id = data['user_id']) & ~Q(recipe_id__in=data['not_include']) ).order_by('-count')
			id_to_ignore = []
			recipe_list = []
			to_add = []
			has_more = False
			ids = []
			for recipe in to_ignore:
				id_to_ignore.append(recipe.recipe_id)
			id_to_ignore += data['not_include']
			to_check = Recipe.objects.filter( Q(active= True) & ~Q(id__in=id_to_ignore) )
			ingredients = list(RecipeIngredient.objects.filter( active= True, recipe_id__in=to_check, is_optional= False).order_by('recipe_id').values())

			ingredients_dict = {}
			ingredients_data = {}
			total = 0
			if len(ingredients):
				previous_id = ingredients[0]['recipe_id']
				for ingredient in ingredients:
					key = str(ingredient['ingredient_id'])
					if previous_id != ingredient['recipe_id']:
						total = round(total / len(ingredients_dict))
						ingredients_data[ previous_id ] = {'percentage':total,'ingredients':ingredients_dict}
						ingredients_dict = {}
						total = 0
						previous_id = ingredient['recipe_id']
					ingredients_dict[ key ] = ingredient

					if key in data['ingredients']:
						if data['ingredients'][ key ] >= ingredient['quantity']:
							total += 100
						else:
							total += (data['ingredients'][ key ] * 100) / ingredient['quantity']
				total = round( total / len(ingredients_dict) )
				ingredients_data[ previous_id ] = {'percentage':total,'ingredients':ingredients_dict}
				for recipe in list(to_check.values()):
					recipe_list.append({'recipe_id': recipe['id'], 'ingredient_percentage': ingredients_data[ recipe['id'] ]['percentage']})
					recipe['ingredient_list'] = ingredients_data[ recipe['id'] ]['ingredients']
					recipe['user_data'] = {'count': 0, 'last_evaluation':0}
					ingredients_data[ recipe['id'] ] = recipe
			# recipe_list = recipe_list[:1]
			if len(recipe_list) - data['limit'] > 0:
				# print("tiene todos")
				# print(recipe_list)
				has_more = True
				recipe_list = sorted(recipe_list, key = lambda k: (-k["ingredient_percentage"]))[: data['limit']]
			else:
				# print("no tiene")
				recipe_list = sorted(recipe_list, key = lambda k: (-k["ingredient_percentage"]))[: data['limit']]
				# print("revisando new")
				new = list(to_ignore.values()) #from 1 to 3
				# print(new)
				if len(new) - (data['limit'] -len(recipe_list)) > 0:
					has_more = True
				# print(len(recipe_list))
				# print(data['limit'])
				new = new[: data['limit'] - len(recipe_list) ]
				# print(new)
				#falta la información de las recetas, sus ingredientes y cuanto tiene de la receta en ingredientes
				recipe_ids = []
				count_info = {}
				# print("revisando recetas")
				for ele in new :
					recipe_ids.append( ele['recipe_id'])
					count_info[ ele['recipe_id'] ] = ele['count']
				# print("sale de revisar")
				# print(recipe_ids)
				to_check = Recipe.objects.filter( Q(active= True) & Q(id__in=recipe_ids) )
				ingredients = list(RecipeIngredient.objects.filter( active= True, recipe_id__in=to_check, is_optional= False).order_by('recipe_id').values())
				ingredients_dict = {}
				# ingredients_data = {}
				total = 0
				if len(ingredients):
					last = ingredients[0]['recipe_id']
					# print("revisando ingredientes")
					for ingredient in ingredients:
						key = str(ingredient['ingredient_id'])
						if last != ingredient['recipe_id']:
							total = round( total / len(ingredients_dict) )
							ingredients_data[ last ] = {'percentage':total,'ingredients':ingredients_dict}
							ingredients_dict = {}
							total = 0
							last = ingredient['recipe_id']
						ingredients_dict[ ingredient['ingredient_id'] ] = ingredient
						if key in data['ingredients']:
				 			if data['ingredients'][ key ] >= ingredient['quantity']:
				 				total += 100
				 			else:
				 				total += (data['ingredients'][ key ] * 100) / ingredient['quantity']
					aux = []
					total = round( total / len(ingredients_dict) )
					ingredients_data[ last ] = {'percentage':total,'ingredients':ingredients_dict}
					# print("revisando recetas")
					# print(ingredients_data)
					# print(to_check)
					for recipe in list(to_check.values()):
				 		aux.append({'recipe_id': recipe['id'], 'ingredient_percentage': ingredients_data[ recipe['id'] ]['percentage'], 'count': count_info[ recipe['id'] ], 
				 			'user_data': {'last_evaluation': ele['last_evaluation'], 'count': ele['count']} })
				 		recipe['ingredient_list'] = ingredients_data[ recipe['id'] ]['ingredients']
				 		ingredients_data[ recipe['id'] ] = recipe
					# print("ultimos toques")
					aux = sorted(aux, key = lambda k: (k["count"],-k["ingredient_percentage"]))
					# print(aux)
					recipe_list += aux
			for ele in recipe_list :
				key = ele['recipe_id']
				# print(key)
				if not key in recipe_info:
					recipe_info[ key ] = 1
					to_add.append( ingredients_data[ key ] )
				ids.append(key)
			# print("regresando")
			return to_add,{'recipe':recipe_list, 'has_more':has_more,'not_include':ids}
		except Exception as e:
			print("hay un error")
			print(e)
			traceback.print_exc()
			return [],{'recipe':[], 'has_more':False,'not_include':[]}

	def get_by_type(self,data,recipe_info,type_id):
		try:
			recipe_list = []
			to_add = []
			start = data['offset']
			end = data['offset'] + data['limit']
			# print("revisando")
			# print(start,end)
			has_more = False
			recipes = list(Recipe.objects.filter(active = True, type_id=type_id).order_by('name').values())
			if len(recipes[start:]) > data['limit']:
				has_more = True
			recipes = recipes[start:end]
			if len(recipes):
				recipe_data = {}
				recipes_ids = []
				for recipe in recipes:
					recipe['user_data'] = {'count': 0, 'last_evaluation':0}
					recipe_data[ recipe['id'] ] = recipe
					recipes_ids.append( recipe['id'] )
				count_info = list(UserRecipe.objects.filter(user_id=data['user_id'],recipe_id__in=recipes_ids).values('recipe_id','count','last_evaluation'))
				for recipe in count_info:
					recipe_data['user_data'] = {'count': recipe['count'],
						'last_evaluation':recipe['last_evaluation']}
				ingredients = list(RecipeIngredient.objects.filter(recipe_id__in=recipes_ids, active = True, is_optional= False).order_by('recipe_id').values())
				ingredients_dict = {}
				# ingredients_data = {}
				total = 0
				previous_id = ingredients[0]['recipe_id']
				for ingredient in ingredients:
					# print(ingredient)
					key = str(ingredient['ingredient_id'])
					if previous_id != ingredient['recipe_id']:
						total =  round( total / len(ingredients_dict) )
						recipe_data[ previous_id ]['ingredient_list'] = ingredients_dict
						# print("tratando")
						recipe_list.append({'recipe_id':previous_id,'ingredient_percentage': total })
						if not previous_id in recipe_info:
							recipe_info[ previous_id ] = 1
							to_add.append( recipe_data[ previous_id ] )
						ingredients_dict = {}
						total = 0
						previous_id = ingredient['recipe_id']

					ingredients_dict[ ingredient['ingredient_id'] ] = ingredient

					if key in data['ingredients']:
						if data['ingredients'][ key ] >= ingredient['quantity']:
							total += 100
						else:
							total += (data['ingredients'][ key ] * 100) / ingredient['quantity']			
				total = round( total / len(ingredients_dict) )
				recipe_data[ previous_id ]['ingredient_list'] = ingredients_dict
				recipe_list.append({'recipe_id':previous_id, 'ingredient_percentage': total })
				if not previous_id in recipe_info:
					recipe_info[ previous_id ] = 1
					to_add.append( recipe_data[ previous_id ] )
				return to_add,{'recipe':recipe_list, 'has_more':has_more,'offset': end}

			else:
				return [],{'recipe':[], 'has_more':False,'offset':0}
			#ingredients = list(RecipeIngredient.objects.filter(recipe_id__in=recipes))
		except Exception as e:
			# print("hay un error")
			traceback.print_exc()
			print(e)
			return [],{'recipe':[], 'has_more':False,'offset':[]}

	def get(self, request, *args, **kwargs):
		try:
			are_all =  request.GET.get('all','False')  == 'True'
			user_id =  int( request.GET.get('user_id', '0') )
			ingredients = literal_eval(request.GET.get('ingredients', "[]"))
			offset = int( request.GET.get('offset', '0') )
			not_include = literal_eval(request.GET.get('not_include', "[]"))
			type_id = int( request.GET.get('type_id', '-1') )
			limit = int( request.GET.get('limit', '0') )

			recipe_info = {}
			if user_id <= 0 and not (type_id or are_all) and len(ingredients) <= 0 and limit <=0:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			if are_all:
				to_return = []
				recipes = []
				data = {
					'user_id': user_id,
					'limit' : limit,
					'offset' : 0,
					'ingredients' : ingredients,
					'not_include' : []
					# 'ids' : ingredients_ids
				} #mandar data y recipe_info
				# print(ingredients)
				aux1, aux2 = self.get_by_stock(data,recipe_info)
				to_return.append(aux2)
				recipes += aux1
				aux1, aux2 = self.get_by_recommendation(data,recipe_info)
				to_return.append(aux2)
				recipes += aux1
				aux1, aux2 = self.get_by_count(data,recipe_info)
				# print(aux1,aux2)
				to_return.append(aux2)
				recipes += aux1
				aux1, aux2 = self.get_by_type(data,recipe_info,2)
				to_return.append(aux2)
				recipes += aux1
				aux1, aux2 = self.get_by_type(data,recipe_info,3)
				to_return.append(aux2)
				recipes += aux1
				aux1, aux2 = self.get_by_type(data,recipe_info,4)
				to_return.append(aux2)
				recipes += aux1
				return JsonResponse(data={"error": False,  "recommendations":to_return, 'recipes': recipes})

			data = {
					'user_id': user_id,
					'limit' : limit,
					'offset' : offset,
					'ingredients' : ingredients,
					'not_include' : not_include
					# 'ids' : ingredients_ids
			}
			if type_id == 0:
				res = self.get_by_stock(data,recipe_info)
			elif type_id == 1:
				res = self.get_by_recommendation(data,recipe_info)
			elif type_id == 2:
				res = self.get_by_count(data,recipe_info)
			elif type_id == 3:
				res = self.get_by_type(data,recipe_info,2)
			elif type_id == 4:
				res = self.get_by_type(data,recipe_info,3)
			elif type_id == 5:
				res = self.get_by_type(data,recipe_info,4)
			else:
				return JsonResponse(data={"error": True,  "message":"recommendation_type_not_exists"})
			return JsonResponse(data={'error':False, 'recommendation':res[1], 'recipes':res[0]})

		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

class RecipeView(APIView):
	def get(self, request, *args, **kwargs):
		try:
			recipe_id =  int( request.GET.get('recipe_id', '0') )
			all_flag = int(request.GET.get('all', '0'))
			if recipe_id <= 0 and not all_flag:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			if all_flag:
				recipes = list(Recipe.objects.filter(active = True).values('name','original_url','image_url'))
				return JsonResponse(data={"error": False,  'recipes': recipes})
			# pasos, ingredientes, (informacion basica ya esta en la receta)
			ingredients = list(RecipeIngredient.objects.filter(recipe_id= recipe_id, active = True).annotate(unit=Case(
					When(ingredient__type_id = 1, then=Value('pzs')),
					When(ingredient__type_id = 3, then=Value('ml')),
					When(ingredient__type_id = 2, then=Value('gr')),), ingredient_name=F('ingredient__name')).values())
			units = {
				'gr' : 'Kg',
				'ml' : 'L',
			}
			for element in ingredients :
				if element['quantity'] >= 1000 and element['unit'] in units:
					element['quantity'] = element['quantity'] / 1000
					element['unit'] = units[ element['unit'] ]
			steps = list(RecipeStep.objects.filter(recipe_id= recipe_id).annotate(type_name=F('type__name')).order_by('step_number').values() )
			return JsonResponse(data={"error": False,  'ingredients': ingredients, 'steps':steps})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

class PendingView(APIView):
	def get(self, request, *args, **kwargs):
		try:
			user_id =  int( request.GET.get('user_id', '0') )
			recipes = list(WeekRecipe.objects.filter(active = True, week_id__user_id=user_id, status_id__in=[1,4]).annotate(recipe_name=F('recipe__name'), start=F('week__week_start')).order_by('start','recipe_name').values('preparation_date','recipe_name','start'))
			inventory = list(Inventory.objects.filter(active=True, user_id= user_id, type_id=1, quantity__gt=0).values())
			pending_ingredients = list(Inventory.objects.filter(active=True, user_id=user_id, type_id=2, quantity__gt=0).annotate(ingredient_name=F('ingredient__name'), unit=Case(
					When(ingredient__type_id = 1, then=Value('pzs')),
					When(ingredient__type_id = 3, then=Value('ml')),
					When(ingredient__type_id = 2, then=Value('gr'))), start=F('week__week_start')).order_by('start','type_id','ingredient_name').values('ingredient_name','quantity','unit','start', 'ingredient_id'))
			units = {
				'gr' : 'Kg',
				'ml' : 'L',
			}
			current_inventory = {}
			for ingredient in inventory:
				if not ingredient['ingredient_id'] in current_inventory:
					current_inventory[ ingredient['ingredient_id'] ] = ingredient['quantity']
				else :
					current_inventory[ ingredient['ingredient_id'] ] += ingredient['quantity']
			ingredients_dict = {}
			recipe_dict = {}
			order = []
			for element in pending_ingredients :
				aux = element['start'].strftime("%d-%m-%Y")
				if element['ingredient_id'] in current_inventory:
					aux = current_inventory[ element['ingredient_id'] ] - element['quantity']
					if aux > 0: #más en el inventario
						current_inventory[ element['ingredient_id'] ] = aux
						continue
					elif aux < 0:
						element['quantity'] = aux * -1
						del current_inventory[ element['ingredient_id'] ]
					else:
						del current_inventory[ element['ingredient_id'] ]
						continue
				if element['quantity'] >= 1000 and element['unit'] in units:
					element['quantity'] = element['quantity'] / 1000
					element['unit'] = units[ element['unit'] ]		
				if not aux in ingredients_dict:
					ingredients_dict[ aux ] = [ element ]
					order.append(aux)
				else:
					ingredients_dict[ aux ].append( element )
				del element['start']

			for recipe in recipes:
				print(recipe)
				aux = recipe['start'].strftime("%d-%m-%Y")
				if not aux in recipe_dict:
					recipe_dict[ aux ] = {'recipe':[ recipe ], 'end': (recipe['start'] + timedelta(days=6)).strftime("%d-%m-%Y"), 'ingredients': ingredients_dict[ aux ] }
				else:
					recipe_dict[ aux ]['recipe'].append( recipe )
				del recipe['start']
			print("hola")
			return JsonResponse(data={"error": False,'info':recipe_dict, 'order':order})
		except Exception as e:
			traceback.print_exc()
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})