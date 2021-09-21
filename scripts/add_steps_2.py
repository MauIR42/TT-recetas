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

steps_type = {}	
recipes = {}

available_r = Recipe.objects.filter(active=True).values('name','id')
for recipe in available_r :
	recipes[ recipe['name'] ] = recipe['id']

available_s = StepType.objects.filter(active=True).values()

for step in available_s :
	steps_type[ step['name'] ] = step['id']

to_bulk = []

for index, row in df.iterrows():
	if not (pd.isna(row['receta']) ):
		if not row['receta'] in recipes:
			print("no en encontrado")
			exit()
		current_recipe = recipes[ row['receta'] ]
		step = 1
	if not row['tipo'] in steps_type :
		print("paso no en encontrado")
		exit()
	print(current_recipe, step, steps_type[ row['tipo'] ], row['descripción'])
	to_bulk.append( RecipeStep(recipe_id = current_recipe, type_id= steps_type[ row['tipo'] ], step_number = step, description= row['descripción'] ) )
	step += 1
	# to_bulk.append()
	# break
	# print(current_recipe, ingredients[ row['Ingrediente'] ][ 'id' ], row['cantidad'], row['unidad'], row['comentario'])

RecipeStep.objects.bulk_create( to_bulk )
