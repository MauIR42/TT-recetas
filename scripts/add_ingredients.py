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


df = pd.read_excel('/home/mau/Documents/ESCOM/TT/TT-recetas/excel/ingredientes.xlsx')

print(df)

ingredient = {}

ingredient_type = {
	'gramos' : 2,
	'mililitros': 3,
	'unidad': 1
}

to_bulk = []

for index, row in df.iterrows():
	print(row['ingrediente'], '==', row['tipo'])
	if not row['ingrediente'] in ingredient:
		ingredient[ row['ingrediente'] ] = 1
		to_bulk.append(Ingredient(name = row['ingrediente'], type_id= ingredient_type[row['tipo']] ))
Ingredient.objects.bulk_create(to_bulk	)

	# print(element[1])
	# print(element[2])
	# print(element[3])

