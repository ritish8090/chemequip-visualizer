
import sys
import os
import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.backends.backend_pdf import PdfPages
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QFileDialog, QTableWidget, 
                             QTableWidgetItem, QLabel, QFrame, QMessageBox, 
                             QStackedWidget, QLineEdit, QSlider, QGridLayout, QScrollArea)
from PyQt5.QtCore import Qt, QTimer, QSize
from PyQt5.QtGui import QFont, QIcon, QColor, QPalette

# Backend API Configuration
BASE_URL = "http://127.0.0.1:8000/api"

class Theme:
    DARK = {
        "bg_main": "#09090b",
        "bg_side": "#18181b",
        "bg_card": "#18181b",
        "bg_input": "#09090b",
        "border": "#27272a",
        "text_primary": "#ffffff",
        "text_secondary": "#71717a",
        "text_muted": "#52525b",
        "accent": "#2563eb",
        "danger": "#e11d48",
        "warning": "#f59e0b",
        "success": "#10b981"
    }

class StatCard(QFrame):
    def __init__(self, icon_char, label, value, unit, color_hex, theme):
        super().__init__()
        self.setFixedSize(240, 130)
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {theme['bg_card']};
                border: 1px solid {theme['border']};
                border-radius: 24px;
            }}
        """)
        
        layout = QHBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(15)
        
        icon_box = QFrame()
        icon_box.setFixedSize(50, 50)
        icon_box.setStyleSheet(f"background-color: {color_hex}; border-radius: 12px;")
        
        icon_inner = QLabel(icon_char, icon_box)
        icon_inner.setAlignment(Qt.AlignCenter)
        icon_inner.setStyleSheet("color: white; font-size: 20px; font-weight: bold;")
        icon_inner.setGeometry(0, 0, 50, 50)
        
        layout.addWidget(icon_box)
        
        text_layout = QVBoxLayout()
        self.label_widget = QLabel(label.upper())
        self.label_widget.setStyleSheet(f"color: {theme['text_secondary']}; font-size: 10px; font-weight: 900; letter-spacing: 1px;")
        
        val_container = QHBoxLayout()
        self.val_widget = QLabel(str(value))
        self.val_widget.setStyleSheet(f"color: {theme['text_primary']}; font-size: 26px; font-weight: 900;")
        self.unit_widget = QLabel(unit)
        self.unit_widget.setStyleSheet(f"color: {theme['text_muted']}; font-size: 10px; font-weight: 700; margin-top: 8px;")
        val_container.addWidget(self.val_widget)
        val_container.addWidget(self.unit_widget)
        val_container.addStretch()
        
        text_layout.addWidget(self.label_widget)
        text_layout.addLayout(val_container)
        layout.addLayout(text_layout)

    def update_value(self, val):
        self.val_widget.setText(str(val))

class HistoryItem(QPushButton):
    def __init__(self, item_data, on_click, theme, is_active=False):
        super().__init__()
        self.data = item_data
        self.setCursor(Qt.PointingHandCursor)
        self.setFixedHeight(85)
        self.clicked.connect(lambda: on_click(self.data))
        
        layout = QHBoxLayout(self)
        layout.setContentsMargins(20, 15, 20, 15)
        
        icon_box = QFrame()
        icon_box.setFixedSize(45, 45)
        bg_icon = theme['accent'] if is_active else theme['border']
        icon_box.setStyleSheet(f"background-color: {bg_icon}; border-radius: 14px;")
        icon_label = QLabel("📄", icon_box)
        icon_label.setAlignment(Qt.AlignCenter)
        icon_label.setStyleSheet("color: white; font-size: 16px;")
        icon_label.setGeometry(0, 0, 45, 45)
        layout.addWidget(icon_box)
        
        text_layout = QVBoxLayout()
        name = QLabel(item_data['filename'])
        name.setStyleSheet(f"color: {theme['text_primary']}; font-size: 12px; font-weight: 900;")
        name.setWordWrap(False)
        
        time_str = str(item_data.get('timestamp', ''))[:16].replace('T', ' ')
        time_label = QLabel(f"{time_str} • NEURAL SYNC")
        time_label.setStyleSheet(f"color: {theme['text_muted']}; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;")
        
        text_layout.addWidget(name)
        text_layout.addWidget(time_label)
        layout.addLayout(text_layout)
        layout.addStretch()
        
        chevron = QLabel("›")
        chevron.setStyleSheet(f"color: {theme['accent'] if is_active else theme['text_muted']}; font-size: 20px; font-weight: 900;")
        layout.addWidget(chevron)
        
        border_color = theme['accent'] if is_active else theme['border']
        bg_color = f"{theme['accent']}15" if is_active else theme['bg_main']
        
        self.setStyleSheet(f"""
            QPushButton {{
                background-color: {bg_color};
                border: 2px solid {border_color};
                border-radius: 20px;
                text-align: left;
            }}
            QPushButton:hover {{
                background-color: {theme['bg_card']};
                border: 2px solid {theme['accent']};
            }}
        """)

class EquipmentVisualizer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("EquipIQ Pro - Terminal Desktop")
        self.setGeometry(100, 100, 1450, 950)
        self.theme = Theme.DARK
        self.current_data = None
        self.active_id = None
        self.pressure_threshold = 40
        self.is_simulating = False
        self.is_offline_mode = False
        
        self.initUI()
        
        self.history_timer = QTimer()
        self.history_timer.timeout.connect(self.fetch_history)
        self.history_timer.start(5000)
        
        self.sim_timer = QTimer()
        self.sim_timer.timeout.connect(self.run_simulation_step)
        
        QTimer.singleShot(500, self.fetch_history)

    def initUI(self):
        main_widget = QWidget()
        main_widget.setStyleSheet(f"background-color: {self.theme['bg_main']};")
        self.setCentralWidget(main_widget)
        
        layout = QHBoxLayout(main_widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # 1. SIDEBAR (Web Parity)
        sidebar = QFrame()
        sidebar.setFixedWidth(320)
        sidebar.setStyleSheet(f"background-color: {self.theme['bg_side']}; border-right: 1px solid {self.theme['border']};")
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setContentsMargins(25, 45, 25, 45)
        sidebar_layout.setSpacing(10)

        logo = QLabel("EQUIP<span style='color:#2563eb;'>PRO</span>")
        logo.setStyleSheet("color: white; font-size: 28px; font-weight: 900; letter-spacing: -1.5px; margin-bottom: 40px;")
        sidebar_layout.addWidget(logo)

        self.nav_btns = []
        sidebar_layout.addWidget(self.create_nav_btn("⊞", "Dashboard", 0))
        sidebar_layout.addWidget(self.create_nav_btn("⌗", "Monitors", 1))
        sidebar_layout.addWidget(self.create_nav_btn("⇮", "Ingestion", 2))
        
        sidebar_layout.addSpacing(40)
        
        registry_header = QHBoxLayout()
        registry_label = QLabel("REGISTRY")
        registry_label.setStyleSheet(f"color: {self.theme['text_muted']}; font-size: 10px; font-weight: 900; letter-spacing: 4px;")
        registry_header.addWidget(registry_label)
        registry_header.addStretch()
        sidebar_layout.addLayout(registry_header)
        sidebar_layout.addSpacing(10)
        
        self.history_scroll = QScrollArea()
        self.history_scroll.setWidgetResizable(True)
        self.history_scroll.setStyleSheet("QScrollArea { border: none; background: transparent; }")
        self.history_container = QWidget()
        self.history_container.setStyleSheet("background: transparent;")
        self.history_layout = QVBoxLayout(self.history_container)
        self.history_layout.setContentsMargins(0, 0, 0, 0)
        self.history_layout.setSpacing(12)
        self.history_layout.addStretch(1)
        self.history_scroll.setWidget(self.history_container)
        sidebar_layout.addWidget(self.history_scroll)
        
        sidebar_layout.addStretch()

        self.status_bar = QFrame()
        self.status_bar.setFixedHeight(50)
        self.status_bar.setStyleSheet(f"background-color: {self.theme['border']}; border-radius: 18px;")
        st_layout = QHBoxLayout(self.status_bar)
        self.st_dot = QLabel("●")
        self.st_dot.setStyleSheet("color: #71717a;")
        self.st_text = QLabel("Checking Core...")
        self.st_text.setStyleSheet(f"color: {self.theme['text_muted']}; font-size: 10px; font-weight: 900; text-transform: uppercase;")
        st_layout.addWidget(self.st_dot)
        st_layout.addWidget(self.st_text)
        st_layout.addStretch()
        sidebar_layout.addWidget(self.status_bar)

        # 2. MAIN CONTENT
        self.stack = QStackedWidget()
        
        # Dashboard Page
        self.page_dash = QWidget()
        dash_layout = QVBoxLayout(self.page_dash)
        dash_layout.setContentsMargins(50, 50, 50, 50)
        dash_layout.setSpacing(35)

        dash_header = QHBoxLayout()
        dash_title = QLabel("Dashboard")
        dash_title.setStyleSheet("color: white; font-size: 48px; font-weight: 900; letter-spacing: -2px;")
        dash_header.addWidget(dash_title)
        
        self.btn_pdf_dash = QPushButton("DOWNLOAD PDF AUDIT")
        self.btn_pdf_dash.setFixedSize(240, 55)
        self.btn_pdf_dash.setStyleSheet(f"QPushButton {{ background-color: {self.theme['accent']}; color: white; border-radius: 18px; font-weight: 900; font-size: 11px; tracking: 1px; }} QPushButton:hover {{ background-color: #1d4ed8; }}")
        self.btn_pdf_dash.clicked.connect(self.generate_pdf_report)
        dash_header.addStretch()
        dash_header.addWidget(self.btn_pdf_dash)
        dash_layout.addLayout(dash_header)
        
        stats_grid = QHBoxLayout()
        self.card_units = StatCard("❒", "Units", "0", "assets", "#2563eb", self.theme)
        self.card_flow = StatCard("≋", "Flow", "0.0", "L/h", "#f59e0b", self.theme)
        self.card_press = StatCard("⏚", "Press", "0.0", "bar", "#6366f1", self.theme)
        self.card_temp = StatCard("🌡", "Temp", "0.0", "°C", "#e11d48", self.theme)
        stats_grid.addWidget(self.card_units)
        stats_grid.addWidget(self.card_flow)
        stats_grid.addWidget(self.card_press)
        stats_grid.addWidget(self.card_temp)
        dash_layout.addLayout(stats_grid)
        
        charts_row = QHBoxLayout()
        pie_frame = QFrame()
        pie_frame.setStyleSheet(f"background-color: {self.theme['bg_card']}; border: 1px solid {self.theme['border']}; border-radius: 40px;")
        self.fig_pie = plt.figure(facecolor=self.theme['bg_card'])
        self.canvas_pie = FigureCanvas(self.fig_pie)
        QVBoxLayout(pie_frame).addWidget(self.canvas_pie)
        
        scat_frame = QFrame()
        scat_frame.setStyleSheet(f"background-color: {self.theme['bg_card']}; border: 1px solid {self.theme['border']}; border-radius: 40px;")
        self.fig_scat = plt.figure(facecolor=self.theme['bg_card'])
        self.canvas_scat = FigureCanvas(self.fig_scat)
        QVBoxLayout(scat_frame).addWidget(self.canvas_scat)
        
        charts_row.addWidget(pie_frame, 1)
        charts_row.addWidget(scat_frame, 2)
        dash_layout.addLayout(charts_row)
        
        sim_box = QFrame()
        sim_box.setStyleSheet(f"background-color: {self.theme['accent']}; border-radius: 30px; padding: 25px;")
        sim_h_layout = QHBoxLayout(sim_box)
        sim_text = QLabel("<b>NEURAL STRESS TEST:</b> Synchronize live simulation drift matrix.")
        sim_text.setStyleSheet("color: white; font-size: 14px; font-weight: 500;")
        self.btn_sim = QPushButton("GO LIVE")
        self.btn_sim.setFixedSize(160, 50)
        self.btn_sim.setStyleSheet("QPushButton { background-color: white; color: #2563eb; border-radius: 16px; font-weight: 900; } QPushButton:checked { background-color: #f43f5e; color: white; }")
        self.btn_sim.setCheckable(True)
        self.btn_sim.clicked.connect(self.toggle_simulation)
        sim_h_layout.addWidget(sim_text)
        sim_h_layout.addStretch()
        sim_h_layout.addWidget(self.btn_sim)
        dash_layout.addWidget(sim_box)

        # Monitors Page
        self.page_monitors = QWidget()
        mon_layout = QVBoxLayout(self.page_monitors)
        mon_layout.setContentsMargins(50, 50, 50, 50)
        
        mon_title = QLabel("Operational Terminal")
        mon_title.setStyleSheet("color: white; font-size: 48px; font-weight: 900; letter-spacing: -2px; margin-bottom: 25px;")
        mon_layout.addWidget(mon_title)
        
        mon_tools = QHBoxLayout()
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Identify asset profile...")
        self.search_input.setFixedHeight(60)
        self.search_input.textChanged.connect(self.refresh_ui)
        self.search_input.setStyleSheet(f"background-color: {self.theme['bg_input']}; border: 1px solid {self.theme['border']}; border-radius: 20px; padding: 18px; color: white; font-weight: 800; font-size: 13px;")
        mon_tools.addWidget(self.search_input)
        
        thresh_box = QFrame()
        thresh_box.setStyleSheet(f"background-color: {self.theme['bg_card']}; border: 1px solid {self.theme['border']}; border-radius: 20px; padding: 5px 25px;")
        thresh_layout = QHBoxLayout(thresh_box)
        self.thresh_val = QLabel("LIMIT: 40 bar")
        self.thresh_val.setStyleSheet("color: #f59e0b; font-size: 11px; font-weight: 900; tracking: 1px;")
        self.slider = QSlider(Qt.Horizontal)
        self.slider.setRange(10, 100)
        self.slider.setValue(40)
        self.slider.valueChanged.connect(self.update_threshold)
        thresh_layout.addWidget(self.thresh_val)
        thresh_layout.addWidget(self.slider)
        mon_tools.addWidget(thresh_box)
        mon_layout.addLayout(mon_tools)

        self.table = QTableWidget()
        self.table.setEditTriggers(QTableWidget.NoEditTriggers)
        self.table.setStyleSheet(f"""
            QTableWidget {{ 
                background-color: {self.theme['bg_card']}; 
                border: 1px solid {self.theme['border']}; 
                border-radius: 30px; 
                color: #a1a1aa; 
                gridline-color: {self.theme['border']}; 
                font-size: 12px;
            }} 
            QHeaderView::section {{ 
                background-color: #0c0c0e; 
                color: #52525b; 
                padding: 20px; 
                border: none; 
                font-weight: 900; 
                text-transform: uppercase; 
                font-size: 10px; 
                letter-spacing: 1px;
            }}
        """)
        mon_layout.addWidget(self.table)

        # Ingestion Page
        self.page_ingest = QWidget()
        ing_layout = QVBoxLayout(self.page_ingest)
        ing_layout.setContentsMargins(150, 150, 150, 150)
        upload_area = QFrame()
        upload_area.setStyleSheet(f"border: 5px dashed {self.theme['border']}; border-radius: 70px; background-color: {self.theme['bg_card']};")
        upload_vbox = QVBoxLayout(upload_area)
        upload_vbox.setAlignment(Qt.AlignCenter)
        up_title = QLabel("Push Data Stream")
        up_title.setStyleSheet("color: white; font-size: 42px; font-weight: 900; margin-bottom: 10px;")
        up_desc = QLabel("Neural analytic mapping for CSV asset matrices.")
        up_desc.setStyleSheet(f"color: {self.theme['text_muted']}; font-size: 16px; margin-bottom: 50px;")
        
        btn_browse = QPushButton("INITIALIZE DECRYPTION")
        btn_browse.setFixedSize(340, 70)
        btn_browse.setStyleSheet(f"QPushButton {{ background-color: {self.theme['accent']}; color: white; border-radius: 24px; font-weight: 900; font-size: 13px; tracking: 1px; }} QPushButton:hover {{ background-color: #1d4ed8; }}")
        btn_browse.clicked.connect(self.upload_file)
        
        upload_vbox.addWidget(up_title, 0, Qt.AlignCenter)
        upload_vbox.addWidget(up_desc, 0, Qt.AlignCenter)
        upload_vbox.addWidget(btn_browse, 0, Qt.AlignCenter)
        ing_layout.addWidget(upload_area)

        self.stack.addWidget(self.page_dash)
        self.stack.addWidget(self.page_monitors)
        self.stack.addWidget(self.page_ingest)
        
        layout.addWidget(sidebar)
        layout.addWidget(self.stack)
        self.set_tab(2)

    def create_nav_btn(self, icon_char, label, index):
        # Increased leading space for icon alignment
        btn = QPushButton(f"  {icon_char}   {label.upper()}")
        btn.setCheckable(True)
        btn.setFixedHeight(60)
        btn.setCursor(Qt.PointingHandCursor)
        btn.setStyleSheet(f"""
            QPushButton {{ 
                background-color: transparent; 
                color: {self.theme['text_secondary']}; 
                text-align: left; 
                padding-left: 25px; 
                border-radius: 18px; 
                font-weight: 900; 
                font-size: 12px; 
                border: none; 
                letter-spacing: 2px; 
            }} 
            QPushButton:hover {{ background-color: {self.theme['border']}; color: white; }} 
            QPushButton:checked {{ background-color: {self.theme['accent']}; color: white; }}
        """)
        btn.clicked.connect(lambda: self.set_tab(index))
        self.nav_btns.append(btn)
        return btn

    def set_tab(self, index):
        for i, btn in enumerate(self.nav_btns):
            btn.setChecked(i == index)
        self.stack.setCurrentIndex(index)

    def update_threshold(self, val):
        self.pressure_threshold = val
        self.thresh_val.setText(f"LIMIT: {val} bar")
        if self.current_data: self.refresh_ui()

    def toggle_simulation(self, checked):
        self.is_simulating = checked
        if checked:
            self.btn_sim.setText("STOP LIVE SYNC")
            self.sim_timer.start(1000)
        else:
            self.btn_sim.setText("GO LIVE")
            self.sim_timer.stop()

    def run_simulation_step(self):
        if not self.current_data: return
        data = self.current_data['data']
        for row in data:
            row['Flowrate'] = max(0, round(row['Flowrate'] + (np.random.random() - 0.5) * 20, 2))
            row['Pressure'] = max(0, round(row['Pressure'] + (np.random.random() - 0.5) * 4, 2))
            row['Temperature'] = max(0, round(row['Temperature'] + (np.random.random() - 0.5) * 2, 2))
        
        df = pd.DataFrame(data)
        self.current_data['summary'] = {
            "totalCount": len(df),
            "avgFlowrate": round(df['Flowrate'].mean(), 2),
            "avgPressure": round(df['Pressure'].mean(), 2),
            "avgTemperature": round(df['Temperature'].mean(), 2),
            "typeDistribution": df['Type'].value_counts().to_dict() if 'Type' in df.columns else {}
        }
        self.refresh_ui()

    def fetch_history(self):
        try:
            response = requests.get(f"{BASE_URL}/history/", timeout=2)
            if response.status_code == 200:
                history = response.json().get('history', [])
                self.update_history_ui(history[:5])
                self.st_dot.setStyleSheet("color: #10b981;")
                self.st_text.setText("Django Terminal Online")
                self.is_offline_mode = False
            else:
                self.set_offline_status()
        except Exception:
            self.set_offline_status()

    def set_offline_status(self):
        self.st_dot.setStyleSheet("color: #ef4444;")
        self.st_text.setText("Terminal Offline")
        self.is_offline_mode = True

    def update_history_ui(self, history):
        while self.history_layout.count() > 1:
            item = self.history_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        
        for item in history:
            is_active = (self.active_id == item['id'])
            btn = HistoryItem(item, self.load_history_item, self.theme, is_active)
            self.history_layout.insertWidget(self.history_layout.count()-1, btn)
        
        if not history:
            empty = QLabel("Registry Empty")
            empty.setStyleSheet(f"color: {self.theme['text_muted']}; font-size: 11px; font-weight: 900; text-align: center; margin-top: 30px;")
            self.history_layout.insertWidget(0, empty)

    def load_history_item(self, item_data):
        self.current_data = item_data
        self.active_id = item_data['id']
        self.refresh_ui()
        self.fetch_history()
        self.set_tab(0)

    def upload_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Open Asset Matrix", "", "CSV Files (*.csv)")
        if file_path:
            if not self.is_offline_mode:
                try:
                    with open(file_path, 'rb') as f:
                        files = {'file': (os.path.basename(file_path), f, 'text/csv')}
                        response = requests.post(f"{BASE_URL}/upload/", files=files)
                    if response.status_code == 201:
                        res_json = response.json()
                        self.current_data = res_json
                        self.active_id = res_json['id']
                        self.refresh_ui()
                        self.fetch_history()
                        self.set_tab(0)
                        return
                except Exception:
                    pass
            self.process_local_csv(file_path)

    def process_local_csv(self, path):
        try:
            df = pd.read_csv(path)
            summary = {
                "totalCount": len(df),
                "avgFlowrate": round(df['Flowrate'].mean(), 2),
                "avgPressure": round(df['Pressure'].mean(), 2),
                "avgTemperature": round(df['Temperature'].mean(), 2),
                "typeDistribution": df['Type'].value_counts().to_dict() if 'Type' in df.columns else {"General": len(df)}
            }
            self.current_data = {
                "id": f"local-{pd.Timestamp.now().value}",
                "filename": os.path.basename(path) + " (OFFLINE)",
                "data": df.to_dict('records'),
                "summary": summary
            }
            self.active_id = self.current_data["id"]
            self.refresh_ui()
            self.set_tab(0)
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Stream processing failed: {str(e)}")

    def refresh_ui(self):
        if not self.current_data: return
        summary = self.current_data['summary']
        raw_data = self.current_data['data']
        search_txt = self.search_input.text().lower()
        
        filtered = [r for r in raw_data if search_txt in str(r.get('Equipment Name', '')).lower() or search_txt in str(r.get('Type', '')).lower()]
        
        self.card_units.update_value(summary['totalCount'])
        self.card_flow.update_value(summary['avgFlowrate'])
        self.card_press.update_value(summary['avgPressure'])
        self.card_temp.update_value(summary['avgTemperature'])
        
        self.table.setRowCount(len(filtered))
        cols = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature', 'Status']
        self.table.setColumnCount(len(cols))
        self.table.setHorizontalHeaderLabels(cols)
        for i, row in enumerate(filtered):
            for j, col in enumerate(cols):
                if col == 'Status':
                    p = row.get('Pressure', 0)
                    status = "CRITICAL" if p > self.pressure_threshold else "STABLE"
                    item = QTableWidgetItem(status)
                    item.setForeground(QColor("#f43f5e" if status == "CRITICAL" else "#2563eb"))
                else:
                    val = row.get(col, '0')
                    item = QTableWidgetItem(str(val))
                    if col == 'Pressure' and float(val) > self.pressure_threshold:
                        item.setForeground(QColor("#f43f5e"))
                        item.setFont(QFont("Inter", 11, QFont.Black))
                    else:
                        item.setForeground(QColor("#a1a1aa"))
                self.table.setItem(i, j, item)
        self.table.resizeColumnsToContents()
        self.render_charts(summary, raw_data)

    def render_charts(self, summary, raw_data):
        self.fig_pie.clear()
        ax1 = self.fig_pie.add_subplot(111)
        ax1.set_facecolor(self.theme['bg_card'])
        dist = summary['typeDistribution']
        ax1.pie(dist.values(), labels=dist.keys(), autopct='%1.1f%%', colors=['#2563eb', '#f59e0b', '#6366f1', '#06b6d4'], textprops={'color': '#a1a1aa', 'fontsize': 9, 'fontweight': 'bold'})
        ax1.set_title("ASSET CLASSIFICATION", color="#71717a", fontweight="black", fontsize=10, pad=15)
        self.canvas_pie.draw()

        self.fig_scat.clear()
        ax2 = self.fig_scat.add_subplot(111)
        ax2.set_facecolor(self.theme['bg_card'])
        df = pd.DataFrame(raw_data)
        if not df.empty and 'Flowrate' in df.columns and 'Pressure' in df.columns:
            colors = ['#f43f5e' if p > self.pressure_threshold else '#2563eb' for p in df['Pressure']]
            ax2.scatter(df['Flowrate'], df['Pressure'], c=colors, alpha=0.7, edgecolors='white', s=60)
            ax2.set_title("OPERATIONAL DRIFT MATRIX", color="#71717a", fontweight="black", fontsize=10, pad=15)
            ax2.grid(True, color='#27272a', linestyle='--', alpha=0.5)
            ax2.tick_params(colors='#52525b', labelsize=8)
            for spine in ax2.spines.values():
                spine.set_edgecolor('#27272a')
        self.canvas_scat.draw()

    def generate_pdf_report(self):
        if not self.current_data: return
        save_path, _ = QFileDialog.getSaveFileName(self, "Export Technical Audit", f"EquipIQ_Pro_Audit_{self.current_data['filename']}.pdf", "PDF Files (*.pdf)")
        if not save_path: return
        
        try:
            with PdfPages(save_path) as pdf:
                # Page 1: Technical Analysis
                fig = plt.figure(figsize=(8.27, 11.69))
                plt.suptitle(f"EquipIQ Pro Technical Audit Report", fontsize=22, fontweight='black', y=0.96)
                plt.figtext(0.1, 0.92, f"Target Matrix: {self.current_data['filename']}", fontsize=11, color='#52525b')
                plt.figtext(0.1, 0.90, f"Analysis Time: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}", fontsize=9, color='#a1a1aa')
                
                summary = self.current_data['summary']
                stats_box = (f"OPERATIONAL AUDIT SUMMARY\n"
                           f"--------------------------\n"
                           f"Asset Count:          {summary['totalCount']}\n"
                           f"Mean Flow Stability:  {summary['avgFlowrate']} L/h\n"
                           f"Mean Pressure:        {summary['avgPressure']} bar\n"
                           f"Thermal Baseline:     {summary['avgTemperature']} °C")
                plt.figtext(0.1, 0.74, stats_box, fontsize=12, family='monospace', 
                            bbox=dict(facecolor='#f8fafc', alpha=1, edgecolor='#e2e8f0', pad=15, boxstyle='round,pad=1'))

                ax1 = fig.add_subplot(223)
                dist = summary['typeDistribution']
                ax1.pie(dist.values(), labels=dist.keys(), autopct='%1.1f%%', colors=['#2563eb', '#f59e0b', '#6366f1', '#06b6d4'], textprops={'fontsize': 8})
                ax1.set_title("Asset Classification Mapping", fontweight='black', fontsize=10, pad=10)

                ax2 = fig.add_subplot(224)
                df = pd.DataFrame(self.current_data['data'])
                colors = ['#f43f5e' if p > self.pressure_threshold else '#2563eb' for p in df['Pressure']]
                ax2.scatter(df['Flowrate'], df['Pressure'], c=colors, alpha=0.5, s=25)
                ax2.set_xlabel("Flow (L/h)", fontsize=8)
                ax2.set_ylabel("Pressure (bar)", fontsize=8)
                ax2.set_title("Operational Drift Performance", fontweight='black', fontsize=10, pad=10)
                ax2.grid(True, linestyle='--', alpha=0.3)
                
                plt.subplots_adjust(hspace=0.5, wspace=0.3, top=0.85, bottom=0.15)
                pdf.savefig()
                plt.close()

                # Page 2: Full Registry Log
                fig2 = plt.figure(figsize=(8.27, 11.69))
                plt.suptitle("Technical Registry Log", fontsize=16, fontweight='black', y=0.96)
                ax_table = fig2.add_subplot(111)
                ax_table.axis('off')
                
                table_df = df[['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']].head(40)
                table = ax_table.table(cellText=table_df.values, colLabels=table_df.columns, loc='center', cellLoc='left')
                table.auto_set_font_size(False)
                table.set_fontsize(8)
                table.scale(1.1, 2.0)
                
                for (row, col), cell in table.get_celld().items():
                    if row == 0:
                        cell.set_text_props(fontweight='black', color='white')
                        cell.set_facecolor('#0f172a')
                    elif row % 2 == 0:
                        cell.set_facecolor('#f8fafc')

                pdf.savefig()
                plt.close()

            QMessageBox.information(self, "Audit Finalized", "Technical audit archived to PDF with full analytic mapping.")
        except Exception as e:
            QMessageBox.critical(self, "Audit Error", f"Technical report generation failed: {str(e)}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    app.setFont(QFont("Inter", 11))
    window = EquipmentVisualizer()
    window.show()
    sys.exit(app.exec_())
