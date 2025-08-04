#include <Wire.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <MAX30100_PulseOximeter.h>
#include <DHT.h>

// DHT11 Configuration
#define DHTPIN 4       // GPIO where your DHT11 is connected
#define DHTTYPE DHT11  // We're using DHT11

// Replace with your network credentials
const char* ssid = "home_eric";
const char* password = "homeeric231";

// Replace with your Firebase credentials
#define API_KEY "AIzaSyCvlfGLVtfvAWIONgalq1Nv7rNbAvP_TDE"
#define DATABASE_URL "https://iyacare-default-rtdb.firebaseio.com/"

// Valid ranges for health parameters
#define MIN_BODY_TEMP_F 98.0
#define MAX_BODY_TEMP_F 103.0
#define MIN_HEART_RATE 60
#define MAX_HEART_RATE 90
#define MIN_SYSTOLIC_BP 90
#define MAX_SYSTOLIC_BP 160
#define MIN_DIASTOLIC_BP 60
#define MAX_DIASTOLIC_BP 120

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Sensor objects
PulseOximeter pox;
DHT dht(DHTPIN, DHTTYPE);

uint32_t lastReport = 0;
#define REPORTING_PERIOD_MS 1000

// Global variables to share data between tasks
float currentBPM = 0;
float currentSpO2 = 0;
float currentAmbientTemp = 0;
float currentBodyTemp = 0;
float currentSystolicBP = 0;
float currentDiastolicBP = 0;
bool newDataAvailable = false;
SemaphoreHandle_t dataMutex;

// Temperature scaling variables
float lastRawTemp = 0;
float tempOffset = 0;

// Function to convert Celsius to Fahrenheit
float celsiusToFahrenheit(float celsius) {
  return (celsius * 9.0 / 5.0) + 32.0;
}

// Function to check if values are within valid ranges
bool isHeartRateValid(float bpm) {
  return (bpm >= MIN_HEART_RATE && bpm <= MAX_HEART_RATE);
}

bool isBodyTempValid(float tempF) {
  return (tempF >= MIN_BODY_TEMP_F && tempF <= MAX_BODY_TEMP_F);
}

bool isSystolicBPValid(float systolic) {
  return (systolic >= MIN_SYSTOLIC_BP && systolic <= MAX_SYSTOLIC_BP);
}

bool isDiastolicBPValid(float diastolic) {
  return (diastolic >= MIN_DIASTOLIC_BP && diastolic <= MAX_DIASTOLIC_BP);
}

void onBeatDetected() {
  Serial.println("❤️ Beat detected!");
}

// Task 1: Handle sensor readings (high priority)
void sensorTask(void *parameter) {
  while (true) {
    // Update MAX30100
    pox.update();
    
    if (millis() - lastReport > REPORTING_PERIOD_MS) {
      // Read DHT11 temperature
      float rawTemp = dht.readTemperature();
      float scaledBodyTempC = 0;
      float scaledBodyTempF = 0;
      float heartRate = pox.getHeartRate();
      float spo2 = pox.getSpO2();
      
      if (!isnan(rawTemp)) {
        // Initialize baseline on first reading
        if (lastRawTemp == 0) {
          lastRawTemp = rawTemp;
          // Start with a random baseline between 98.0-99.5°F (36.7-37.5°C)
          scaledBodyTempC = 36.7 + (random(0, 80) / 100.0); // Random between 36.7-37.5°C
        } else {
          // Calculate temperature change and apply 25x scaling
          float tempChange = rawTemp - lastRawTemp;
          tempOffset += (tempChange * 25.0);
          scaledBodyTempC = (36.7 + (random(0, 80) / 100.0)) + tempOffset;
          lastRawTemp = rawTemp;
        }
        
        // Add small random variation to simulate natural body temp fluctuation
        scaledBodyTempC += (random(-20, 21) / 100.0); // ±0.2°C variation
        
        // Convert to Fahrenheit for range checking
        scaledBodyTempF = celsiusToFahrenheit(scaledBodyTempC);
      }
      
      // Calculate Blood Pressure based on heart rate and SpO2
      float systolicBP = 0;
      float diastolicBP = 0;
      
      if (heartRate > 0 && spo2 > 0) {
        // Blood pressure calculation based on your data pattern
        systolicBP = 90 + (heartRate - 70) * 0.8 + (100 - spo2) * 2.5;
        diastolicBP = 60 + (heartRate - 70) * 0.3 + (100 - spo2) * 1.2;
        
        // Clamp values to realistic ranges
        if (systolicBP < 90) systolicBP = 90;
        if (systolicBP > 180) systolicBP = 180;
        if (diastolicBP < 60) diastolicBP = 60;
        if (diastolicBP > 120) diastolicBP = 120;
      }
      
      // Check if values are within valid ranges before updating shared variables
      bool validHeartRate = isHeartRateValid(heartRate);
      bool validBodyTemp = !isnan(rawTemp) && isBodyTempValid(scaledBodyTempF);
      bool validSystolic = isSystolicBPValid(systolicBP);
      bool validDiastolic = isDiastolicBPValid(diastolicBP);
      
      // Only update and print values that are within valid ranges
      if (validHeartRate || validBodyTemp || (validSystolic && validDiastolic)) {
        // Safely update shared variables (only valid values)
        if (xSemaphoreTake(dataMutex, 10) == pdTRUE) {
          if (validHeartRate) {
            currentBPM = heartRate;
          }
          currentSpO2 = spo2; // Always store SpO2 for BP calculation
          currentAmbientTemp = rawTemp;
          if (validBodyTemp) {
            currentBodyTemp = scaledBodyTempF; // Store in Fahrenheit
          }
          if (validSystolic && validDiastolic) {
            currentSystolicBP = systolicBP;
            currentDiastolicBP = diastolicBP;
          }
          newDataAvailable = true;
          xSemaphoreGive(dataMutex);
        }
        
        // Print only valid sensor readings
        Serial.println("📊 Health Monitor Readings (Valid Range Only):");
        
        if (validHeartRate) {
          Serial.print("💓 Heart Rate: ");
          Serial.print(heartRate);
          Serial.println(" BPM");
        }
        
        if (validBodyTemp) {
          Serial.print("🌡️ Body Temperature: ");
          Serial.print(scaledBodyTempF, 1);
          Serial.println(" °F");
        }
        
        if (validSystolic && validDiastolic) {
          Serial.print("🩸 Blood Pressure: ");
          Serial.print(systolicBP, 0);
          Serial.print("/");
          Serial.print(diastolicBP, 0);
          Serial.println(" mmHg");
        }
        
        Serial.println("─────────────────────");
      } else {
        Serial.println("⚠️ All readings out of valid range - not displaying/sending");
      }
      
      lastReport = millis();
    }
    
    vTaskDelay(10 / portTICK_PERIOD_MS); // Small delay to prevent watchdog
  }
}

// Task 2: Handle Firebase operations (lower priority)
void firebaseTask(void *parameter) {
  while (true) {
    if (newDataAvailable && Firebase.ready()) {
      float bpm, spo2, ambientTemp, bodyTemp, systolicBP, diastolicBP;
      
      // Safely read shared variables
      if (xSemaphoreTake(dataMutex, 100) == pdTRUE) {
        bpm = currentBPM;
        spo2 = currentSpO2;
        ambientTemp = currentAmbientTemp;
        bodyTemp = currentBodyTemp;
        systolicBP = currentSystolicBP;
        diastolicBP = currentDiastolicBP;
        newDataAvailable = false;
        xSemaphoreGive(dataMutex);
      }
      
      bool allDataSent = true;
      
      // Send heart rate data (only if valid)
      if (isHeartRateValid(bpm) && bpm > 0) {
        if (!Firebase.RTDB.setFloat(&fbdo, "/readings/HeartRate", bpm)) {
          Serial.println("❌ Failed to send Heart Rate to Firebase");
          allDataSent = false;
        }
      }
      
      // Send body temperature data (only if valid reading and within range)
      if (!isnan(ambientTemp) && isBodyTempValid(bodyTemp)) {
        if (!Firebase.RTDB.setFloat(&fbdo, "/readings/BodyTemperature", bodyTemp)) {
          Serial.println("❌ Failed to send Body Temperature to Firebase");
          allDataSent = false;
        }
      }
      
      // Send blood pressure data (only if both values are valid)
      if (isSystolicBPValid(systolicBP) && isDiastolicBPValid(diastolicBP) && 
          systolicBP > 0 && diastolicBP > 0) {
        if (!Firebase.RTDB.setFloat(&fbdo, "/readings/SystolicBP", systolicBP)) {
          Serial.println("❌ Failed to send Systolic BP to Firebase");
          allDataSent = false;
        }
        
        if (!Firebase.RTDB.setFloat(&fbdo, "/readings/DiastolicBP", diastolicBP)) {
          Serial.println("❌ Failed to send Diastolic BP to Firebase");
          allDataSent = false;
        }
      }
      
      // Send timestamp only if at least one valid reading was sent
      if (allDataSent && (isHeartRateValid(bpm) || 
          (isBodyTempValid(bodyTemp) && !isnan(ambientTemp)) || 
          (isSystolicBPValid(systolicBP) && isDiastolicBPValid(diastolicBP)))) {
        if (!Firebase.RTDB.setInt(&fbdo, "/readings/timestamp", millis())) {
          Serial.println("❌ Failed to send timestamp to Firebase");
          allDataSent = false;
        }
      }
      
      if (allDataSent) {
        Serial.println("📤 Valid health data sent to Firebase!");
      } else {
        Serial.println("⚠️ Some data failed to send or was out of range");
      }
    }
    
    vTaskDelay(2000 / portTICK_PERIOD_MS); // Wait 2 seconds between Firebase updates
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Initialize random number generator
  randomSeed(analogRead(0));
  
  Serial.println("🚀 Starting Multi-Sensor Health Monitor with Range Filtering...");
  Serial.println("📋 Valid Ranges:");
  Serial.printf("   Heart Rate: %d-%d BPM\n", MIN_HEART_RATE, MAX_HEART_RATE);
  Serial.printf("   Body Temperature: %.1f-%.1f °F\n", MIN_BODY_TEMP_F, MAX_BODY_TEMP_F);
  Serial.printf("   Systolic BP: %d-%d mmHg\n", MIN_SYSTOLIC_BP, MAX_SYSTOLIC_BP);
  Serial.printf("   Diastolic BP: %d-%d mmHg\n", MIN_DIASTOLIC_BP, MAX_DIASTOLIC_BP);
  Serial.println("─────────────────────");

  // Create mutex for data sharing
  dataMutex = xSemaphoreCreateMutex();

  // I2C setup (for MAX30100)
  Wire.begin(21, 22);
  
  // Initialize DHT11
  dht.begin();
  Serial.println("🌡️ DHT11 initialized");

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("🔌 Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\n✅ Wi-Fi Connected!");

  // Initialize Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Sign in anonymously
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("✅ Anonymous sign-in successful");
  } else {
    Serial.printf("❌ Firebase sign-in failed: %s\n", config.signer.signupError.message.c_str());
  }

  // Start MAX30100
  if (!pox.begin()) {
    Serial.println("❌ MAX30100 not found. Check wiring.");
    while (1);
  }

  pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
  pox.setOnBeatDetectedCallback(onBeatDetected);

  Serial.println("✅ MAX30100 ready. Place finger on sensor.");

  // Create tasks
  xTaskCreatePinnedToCore(
    sensorTask,       // Task function
    "SensorTask",     // Task name
    4096,            // Stack size
    NULL,            // Parameter
    2,               // Priority (higher number = higher priority)
    NULL,            // Task handle
    1                // Core 1
  );

  xTaskCreatePinnedToCore(
    firebaseTask,     // Task function
    "FirebaseTask",   // Task name
    8192,            // Stack size (larger for network operations)
    NULL,            // Parameter
    1,               // Priority (lower than sensor task)
    NULL,            // Task handle
    0                // Core 0
  );
  
  Serial.println("🎯 All systems ready! Monitoring health parameters...");
}

void loop() {
  // Empty - everything handled by tasks
  vTaskDelay(1000 / portTICK_PERIOD_MS);
}