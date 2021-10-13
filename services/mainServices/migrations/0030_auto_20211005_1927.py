# Generated by Django 3.2.6 on 2021-10-06 00:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainServices', '0029_auto_20211005_2319'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='weekstat',
            name='week_number',
        ),
        migrations.AlterField(
            model_name='userweek',
            name='has_stats',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='userweek',
            name='inventory_updated',
            field=models.BooleanField(default=False),
        ),
    ]
