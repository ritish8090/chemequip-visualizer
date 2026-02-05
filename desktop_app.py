
import sys
import os
import requests
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QFileDialog, QTableWidget, 
                             QTableWidgetItem, QLabel, QFrame, QMessageBox)
from PyQt5.QtCore import Qt

# Backend API Configuration
BASE_URL = "http://127.0.0.1:8000/api"

class EquipmentVisualizer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("ChemEquip - Desktop Visualizer")
        self.setGeometry(100, 100, 1200, 850)
        self.initUI()
        self.current_data = None

    def initUI(self):
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)

        # Sidebar
        sidebar = QFrame()
        sidebar.setFixedWidth(280)
        sidebar.setStyleSheet("""
            QFrame { background-color: #0f172a; border-radius: 0px; }
            QLabel { color: #f8fafc; font-family: 'Segoe UI', Arial; }
            QPushButton { 
                background-color: #4f46e5; 
                color: white; 
                border-radius: 6px; 
                padding: 12px; 
                font-weight: bold; 
                font-size: 13px;
            }
            QPushButton:hover { background-color: #4338ca; }
        """)
        sidebar_layout = QVBoxLayout(sidebar)

        title_label = QLabel("ChemEquip Analytics")
        title_label.setStyleSheet("font-size: 22px; font-weight: bold; margin: 20px 0;")
        sidebar_layout.addWidget(title_label)

        self.btn_upload = QPushButton("SELECT CSV FILE")
        self.btn_upload.clicked.connect(self.upload_file)
        sidebar_layout.addWidget(self.btn_upload)

        sidebar_layout.addSpacing(30)
        
        self.stats_title = QLabel("LIVE STATISTICS")
        self.stats_title.setStyleSheet("color: #64748b; font-size: 11px; font-weight: 800; letter-spacing: 1px;")
        sidebar_layout.addWidget(self.stats_title)

        self.stats_label = QLabel("Upload a dataset to begin...")
        self.stats_label.setStyleSheet("font-size: 14px; line-height: 1.5; color: #cbd5e1;")
        self.stats_label.setWordWrap(True)
        sidebar_layout.addWidget(self.stats_label)

        sidebar_layout.addStretch()
        
        status_footer = QLabel("Connected to Django API v1.0")
        status_footer.setStyleSheet("color: #475569; font-size: 10px;")
        sidebar_layout.addWidget(status_footer)

        # Main Content
        content_area = QWidget()
        content_layout = QVBoxLayout(content_area)

        # Table Section
        self.table = QTableWidget()
        self.table.setStyleSheet("""
            QTableWidget { border: 1px solid #e2e8f0; background: white; border-radius: 8px; }
            QHeaderView::section { background-color: #f8fafc; padding: 8px; border: none; font-weight: bold; }
        """)
        content_layout.addWidget(self.table)

        # Charts Section
        self.figure = plt.figure(figsize=(10, 5), tight_layout=True)
        self.canvas = FigureCanvas(self.figure)
        content_layout.addWidget(self.canvas)

        main_layout.addWidget(sidebar)
        main_layout.addWidget(content_area)

    def upload_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Open Equipment Data", "", "CSV Files (*.csv)")
        if file_path:
            try:
                with open(file_path, 'rb') as f:
                    files = {'file': (os.path.basename(file_path), f, 'text/csv')}
                    response = requests.post(f"{BASE_URL}/upload/", files=files)
                
                if response.status_code == 201:
                    data = response.json()
                    self.display_results(data)
                else:
                    error_msg = response.json().get('error', 'Unknown error')
                    QMessageBox.critical(self, "API Error", f"Server returned error: {error_msg}")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Could not connect to backend: {str(e)}")

    def display_results(self, response_data):
        raw_data = response_data['data']
        summary = response_data['summary']
        filename = response_data['filename']

        # 1. Update Table
        if raw_data:
            cols = list(raw_data[0].keys())
            self.table.setRowCount(len(raw_data))
            self.table.setColumnCount(len(cols))
            self.table.setHorizontalHeaderLabels(cols)

            for i, row in enumerate(raw_data):
                for j, col in enumerate(cols):
                    self.table.setItem(i, j, QTableWidgetItem(str(row[col])))

        # 2. Update Summary Sidebar
        summary_text = (
            f"<b>File:</b> {filename}<br><br>"
            f"<b>Total Count:</b> {summary['totalCount']}<br>"
            f"<b>Avg Flow:</b> {summary['avgFlowrate']} L/h<br>"
            f"<b>Avg Pressure:</b> {summary['avgPressure']} bar<br>"
            f"<b>Avg Temp:</b> {summary['avgTemperature']} °C"
        )
        self.stats_label.setText(summary_text)

        # 3. Update Visualizations (Matplotlib)
        self.figure.clear()
        
        # Pie Chart
        ax1 = self.figure.add_subplot(121)
        labels = list(summary['typeDistribution'].keys())
        sizes = list(summary['typeDistribution'].values())
        colors = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']
        ax1.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140, colors=colors[:len(labels)])
        ax1.set_title("Equipment Types", fontweight='bold')

        # Scatter Plot
        ax2 = self.figure.add_subplot(122)
        df = pd.DataFrame(raw_data)
        ax2.scatter(df['Flowrate'], df['Pressure'], alpha=0.6, color='#4f46e5')
        ax2.set_xlabel("Flowrate (L/h)")
        ax2.set_ylabel("Pressure (bar)")
        ax2.set_title("Pressure vs Flowrate", fontweight='bold')
        ax2.grid(True, linestyle='--', alpha=0.7)

        self.canvas.draw()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = EquipmentVisualizer()
    window.show()
    sys.exit(app.exec_())
