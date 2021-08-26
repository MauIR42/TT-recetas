# Generated by Django 3.2.6 on 2021-08-25 22:48

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Stat',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('unit', models.CharField(max_length=50)),
            ],
            options={
                'db_table': 'stat',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('first_name', models.CharField(blank=True, max_length=100, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=100, verbose_name='last name')),
                ('birthday', models.DateField(null=True)),
                ('username', models.CharField(max_length=128, unique=True)),
                ('active', models.BooleanField(default=True)),
            ],
            options={
                'db_table': 'user',
            },
        ),
        migrations.CreateModel(
            name='userStat',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='created at')),
                ('value', models.DecimalField(decimal_places=2, max_digits=3)),
                ('week_number', models.IntegerField()),
                ('active', models.BooleanField(default=True)),
                ('stat_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='mainServices.stat')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='mainServices.user')),
            ],
            options={
                'db_table': 'user_stat',
            },
        ),
        migrations.CreateModel(
            name='UserRecoveryToken',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('token', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='created at')),
                ('active', models.BooleanField(default=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='mainServices.user')),
            ],
            options={
                'db_table': 'user_recovery_token',
            },
        ),
    ]
