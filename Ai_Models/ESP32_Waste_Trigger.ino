/*
 * AI Smart Kachra Vahan — ESP32-CAM Trigger Sketch
 * -----------------------------------------------
 * This sketch does three things:
 * 1. Runs a standard Camera Web Server (for the AI Server to capture from).
 * 2. Monitor an Ultrasonic Sensor (HC-SR04).
 * 3. When an object is detected, it triggers the AI Server's /detect-from-cam endpoint.
 *
 * PINS (AI-Thinker ESP32-CAM):
 * - TRIG: GPIO 13
 * - ECHO: GPIO 12
 * - FLASH: GPIO 4 (Standard)
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>

// --- CONFIGURATION ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://191.168.x.x:8000/detect-from-cam"; // Update with your PC's IP

#define TRIG_PIN 13
#define ECHO_PIN 12
#define DISTANCE_THRESHOLD 20 // Trigger when object is closer than 20cm
#define TRIGGER_DELAY 5000    // Wait 5 seconds between triggers to avoid spam

// --- CAMERA PINS (AI-THINKER) ---
#define PWDN_GPIO_NUM     32
#define CONF_PCLK_GPIO_NUM 0
#define CONF_XCLK_GPIO_NUM 10
#define CONF_D7_GPIO_NUM  39
#define CONF_D6_GPIO_NUM  36
#define CONF_D5_GPIO_NUM  21
#define CONF_D4_GPIO_NUM  19
#define CONF_D3_GPIO_NUM  18
#define CONF_D2_GPIO_NUM  5
#define CONF_D1_GPIO_NUM  4
#define CONF_D0_GPIO_NUM  2
#define CONF_V_SYNC_GPIO_NUM 25
#define CONF_H_SYNC_GPIO_NUM 23
#define CONF_H_REF_GPIO_NUM 26

unsigned long lastTriggerTime = 0;

void startCameraServer(); // Defined in standard camera examples

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  // Camera configuration
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = 2;
  config.pin_d1 = 4;
  config.pin_d2 = 5;
  config.pin_d3 = 18;
  config.pin_d4 = 19;
  config.pin_d5 = 21;
  config.pin_d6 = 36;
  config.pin_d7 = 39;
  config.pin_xclk = 0;
  config.pin_pclk = 22;
  config.pin_vsync = 25;
  config.pin_href = 23;
  config.pin_sscb_sda = 26;
  config.pin_sscb_scl = 27;
  config.pin_pwdn = 32;
  config.pin_reset = -1;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if(psramFound()){
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  // Init Camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  // Connect WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("Camera Ready! Use 'http://");
  Serial.print(WiFi.localIP());
  Serial.println("' to connect");

  startCameraServer();
}

long readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  return duration * 0.034 / 2;
}

void loop() {
  long distance = readDistance();
  
  if (distance > 0 && distance < DISTANCE_THRESHOLD) {
    if (millis() - lastTriggerTime > TRIGGER_DELAY) {
      Serial.printf("🚀 Waste detected at %ld cm! Triggering AI...\n", distance);
      
      // Send GET request to server
      if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        int httpCode = http.GET();
        
        if (httpCode > 0) {
          String payload = http.getString();
          Serial.println("✅ Server Response: " + payload);
        } else {
          Serial.println("❌ Trigger failed");
        }
        http.end();
      }
      
      lastTriggerTime = millis();
    }
  }
  
  delay(100);
}

// NOTE: You also need to include the 'app_httpd.cpp' logic for a full web interface, 
// or at least handlers for '/capture' and '/control'.
// This sketch assumes you are adding this logic to the standard 'CameraWebServer' example.
