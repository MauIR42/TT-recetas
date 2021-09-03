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
	class Meta:
		db_table = "user"

class Stat(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	name = models.CharField( max_length= 100 )
	unit = models.CharField( max_length= 50, null=True )

	class Meta:
		db_table = "stat"


class UserStat(models.Model):
	id = models.AutoField(auto_created=True, primary_key=True, serialize=False)
	created_at = models.DateTimeField(default=timezone.now, verbose_name='created at')
	value = models.DecimalField(max_digits= 4, decimal_places= 2)
	stat_type = models.ForeignKey(Stat, on_delete=models.PROTECT)
	user = models.ForeignKey(User, on_delete=models.PROTECT)
	week_number = models.IntegerField(null = False)
	active = models.BooleanField(default= True)

	class Meta:
		db_table = "user_stat"


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

	class Meta:
		db_table = 'inventory'
