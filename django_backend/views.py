
"""
This is a representative Python Django view using DRF and Pandas.
It would be implemented in the /backend folder of the project.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
import pandas as pd
from .models import EquipmentDataset

class EquipmentSummaryAPI(APIView):
    parser_classes = (MultiPartParser,)

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=400)

        # Parse with Pandas
        df = pd.read_csv(file_obj)
        
        # Perform Analysis
        summary = {
            "totalCount": int(df.shape[0]),
            "avgFlowrate": float(df['Flowrate'].mean()),
            "avgPressure": float(df['Pressure'].mean()),
            "avgTemperature": float(df['Temperature'].mean()),
            "typeDistribution": df['Type'].value_counts().to_dict()
        }

        # Handle History (Store only last 5)
        # EquipmentDataset.objects.create(name=file_obj.name, summary=summary)
        # count = EquipmentDataset.objects.count()
        # if count > 5:
        #    EquipmentDataset.objects.first().delete()

        return Response({
            "filename": file_obj.name,
            "data": df.to_dict('records'),
            "summary": summary
        })

class HistoryAPI(APIView):
    def get(self, request):
        # Fetch last 5 from SQLite
        # datasets = EquipmentDataset.objects.all().order_by('-id')[:5]
        return Response({"history": []})
