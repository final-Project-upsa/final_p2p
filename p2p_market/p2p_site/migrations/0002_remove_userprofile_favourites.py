# Generated by Django 5.1 on 2025-01-04 11:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('p2p_site', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='favourites',
        ),
    ]