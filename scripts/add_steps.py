import pandas as pd
import django
import os
import sys
from django.conf import settings
from django.db.models import Count, F, Q, Max, Sum
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/services"
sys.path.append(BASE_DIR)

os.environ.setdefault(
  "DJANGO_SETTINGS_MODULE",
  "services.settings"
)
django.setup()

from mainServices.models import *


df = pd.read_excel('/home/mau/Documents/ESCOM/TT/TT-recetas/excel/pasos_recetas.xlsx')


print(df)

step_type = {}	
recipes = {}

# available_r = Recipe.objects.filter(active=True).values('name','id')
# for recipe in available_r :
# 	recipes[ recipe['name'] ] = recipe['id']

to_bulk = []
to_bulk_step = []
for index, row in df.iterrows():
	# if not (pd.isna(row['receta']) ):
		# if not row['nombre'] in recipes:
		# 	print("no en encontrado")
		# 	exit()
	if not row['tipo'] in step_type :
		step_type[ row['tipo'] ] = 1
		to_bulk_step.append(StepType(name = row['tipo']))
	# to_bulk.append()
	# break
	# print(current_recipe, ingredients[ row['Ingrediente'] ][ 'id' ], row['cantidad'], row['unidad'], row['comentario'])

# RecipeIngredient.objects.bulk_create( to_bulk )

StepType.objects.bulk_create( to_bulk_step )