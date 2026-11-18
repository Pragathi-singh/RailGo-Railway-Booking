from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [("booking", "0002_booking_workflow")]
    operations = [
        migrations.AlterField(
            model_name="booking",
            name="created_at",
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
