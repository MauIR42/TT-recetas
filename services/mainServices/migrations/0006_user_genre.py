# Generated by Django 3.2.6 on 2021-08-28 04:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainServices', '0005_user_password'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='genre',
            field=models.CharField(default='M', max_length=1),
        ),
    ]
