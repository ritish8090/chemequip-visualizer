# EquipIQ Pro | Hybrid Industrial Analytical Suite

EquipIQ Pro is a high-performance, hybrid telemetry dashboard designed for chemical and industrial plant operators. It provides a unified interface for visualizing equipment parameters (Flow, Pressure, Temperature) across Web and Desktop platforms, powered by a robust Django/Pandas analytics engine.

---

## 🏗 System Architecture

The suite operates as a distributed system to ensure maximum operational flexibility:

*   **Core API (Backend):** Django REST Framework with Pandas for high-speed CSV parsing and SQLite for registry persistence.
*   **Web Dashboard (Frontend):** A React-based SPA utilizing Tailwind CSS for a premium "Zinc" aesthetic and Chart.js for interactive telemetry.
*   **Desktop Terminal (Native):** A PyQt5 application for low-latency native monitoring, featuring Matplotlib-powered technical reporting.

---

## 🚀 Installation & Setup

### 1. Environment Initialization
Ensure you have **Python 3.9+** and **Node.js** (optional for local serving) installed.

```bash
# Clone the repository
cd equipiq-pro

# Create and activate a virtual environment
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install core dependencies
pip install -r requirements.txt
```

### 2. Backend Bootstrapping
The backend handles authentication (registry-based) and data analysis.

```bash
# Apply database migrations
python manage.py migrate

# Start the Analytical API
python manage.py runserver
```
*API will be available at: `http://127.0.0.1:8000/api`*

---

## 🖥 User Interface Launch

### Web Dashboard
The web interface provides global access to the Fleet Mix and Correlation Matrix.
1.  Navigate to the project root.
2.  Open `index.html` via a local server (e.g., Live Server in VS Code) or run:
    ```bash
    # Simple Python server
    python -m http.server 8080
    ```
3.  Access via: `http://localhost:8080`

### Desktop Terminal
The desktop client is optimized for native reporting and live stress testing.
```bash
# Launch the native terminal
python desktop_app.py
```

---

## 📊 Feature Highlights

### 🧪 Neural Sync Ingestion
Upload any standard CSV equipment matrix. The system automatically maps parameters to the fleet model and calculates summary statistics (Mean Flow, Thermal Baselines).

### ⚡ Live Stress Testing
Engage the "Neural Stress Test" to simulate real-time parameter drift. This mode is critical for validating threshold alarms and predictive maintenance windows.

### 📄 Professional Technical Audits
*   **Web:** Generates structured PDF reports using `jsPDF`.
*   **Desktop:** Exports multi-page A4 Technical Audits via `Matplotlib`, including distribution charts and raw registry logs.

---

## 📥 Data Contract (CSV Schema)

To ensure successful ingestion, your CSV files must contain the following headers (case-sensitive):

| Column | Type | Description |
| :--- | :--- | :--- |
| `Equipment Name` | String | Unique identifier for the asset |
| `Type` | String | Category (e.g., Pump, Reactor, Valve) |
| `Flowrate` | Float | Measured in Liters per Hour (L/h) |
| `Pressure` | Float | Measured in bar |
| `Temperature` | Float | Measured in Degrees Celsius (°C) |

---

## 🛠 Tech Stack
- **Languages:** Python 3.9+, TypeScript (React 19)
- **Frameworks:** Django 4.2+, PyQt5
- **Data Science:** Pandas, NumPy, Matplotlib
- **Styling:** Tailwind CSS, Lucide Icons
- **Visualization:** Chart.js, React-Chartjs-2

---

## ⚖ License
Internal Corporate Use Only • Level 4 Security Clearance Required.
© 2025 EquipIQ Systems. All rights reserved.