# EchoSignRealtime

A real-time gesture recognition system using KNN machine learning model for sign language detection.

## Project Overview

This project implements real-time gesture recognition using an accelerometer/gyroscope sensor with a KNN (k-Nearest Neighbors) model for classifying hand gestures and sign language movements.

## Directory Structure

- **src/**: Main source code for the firmware
  - `main.cpp`: Main application entry point
  - `predictor.h`: Gesture prediction logic
  - `knn_runtime.h`: KNN model runtime implementation
  - `glove_knn_model.h`: Pre-trained KNN model
  - `scaler_params.h`: Feature scaling parameters
  - `label_names.h`: Gesture class labels
  - `calib.h`: Calibration settings

- **data/**: Raw data and dataset files
  - `dataset.csv`: Combined training dataset
  - `raw_*.txt`: Raw sensor data files for different gestures
  - `index.html`, `main.js`, `style.css`: Web UI files

- **tools/**: Python utility scripts
  - `collect_gesture_data.py`: Data collection tool
  - `train_knn.py`: KNN model training
  - `parse_and_train.py`: Data parsing and model training
  - `merge_logs.py`: Log file merging utility
  - `extract_calib_from_dump.py`: Calibration extraction
  - `web_ui.py`: Web interface server

- **include/**: Header files
- **lib/**: Library files
- **test/**: Test files

## Getting Started

### Prerequisites

- Python 3.x
- PlatformIO (for firmware compilation)
- Required Python packages (see tools directory)

### Data Collection

Collect gesture data using the data collection tool:

```bash
python tools/collect_gesture_data.py
```

### Model Training

Train the KNN model from collected data:

```bash
python tools/train_knn.py data/dataset.csv
```

Or parse and train in one step:

```bash
python tools/parse_and_train.py
```

### Web UI

Start the web interface:

```bash
python tools/web_ui.py
```

The web UI will be available at `http://localhost:5000`

### Firmware Compilation

Build and upload the firmware using PlatformIO:

```bash
pio build
pio upload
```

## Supported Gestures

The system recognizes the following gestures:
- One
- Two
- Three
- Four
- Five
- Rest
- Mid
- Fuck you (offensive gesture detection)

## Key Features

- Real-time gesture recognition
- KNN-based classification
- Web interface for visualization
- Calibration support
- Feature scaling for improved accuracy

## Project Configuration

See `platformio.ini` for PlatformIO configuration details.

## Notes

See `UPGRADE_INSTRUCTIONS.md` for upgrade and migration information.

## License

[Add license information here]

## Author

[Add author information here]
