# Generated by Django 3.2.6 on 2021-10-14 04:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainServices', '0033_weekrecipe_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='weekrecipe',
            name='user_evaluation',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=5),
        ),
    ]