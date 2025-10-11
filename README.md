# Heavy Traffic Indicators on I-94 🚗🚦

> An analysis of the Metro Interstate Traffic Volume dataset to uncover the primary factors causing heavy traffic on the I-94 westbound.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Libraries](https://img.shields.io/badge/Libraries-Pandas%20%7C%20Matplotlib%20%7C%20Seaborn-orange.svg)

---

## 🧠 About The Project

This project performs an in-depth exploratory data analysis (EDA) on the "Metro Interstate Traffic Volume" dataset. The primary goal is to identify and visualize the key indicators of heavy traffic. By examining temporal patterns, we can determine when the I-94 is most likely to be congested.

### 📊 Key Findings & Analysis

The analysis reveals strong correlations between traffic volume and time-related features:

* **Time of Day:** Traffic peaks during morning (6-8 AM) and evening (3-6 PM) rush hours on business days.
* **Day of the Week:** Weekdays experience significantly higher traffic volume compared to weekends.
* **Monthly/Seasonal Trends:** Traffic volume tends to be lower during the winter months (November-February) and higher during the summer and autumn.

---

## 💾 Dataset

The analysis is based on the **Metro Interstate Traffic Volume Dataset** from the UCI Machine Learning Repository. It contains hourly westbound traffic volume data for the I-94 interstate highway near Minneapolis-St. Paul, MN, from 2012 to 2018.

* **Source:** [UCI Machine Learning Repository](https://archive.ics.uci.edu/ml/datasets/Metro+Interstate+Traffic+Volume)

---

## 🛠️ Tools & Libraries

This project is built using Python and the following core data science libraries:

* **[Pandas](https://pandas.pydata.org/):** For data manipulation, cleaning, and analysis.
* **[Matplotlib](https://matplotlib.org/):** For creating static and interactive visualizations.
* **[Seaborn](https://seaborn.pydata.org/):** For generating beautiful and informative statistical graphics.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for analysis and development purposes.

### Prerequisites

* Python 3.8 or higher
* Jupyter Notebook or JupyterLab

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/yatharth7115/Heavy-Traffic-Indicators-on-I-94.git](https://github.com/yatharth7115/Heavy-Traffic-Indicators-on-I-94.git)
    cd Heavy-Traffic-Indicators-on-I-94
    ```
2.  **Create and activate a virtual environment (Recommended):**
    ```sh
    # For macOS & Linux
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  **Install the required dependencies:**
    *If a `requirements.txt` file is available:*
    ```sh
    pip install -r requirements.txt
    ```
    *Otherwise, install manually:*
    ```sh
    pip install pandas matplotlib seaborn jupyter
    ```

---

## ▶️ How to Run the Analysis

Launch the Jupyter Notebook to view and run the step-by-step analysis:

```sh
jupyter notebook "Heavy Traffic Indicators on I-94.ipynb"
