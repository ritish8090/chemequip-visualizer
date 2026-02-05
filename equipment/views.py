
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
import pandas as pd
import json
from .models import EquipmentDataset

class EquipmentSummaryAPI(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Parse CSV with Pandas
            df = pd.read_csv(file_obj)
            
            # Required columns validation
            required_cols = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']
            if not all(col in df.columns for col in required_cols):
                return Response({
                    "error": f"Invalid CSV format. Required columns: {', '.join(required_cols)}"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Perform Analytics
            summary = {
                "totalCount": int(df.shape[0]),
                "avgFlowrate": round(float(df['Flowrate'].mean()), 2),
                "avgPressure": round(float(df['Pressure'].mean()), 2),
                "avgTemperature": round(float(df['Temperature'].mean()), 2),
                "typeDistribution": df['Type'].value_counts().to_dict()
            }

            # Prepare data for storage
            raw_data = df.to_dict('records')

            # Save to Database
            new_entry = EquipmentDataset.objects.create(
                filename=file_obj.name,
                summary_json=summary,
                raw_data_json=raw_data
            )

            # Maintain history: Delete entries older than the last 5
            ids_to_keep = EquipmentDataset.objects.order_by('-upload_date').values_list('id', flat=True)[:5]
            EquipmentDataset.objects.exclude(id__in=list(ids_to_keep)).delete()

            return Response({
                "id": new_entry.id,
                "filename": file_obj.name,
                "data": raw_data,
                "summary": summary
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HistoryAPI(APIView):
    def get(self, request):
        datasets = EquipmentDataset.objects.all()[:5]
        history = []
        for ds in datasets:
            history.append({
                "id": ds.id,
                "filename": ds.filename,
                "timestamp": ds.upload_date,
                "summary": ds.summary_json,
                "data": ds.raw_data_json
            })
        return Response({"history": history})
