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
from django.db.models import F, Q, Case, When, Value, Max
from ast import literal_eval
import json
import unidecode

import traceback

import simpful as sf

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
			print(data)
			if not 'email' in data:
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			user = User.objects.filter(username = data['email']).first()
			print(user)
			if not user:
				return JsonResponse(data={ "error": True, "message":"user_not_exists" })
			user_token = UserRecoveryToken.objects.filter(user=user.id, active = True).first()
			print(user_token)
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
				user
				user_stats = WeekStat.objects.filter(week__user_id = user_id, active = True).annotate(week_number= F("week__week_number"));
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
			# week = 1

			data['weight'] = round(float(data['weight']), 2)
			data['imc'] = round(float(data['imc']), 2)
			data['diameter'] = round(float(data['diameter']), 2)

			if not ( data['user_id'] and data['imc'] and data['weight'] and data['diameter']):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })

			week_day = date.today().isocalendar()
			current_start = date.today() - timedelta(days=(week_day[2]) - 1)
			current_week = UserWeek.objects.filter(active = True, week_start= current_start).first()

			if not current_week :
				last_week =  UserWeek.objects.filter(active = True).order_by('-week_number').first()
				if not last_week :
					current_week = UserWeek.objects.create(user_id = data['user_id'], week_number = 1, week_start = current_start,has_stats = True)
				else:
					current_week = UserWeek.objects.create(user_id = data['user_id'], week_number = last_week.week_number + 1, week_start = current_start,has_stats = True)
			stats = []

			stats.append(WeekStat(value=data['imc'],stat_type_id=2, week = current_week))
			stats.append(WeekStat(value=data['weight'], stat_type_id=3, week = current_week))
			stats.append(WeekStat(value=data['diameter'], stat_type_id=4, week = current_week))
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
			print(user.user_type_id)
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

			updates = ScaleUpdate.objects.filter(scale=scale, active=True).annotate(username=F('user_id__scale_name')).order_by('update_type_id').values()

			format_updates = {
				'add':'',
				'delete': '',
				'ingredients': ''
			}
			not_checked = []
			for update in updates:
				print(update['update_type_id'])
				if update['update_type_id'] == 6:
					return JsonResponse(data={"error": False,  "reset": True})
				if update['update_type_id'] == 3:
					format_updates['add'] += update['username'] + ',4,' +str(update['user_id']) + ' '
				if update['update_type_id'] == 4:
					format_updates['delete'] += update['username'] + ','
				if update['update_type_id'] == 5:
					if update['username'] in format_updates['delete']:
						continue
					else:
						print("obteniendo ingredientes")
						print("id_usuario: ",update['user_id'])
						pending = Inventory.objects.filter(user_id = update['user_id'], active = True, type_id=2, ingredient_id__type_id=2, quantity__gt= 0)\
						.annotate(ingredient_name=F('ingredient_id__name')).order_by('ingredient_name').values()
						if len(pending) > 0:
							format_updates['ingredients'] += update['username'] +';' 
							# user_ingr = format_updates['ingredients'][update['username']]

							for pen in pending:
								print(pen['ingredient_name'])
								format_updates['ingredients'] += unidecode.unidecode(pen['ingredient_name']) + ',1,' + str(pen['ingredient_id']) + '#'
							format_updates['ingredients'] += ';'
			ScaleUpdate.objects.filter(scale=scale, active=True).update(active = False)			
			return JsonResponse(data={"error": False, 'scale#delete': format_updates['delete'], 'scale#add': format_updates['add'], 'scale#ingredients':format_updates['ingredients']})
		except Exception as e:
			print(e)
			return JsonResponse(data={"error": True,  "message":"internal_server_error"})

	def post(self, request, *args, **kwargs):
		try:
			print(request.body)
			data =  json.loads(request.body)
			print("entra para tomar datos");
			print(data)
			is_pending = True
			if not ( 'user_id' in data and 'access_code' in data and 'quantity' in data and 'ingredient_id' in data):
				return JsonResponse(data={"error": True, "message": 'incomplete_data' })
			scale = Scale.objects.filter(access_code= data['access_code'], active=True).first()
			if not scale:
				return JsonResponse(data={"error": True,  "message":"scale_not_exists"})
			print(data['quantity'])
			upload = Inventory.objects.create(quantity=int(data['quantity']), ingredient_id=data['ingredient_id'], type_id=1, user_id = data['user_id'])
			print(upload.quantity)
			pending = Inventory.objects.filter(active = True, quantity__gt=0 ,ingredient_id=data['ingredient_id'], user_id= data['user_id']).first()
			if pending:
				pending.quantity -= float(data["quantity"])
				pending.save()
				if pending.quantity <= 0:
					is_pending = False
			else:
				is_pending = False
			upload.save()

			return JsonResponse(data={"error": False, "pending": is_pending})
		except Exception as e:
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
		week_start =  request.GET.get('week_start',None) 
		user_id =  request.GET.get('user_id',None)
		create = request.GET.get('create', False) == 'True'

		if not week_start or not user_id:
			return JsonResponse(data={"error": True, "message": 'incomplete_data' })
		


		print("datos recibidos:")
		print("week: ", week_start)
		print("user: ", user_id)
		print('Create: ', create)
		print(type(create))

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
			if create :
				print("crear la semana")
				last_week =  UserWeek.objects.filter(active = True).order_by('-week_number').first()
				week_day = date.today().isocalendar()
				# current_start = date.today() - timedelta(days=(week_day[2]) - 1)
				if not last_week :
					current_week = UserWeek.objects.create(user_id = user_id, week_number = 1, week_start = week_start)
				else:
					current_week = UserWeek.objects.create(user_id = user_id, week_number = last_week.week_number + 1, week_start = week_start)
				
				to_return = {
					"active": True,
					"has_stats": current_week.has_stats,
					"id": current_week.id,
					"inventory_updated": current_week.inventory_updated,
					"week_number": current_week.week_number,
					'total' : 0
				}
				return JsonResponse( data = {'week_info': to_return, 'week_recipes' : recipes})
			else :
				return JsonResponse(data={"error": True, "message": 'week_not_exists' })

		current_week = list(current_week.values("has_stats","id","inventory_updated","week_number"))[0]
		week_recipes = list(WeekRecipe.objects.filter(week_id = current_week['id'], active=True).values())

		recipes_to_collect = []
		total = 0
		for recipe in week_recipes :
			week_date = (recipe['preparation_date'].isocalendar()[2]) -1
			total += 1
			recipes[ week_date ].append(recipe)
			if not ( recipe['recipe_id'] in recipes_to_collect):
				recipes_to_collect.append( recipe['recipe_id'] )
		recipes_data =  Recipe.objects.filter(active = True, id__in=recipes_to_collect)#faltan los ingredientes necesarios
		if recipes_data:
			recipes_data = list( recipes_data.values() )
		else:
			recipes_data = []

		current_week['total'] = total

		return JsonResponse( data = {'week_info': current_week, 'week_recipes' : recipes, 'recipes':recipes_data})
