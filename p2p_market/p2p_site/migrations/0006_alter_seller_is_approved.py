# Generated by Django 5.1 on 2024-12-25 16:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('p2p_site', '0005_product_regular_price_product_stock'),
    ]

    operations = [
        migrations.AlterField(
            model_name='seller',
            name='is_approved',
            field=models.BooleanField(default=True),
        ),
    ]
