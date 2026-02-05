from django.db import models

class EquipmentDataset(models.Model):
    filename = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)
    summary_json = models.JSONField() # Stores the statistical summary
    raw_data_json = models.JSONField() # Stores the full equipment list

    class Meta:
        ordering = ['-upload_date']

    def __str__(self):
        return self.filename
