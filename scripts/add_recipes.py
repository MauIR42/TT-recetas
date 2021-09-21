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


df = pd.read_excel('/home/mau/Documents/ESCOM/TT/TT-recetas/excel/Datos_recetas.xlsx')

print(df)

recipe = {}

to_bulk = []

types = RecipieType.objects.filter(active= True).values()
type_dict = {}
for ele in types :
	print(ele)
	type_dict[ele['name']] = ele['id'] 

for index, row in df.iterrows():
	print(row['nombre'], '==', row['descripcion'], row['porciones'], round(float(row['carbohidratos']), 2), round(float(row['colesterol']), 2), round(float(row['sodio']), 2), row['tiempo aproximado'], row['tipo']  )
	if not row['nombre'] in recipe:
		recipe[ row['nombre'] ] = 1
		to_bulk.append(Recipe(name = row['nombre'], type_id= type_dict[row['tipo']], description= row['descripcion'], sodium= round(float(row['sodio']), 2), carbohydrates=round(float(row['carbohidratos']), 2), cholesterol=round(float(row['colesterol']), 2), total_time=row['tiempo aproximado'], portions=row['porciones']  ))
Recipe.objects.bulk_create( to_bulk )

