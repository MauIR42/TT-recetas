from django.db import models
from django.utils import timezone
# Create your models here.


class Scale(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	access_code = models.CharField(max_length=255)
	active = models.BooleanField(default = True)

	class Meta:
		db_table = "scale"

class UserType(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	name = models.CharField(max_length=255)
	active = models.BooleanField(default = True)

	class Meta:
		db_table = "user_type"

class User(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	first_name = models.CharField(blank=True, max_length=100, verbose_name='first name')
	last_name = models.CharField(blank=True, max_length=100, verbose_name='last name')
	birthday = models.DateField(auto_now=False, null=True)
	username = models.CharField(max_length=128, unique=True)
	active = models.BooleanField(default=True)
	password = models.CharField(max_length=128, verbose_name='password', default='')
	gender = models.CharField(max_length=1, default='M')
	height = models.DecimalField(max_digits= 3, decimal_places= 2)
	created_at = models.DateTimeField(default=timezone.now, verbose_name='created at')
	scale = models.ForeignKey(Scale, on_delete=models.PROTECT,null=True)
	user_type = models.ForeignKey(UserType, on_delete=models.PROTECT,null=False, default=1)
	scale_name = models.CharField(max_length=16, default='')
	class Meta:
		db_table = "user"

class Stat(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	name = models.CharField( max_length= 100 )
	unit = models.CharField( max_length= 50, null=True )

	class Meta:
		db_table = "stat"

class UserWeek(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	user = models.ForeignKey(User, on_delete=models.PROTECT)
	week_number = models.IntegerField(null = False)
	week_start = models.DateField(auto_now=False, null=True)
	inventory_updated = models.BooleanField(default = False)
	has_stats = models.BooleanField(default = False)
	active = models.BooleanField(default = True)

	class Meta:
		db_table = "user_week"


class WeekStat(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	created_at = models.DateTimeField(default=timezone.now, verbose_name='created at')
	value = models.DecimalField(max_digits= 4, decimal_places= 2)
	stat_type = models.ForeignKey(Stat, on_delete=models.PROTECT)
	week = models.ForeignKey(UserWeek, on_delete=models.PROTECT, null = False)
	active = models.BooleanField(default= True)

	class Meta:
		db_table = "week_stat"


class UserRecoveryToken(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	user = models.ForeignKey(User, on_delete=models.PROTECT)
	token = models.CharField(max_length=255)
	created_at = models.DateTimeField(default=timezone.now, verbose_name='created at')
	active = models.BooleanField(default = True)


	class Meta:
		db_table = "user_recovery_token"

class UpdateType(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	name = models.CharField(max_length=255)
	active = models.BooleanField(default = True)

	class Meta:
		db_table = "update_type"

class ScaleUpdate(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	active = models.BooleanField(default = True)
	update_type = models.ForeignKey(UpdateType, on_delete=models.PROTECT)
	user = models.ForeignKey(User, on_delete=models.PROTECT, null = False)
	scale = models.ForeignKey(Scale, on_delete=models.PROTECT, null = False)
	created_at = models.DateTimeField(default=timezone.now, verbose_name='created at')

	class Meta:
		db_table = "scale_update"

class Unit(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	name = models.CharField(max_length=255)
	active = models.BooleanField(default = True)

	class Meta:
		db_table = "unit"

class Ingredient(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	name = models.CharField(max_length=255)
	type = models.ForeignKey(Unit, on_delete=models.PROTECT, null = False)
	active = models.BooleanField(default = True)

	class Meta:
		db_table = "ingredient"

class InventoryType(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	name = models.CharField(max_length=255)
	active = models.BooleanField(default = True)

	class Meta:
		db_table = 'inventory_type'

class Inventory(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	user = models.ForeignKey(User, on_delete=models.PROTECT, null = False)
	type = models.ForeignKey(InventoryType, on_delete=models.PROTECT, null = False)
	quantity = models.IntegerField(null = False)
	ingredient = models.ForeignKey(Ingredient, on_delete=models.PROTECT, null = False)
	active = models.BooleanField(default = True)
	created_at = models.DateTimeField(default=timezone.now, verbose_name='created at')
	week = models.ForeignKey(UserWeek, on_delete=models.PROTECT, null = True)
	class Meta:
		db_table = 'inventory'

class RecipeType(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	name = models.CharField(max_length=255)
	active = models.BooleanField(default = True)

	class Meta:
		db_table = 'recipe_type'

class Recipe(models.Model): #excel datos_recetas
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	name = models.CharField(max_length=255)
	description = models.TextField(null=True)
	image_url = models.TextField(null=True)
	sodium = models.DecimalField(max_digits= 6, decimal_places= 2)
	carbohydrates = models.DecimalField(max_digits= 6, decimal_places= 2)
	cholesterol = models.DecimalField(max_digits= 6, decimal_places= 2)
	total_time = models.IntegerField(null = False)
	portions = models.IntegerField(null = False)
	type = models.ForeignKey(RecipeType, on_delete=models.PROTECT, null = False)
	active = models.BooleanField(default = True)

	class Meta:
		db_table = 'recipe'

class RecipeIngredient(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	ingredient = models.ForeignKey(Ingredient, on_delete=models.PROTECT, null = False)
	recipe = models.ForeignKey(Recipe, on_delete=models.PROTECT, null = False)
	quantity = models.IntegerField(null = False)
	active = models.BooleanField(default = True)
	comment = models.CharField(max_length=255)
	is_optional = models.BooleanField(default = False)

	class Meta:
		db_table = 'recipe_ingredient'

class StepType(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	name = models.CharField(max_length=255)
	active = models.BooleanField(default = True)

	class Meta:
		db_table = 'step_type'

class RecipeStep(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	recipe = models.ForeignKey(Recipe, on_delete=models.PROTECT, null = False)
	type =  models.ForeignKey(StepType, on_delete=models.PROTECT, null = False)
	step_number = models.IntegerField(null = False)
	description = models.TextField(null=False)

	class Meta:
		db_table = 'recipe_step'

class WeekRecipeType(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	name = models.CharField(max_length=255)
	active = models.BooleanField(default = True)

	class Meta:
		db_table = 'week_recipe_type'

class WeekRecipe(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	week = models.ForeignKey(UserWeek, on_delete=models.PROTECT, null = False)
	recipe = models.ForeignKey(Recipe, on_delete=models.PROTECT, null = False)
	preparation_date = models.DateField(auto_now=False, null=True)
	quantity = models.IntegerField(null = False)
	#user_evaluation = models.DecimalField(max_digits= 5, decimal_places= 2, default = 0.00)
	active = models.BooleanField(default = True)
	status = models.ForeignKey(WeekRecipeType, on_delete=models.PROTECT, null = False)

	class Meta:
		db_table = 'week_recipe'

class UserRecipe(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	user = models.ForeignKey(User, on_delete=models.PROTECT, null = False)
	recipe = models.ForeignKey(Recipe, on_delete=models.PROTECT, null = False)
	count = models.IntegerField(null = False, default = 0)
	last_evaluation = models.DecimalField(max_digits= 5, decimal_places= 2, default = 0.00)
	created_at = models.DateTimeField(default=timezone.now, verbose_name='created at')
	updated_at = models.DateTimeField(default=timezone.now, verbose_name='updated at')

	class Meta:
		db_table = 'user_recipe'