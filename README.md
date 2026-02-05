# ChemEquip Visualizer (Hybrid Web + Desktop)

This project is a hybrid data visualization suite for chemical equipment parameters.

## 🚀 Quick Start

### 1. Setup Python Environment
It is recommended to use a virtual environment.
```bash
python -m venv venv
# Windows: python -m venv venv
# macOS/Linux: source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

### 2. Backend (Django REST Framework)
The backend handles CSV parsing and data persistence (SQLite).
```bash
python manage.py migrate
python manage.py runserver
```

### 3. Web Frontend (React)
A high-performance dashboard for web browsers. Open `index.html` using a local web server (e.g., Live Server in VS Code or `python -m http.server`).

### 4. Desktop Frontend (PyQt5)
A native application for desktop analytics.
```bash
python desktop_app.py
```

## 📊 Sample Data
Use the `sample_equipment_data.csv` provided in the "Import Data" section for an instant demo of the analytics engine.

## 🛠 Tech Stack
- **Web:** React, Tailwind CSS, Chart.js
- **Desktop:** Python, PyQt5, Matplotlib
- **Backend:** Django, Pandas, SQLite
- **Auth:** Basic internal credentialing
