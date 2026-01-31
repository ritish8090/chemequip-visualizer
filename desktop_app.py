
import sys
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QFileDialog, QTableWidget, 
                             QTableWidgetItem, QLabel, QFrame)
from PyQt5.QtCore import Qt
import requests

# NOTE: This script assumes the Django backend is running at http://localhost:8000
# For demo purposes, this script performs local analysis as requested in tech stack.

class EquipmentVisualizer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("ChemEquip - Desktop Visualizer")
        self.setGeometry(100, 100, 1200, 800)
        self.initUI()
        self.df = None

    def initUI(self):
        # Main Widget and Layout
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)

        # Left Sidebar for Controls
        sidebar = QFrame()
        sidebar.setFixedWidth(250)
        sidebar.setStyleSheet("background-color: #1e293b; color: white; border-radius: 10px;")
        sidebar_layout = QVBoxLayout(sidebar)

        title_label = QLabel("ChemEquip Desktop")
        title_label.setStyleSheet("font-size: 18px; font-weight: bold; margin-bottom: 20px;")
        sidebar_layout.addWidget(title_label)

        self.btn_upload = QPushButton("Upload CSV")
        self.btn_upload.setStyleSheet("background-color: #4f46e5; padding: 10px; font-weight: bold;")
        self.btn_upload.clicked.connect(self.upload_file)
        sidebar_layout.addWidget(self.btn_upload)

        sidebar_layout.addStretch()

        self.stats_label = QLabel("No Data Loaded")
        self.stats_label.setWordWrap(True)
        sidebar_layout.addWidget(self.stats_label)

        # Right Content Area
        content_area = QWidget()
        content_layout = QVBoxLayout(content_area)

        # Top Section: Summary Table
        self.table = QTableWidget()
        content_layout.addWidget(self.table)

        # Bottom Section: Charts
        self.chart_container = QWidget()
        self.chart_layout = QHBoxLayout(self.chart_container)
        content_layout.addWidget(self.chart_container)

        self.figure = plt.figure(figsize=(10, 4))
        self.canvas = FigureCanvas(self.figure)
        self.chart_layout.addWidget(self.canvas)

        main_layout.addWidget(sidebar)
        main_layout.addWidget(content_area)

    def upload_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Open CSV", "", "CSV Files (*.csv)")
        if file_path:
            self.df = pd.read_csv(file_path)
            self.process_data()

    def process_data(self):
        if self.df is None: return

        # Fill Table
        self.table.setRowCount(len(self.df))
        self.table.setColumnCount(len(self.df.columns))
        self.table.setHorizontalHeaderLabels(self.df.columns)

        for i in range(len(self.df)):
            for j in range(len(self.df.columns)):
                self.table.setItem(i, j, QTableWidgetItem(str(self.df.iloc[i, j])))

        # Update Summary
        avg_flow = self.df['Flowrate'].mean()
        avg_pres = self.df['Pressure'].mean()
        summary_text = (f"Summary:\nTotal Count: {len(self.df)}\n"
                        f"Avg Flow: {avg_flow:.1f} L/h\n"
                        f"Avg Pressure: {avg_pres:.1f} bar")
        self.stats_label.setText(summary_text)

        # Update Chart
        self.figure.clear()
        ax = self.figure.add_subplot(121)
        self.df.groupby('Type').size().plot(kind='pie', ax=ax, autopct='%1.1f%%')
        ax.set_title("Equipment Type Distribution")

        ax2 = self.figure.add_subplot(122)
        self.df.plot(kind='scatter', x='Flowrate', y='Pressure', ax=ax2, color='indigo')
        ax2.set_title("Flowrate vs Pressure")

        self.canvas.draw()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = EquipmentVisualizer()
    window.show()
    sys.exit(app.exec_())
