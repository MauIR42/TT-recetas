# Generated by Django 3.2.6 on 2021-09-16 23:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainServices', '0023_alter_recipietype_table'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipeingredient',
            name='comment',
            field=models.CharField(default=None, max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='recipeingredient',
            name='is_optional',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='recipe',
            name='carbohydrates',
            field=models.DecimalField(decimal_places=2, max_digits=4),
        ),
        migrations.AlterField(
            model_name='recipe',
            name='cholesterol',
            field=models.DecimalField(decimal_places=2, max_digits=4),
        ),
        migrations.AlterField(
            model_name='recipe',
            name='sodium',
            field=models.DecimalField(decimal_places=2, max_digits=4),
        ),
    ]
