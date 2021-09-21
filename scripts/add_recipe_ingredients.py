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


df = pd.read_excel('/home/mau/Documents/ESCOM/TT/TT-recetas/excel/cantidades_recetas.xlsx')


# print(df)

recipes = {}
ingredients = {}

available_r = Recipe.objects.filter(active=True).values('name','id')
for recipe in available_r :
	recipes[ recipe['name'] ] = recipe['id']

available_i = Ingredient.objects.filter(active=True).annotate(type_name=F("type_id__name")).values('name','id','type_name')
for ingredient in available_i :
	ingredients[ ingredient['name'] ] = { 'id': ingredient['id'], 'type': ingredient['type_name']}

# print(recipes)
# print(ingredients)
ingredient_type = {
	'gramos' : 2,
	'mililitros': 3,
	'unidad': 1
}

to_bulk = []
current_recipe = -1
for index, row in df.iterrows():
	is_optional = False
	if not (pd.isna(row['nombre']) ):
		# print(row['nombre'])
		if not row['nombre'] in recipes:
			print("no encontrado")
			exit()
		current_recipe = recipes[ row['nombre'] ]
		# print(current_recipe)
	if not row['Ingrediente'] in ingredients:
		print("ingrediente no encontrado")
		print(row['Ingrediente'])
		exit()
	if not (ingredients[ row['Ingrediente'] ][ 'type' ] == row['unidad']):
		print(row['Ingrediente'])
		print("unidad diferente")
		exit()
	if row['cantidad'] <= 0:
		# print("es opcional")
		is_optional = True
	ingr = RecipeIngredient(ingredient_id = ingredients[ row['Ingrediente'] ][ 'id' ], recipie_id = current_recipe, quantity = row['cantidad'],is_optional = is_optional)
	if not (pd.isna(row['comentario'])):
		ingr.comment = row['comentario']
	to_bulk.append(ingr)
	# break
	# print(current_recipe, ingredients[ row['Ingrediente'] ][ 'id' ], row['cantidad'], row['unidad'], row['comentario'])

RecipeIngredient.objects.bulk_create( to_bulk )