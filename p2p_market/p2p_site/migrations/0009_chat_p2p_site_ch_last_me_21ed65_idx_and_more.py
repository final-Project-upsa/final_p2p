# Generated by Django 5.1 on 2024-12-29 18:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('p2p_site', '0008_alter_chat_unique_together_chat_chat_type_and_more'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='chat',
            index=models.Index(fields=['-last_message_at'], name='p2p_site_ch_last_me_21ed65_idx'),
        ),
        migrations.AddIndex(
            model_name='chat',
            index=models.Index(fields=['is_active'], name='p2p_site_ch_is_acti_cc0271_idx'),
        ),
    ]