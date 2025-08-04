# IoT Health Monitoring Hardware

A real-time IoT health monitoring system using ESP32 microcontroller that tracks vital signs and transmits data to Firebase Realtime Database for integration with the IyàCare platform.

## Overview

This IoT component serves as the hardware interface for the IyàCare maternal healthcare system, providing real-time monitoring of essential health parameters for remote patient monitoring.

## Features

### Multi-Parameter Monitoring
- **Heart Rate**: Real-time BPM tracking (60-90 BPM valid range)
- **Blood Oxygen**: SpO2 levels measurement via MAX30100 sensor
- **Body Temperature**: Precise temperature monitoring (98-103°F valid range)
- **Blood Pressure**: Calculated systolic/diastolic readings (90-160/60-120 mmHg)

### Advanced Capabilities
- **Dual-Core Processing**: Sensor reading and Firebase operations on separate cores
- **Smart Filtering**: Only medically valid readings are processed and stored
- **Real-time Cloud Sync**: Instant data upload to Firebase Realtime Database
- **Thread-Safe Operations**: Mutex-protected data sharing between tasks
- **Automatic Range Validation**: Filters out unrealistic health measurements

## Hardware Requirements

| Component | Specification | Purpose |
|-----------|---------------|---------|
| ESP32 DevKit | 240MHz Dual-Core | Main microcontroller |
| MAX30100 | Pulse Oximeter | Heart rate & SpO2 sensing |
| DHT11 | Temperature Sensor | Body temperature measurement |
| Jumper Wires | Male-to-Female | Circuit connections |
| Breadboard | Half-size | Component mounting |

## Wiring Diagram

```
ESP32 DevKit v1    →    MAX30100
─────────────────────────────────
3.3V               →    VCC
GND                →    GND
GPIO 21 (SDA)      →    SDA
GPIO 22 (SCL)      →    SCL

ESP32 DevKit v1    →    DHT11
─────────────────────────────────
3.3V               →    VCC
GND                →    GND
GPIO 4             →    DATA
```

## Valid Health Parameter Ranges

The system only processes and stores medically realistic values:

| Parameter | Valid Range | Unit |
|-----------|-------------|------|
| Heart Rate | 60 - 90 | BPM |
| Body Temperature | 98.0 - 103.0 | °F |
| Systolic BP | 90 - 160 | mmHg |
| Diastolic BP | 60 - 120 | mmHg |

**Note**: Values outside these ranges are automatically filtered out and not transmitted to Firebase.

## Setup Instructions

### 1. Software Setup

Install required Arduino libraries through Arduino IDE Library Manager:

- **Firebase ESP32 Client** by Mobizt
- **MAX30100lib** by OXullo Intersecans  
- **DHT sensor library** by Adafruit

### 2. Configuration

Update the following configuration in `health_monitor.ino`:

```cpp
// WiFi Configuration
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// Firebase Configuration  
#define API_KEY "YOUR_FIREBASE_API_KEY"
#define DATABASE_URL "YOUR_FIREBASE_DATABASE_URL"
```

### 3. Hardware Assembly

1. Connect MAX30100 sensor to ESP32 I2C pins (GPIO 21/22)
2. Connect DHT11 temperature sensor to GPIO 4
3. Ensure proper power connections (3.3V and GND)
4. Verify all connections match the wiring diagram

### 4. Upload and Test

1. Connect ESP32 to computer via USB
2. Select "ESP32 Dev Module" in Arduino IDE
3. Upload `health_monitor.ino`
4. Open Serial Monitor (115200 baud rate)
5. Place finger on MAX30100 sensor
6. Monitor real-time readings in Serial output

## Data Structure

The system transmits data to Firebase in the following JSON format:

```json
{
  "readings": {
    "HeartRate": 75.5,
    "BodyTemperature": 98.9,
    "SystolicBP": 120.0,
    "DiastolicBP": 80.0,
    "timestamp": 1640995200000
  }
}
```

## System Architecture

### Task 1: Sensor Reading (Core 1, High Priority)
- Continuously reads MAX30100 and DHT11 sensors
- Applies smart filtering algorithms
- Updates shared variables with mutex protection
- Validates readings against medical ranges

### Task 2: Firebase Sync (Core 0, Lower Priority)
- Handles all network operations
- Uploads only validated health data
- Maintains connection stability
- Manages authentication with Firebase

## Performance Specifications

- **Sampling Rate**: 1Hz (1 reading per second)
- **Firebase Upload**: Every 2 seconds
- **Memory Usage**: ~12KB total
- **Power Consumption**: ~250mA @ 3.3V
- **Response Time**: <100ms for sensor readings

## Troubleshooting

### Common Issues and Solutions

| Problem | Solution |
|---------|----------|
| No heart rate detected | Ensure finger placement covers both LEDs on MAX30100 |
| Temperature always 98.6°F | Check DHT11 wiring and allow 2-3 minutes for stabilization |
| Firebase connection fails | Verify API key, database URL, and WiFi credentials |
| Sensor not found | Check I2C wiring (SDA/SCL) and power connections |

### Expected Serial Monitor Output

```
🚀 Starting Multi-Sensor Health Monitor...
✅ Wi-Fi Connected!
✅ Firebase ready!
💓 Heart Rate: 72 BPM
🌡️ Body Temperature: 99.1 °F
🩸 Blood Pressure: 115/75 mmHg
📤 All health data sent to Firebase!
```

## Integration with IyàCare Platform

This IoT system is designed to work seamlessly with the IyàCare maternal healthcare platform:

1. **Real-time Data**: Live readings appear instantly on the IyàCare dashboard
2. **AI Integration**: Sensor data is automatically processed by the AI risk assessment model
3. **Patient Monitoring**: Healthcare providers can monitor patients remotely
4. **Alert System**: Abnormal readings trigger automated alerts

## File Structure

```
iot-hardware/
│
├── health_monitor.ino      # Main Arduino code
├── README.md              # This documentation
└── docs/
    ├── wiring_diagram.png # Circuit connections (optional)
    └── setup_guide.md     # Detailed setup instructions (optional)
```

## Future Enhancements

- **Battery Optimization**: Low-power mode for extended operation
- **Additional Sensors**: ECG, blood glucose monitoring
- **Edge Computing**: Local AI processing on ESP32
- **Wireless Charging**: Inductive charging capabilities
- **Waterproof Enclosure**: For hospital-grade durability

## Support

For hardware-specific questions or issues:

1. Check the troubleshooting section above
2. Verify all wiring connections
3. Ensure Firebase configuration is correct
4. Check Arduino library versions for compatibility

## License

This IoT hardware component is part of the IyàCare platform and follows the same licensing terms as the main project.
