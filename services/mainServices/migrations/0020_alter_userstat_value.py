# Generated by Django 3.2.6 on 2021-09-03 04:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainServices', '0019_ingredient_active'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userstat',
            name='value',
            field=models.DecimalField(decimal_places=2, max_digits=4),
        ),
    ]
