/*
 * AI Smart Kachra Vahan — ESP32 Servo Controller
 * ================================================
 * Receives MQTT messages from the Python YOLO server and
 * drives 3 servo motors to sort waste into 4 compartments.
 *
 * MECHANICAL LAYOUT (top-down view of your cardboard model):
 *
 *       E (recycle)          F (bio)
 *            \              /
 *        B ←←← [servo1] →→→ A        ← TOP DISC
 *                  |
 *              [servo3]               ← SELECTOR (center)
 *                  |
 *        C ←←← [servo2] →→→ D        ← BOTTOM DISC
 *            /              \
 *       G (mix)           H (hazard)
 *
 * SERVO ROLES:
 *   servo1 (pin 12) — rotates top disc:     A ↔ B
 *   servo2 (pin 14) — rotates bottom disc:  C ↔ D
 *   servo3 (pin 13) — selector arm: tilts RIGHT (top) or LEFT (bottom)
 *
 * WASTE → COMPARTMENT MAPPING:
 *   Biodegradable → A → dumps to F
 *   Recyclable    → B → dumps to E
 *   Mixed         → C → dumps to G
 *   Hazardous     → D → dumps to H
 *
 * MQTT: subscribes to "swachh/waste_detection" on broker.emqx.io
 *       Payload is JSON: {"waste_type": "Biodegradable", "timestamp": ...}
 *       Uses indexOf() substring match so it works with any JSON format.
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>

// ======================== WIFI ========================
const char* ssid     = "Lawrence2.4";
const char* password = "11223344";

// ======================== MQTT ========================
const char* mqtt_server = "broker.emqx.io";
const int   mqtt_port   = 1883;
const char* topic       = "swachh/waste_detection";

// Unique client ID (add random suffix to avoid collisions)
String clientId = "ESP32_KachraVahan_" + String(random(1000, 9999));

WiFiClient   espClient;
PubSubClient client(espClient);

// ======================== SERVOS ========================
Servo servo1;  // Top disc    (A / B)
Servo servo2;  // Bottom disc (C / D)
Servo servo3;  // Selector arm

// ======================== POSITIONS ========================
// Top disc (servo1)
const int POS_A = 0;    // A under servo3 (default)
const int POS_B = 90;   // B under servo3

// Bottom disc (servo2)
const int POS_C = 0;    // C under servo3 (default)
const int POS_D = 90;   // D under servo3

// Selector arm (servo3)
const int TILT_LEFT   = 25;   // dumps onto bottom disc
const int TILT_CENTER = 80;   // neutral / holding
const int TILT_RIGHT  = 115;  // dumps onto top disc

// Movement delay (ms) — increase if servos are slow
const int MOVE_DELAY = 1000;

// ======================== BUSY FLAG ========================
// Prevents overlapping MQTT messages from interrupting a sequence
volatile bool busy = false;

// ============================================================
// WASTE SORTING FUNCTIONS
// ============================================================

/*
 * BIO → compartment F
 * 1. Ensure A is under servo3 (POS_A)
 * 2. Servo3 tilts RIGHT → waste drops onto A
 * 3. Servo3 returns to CENTER
 * 4. Servo1 rotates to POS_B → A slides waste out to F
 * 5. Servo1 returns to POS_A (ready for next)
 */
void bio() {
  Serial.println("🌿 BIO → F");

  // Step 1: position A under servo3
  servo1.write(POS_A);
  delay(MOVE_DELAY);

  // Step 2: dump onto top disc (A)
  servo3.write(TILT_RIGHT);
  delay(MOVE_DELAY);

  // Step 3: return selector
  servo3.write(TILT_CENTER);
  delay(MOVE_DELAY);

  // Step 4: rotate top disc → A slides to F
  servo1.write(POS_B);
  delay(MOVE_DELAY);

  // Step 5: return to default
  servo1.write(POS_A);
  delay(MOVE_DELAY);

  Serial.println("✅ BIO done");
}

/*
 * RECYCLE → compartment E
 * 1. Rotate servo1 to bring B under servo3 (POS_B)
 * 2. Servo3 tilts RIGHT → waste drops onto B
 * 3. Servo3 returns to CENTER
 * 4. Servo1 rotates to POS_A → B slides waste out to E
 * 5. Stays at POS_A (default already)
 */
void recycle() {
  Serial.println("♻️ RECYCLE → E");

  // Step 1: position B under servo3
  servo1.write(POS_B);
  delay(MOVE_DELAY);

  // Step 2: dump onto top disc (B)
  servo3.write(TILT_RIGHT);
  delay(MOVE_DELAY);

  // Step 3: return selector
  servo3.write(TILT_CENTER);
  delay(MOVE_DELAY);

  // Step 4: rotate top disc → B slides to E
  servo1.write(POS_A);
  delay(MOVE_DELAY);

  // Already at default position
  Serial.println("✅ RECYCLE done");
}

/*
 * MIX → compartment G
 * 1. Ensure C is under servo3 (POS_C)
 * 2. Servo3 tilts LEFT → waste drops onto C
 * 3. Servo3 returns to CENTER
 * 4. Servo2 rotates to POS_D → C slides waste out to G
 * 5. Servo2 returns to POS_C (ready for next)
 */
void mixWaste() {
  Serial.println("🗑️ MIX → G");

  // Step 1: position C under servo3
  servo2.write(POS_C);
  delay(MOVE_DELAY);

  // Step 2: dump onto bottom disc (C)
  servo3.write(TILT_LEFT);
  delay(MOVE_DELAY);

  // Step 3: return selector
  servo3.write(TILT_CENTER);
  delay(MOVE_DELAY);

  // Step 4: rotate bottom disc → C slides to G
  servo2.write(POS_D);
  delay(MOVE_DELAY);

  // Step 5: return to default
  servo2.write(POS_C);
  delay(MOVE_DELAY);

  Serial.println("✅ MIX done");
}

/*
 * HAZARD → compartment H
 * 1. Rotate servo2 to bring D under servo3 (POS_D)
 * 2. Servo3 tilts LEFT → waste drops onto D
 * 3. Servo3 returns to CENTER
 * 4. Servo2 rotates to POS_C → D slides waste out to H
 * 5. Stays at POS_C (default already)
 */
void hazard() {
  Serial.println("⚠️ HAZARD → H");

  // Step 1: position D under servo3
  servo2.write(POS_D);
  delay(MOVE_DELAY);

  // Step 2: dump onto bottom disc (D)
  servo3.write(TILT_LEFT);
  delay(MOVE_DELAY);

  // Step 3: return selector
  servo3.write(TILT_CENTER);
  delay(MOVE_DELAY);

  // Step 4: rotate bottom disc → D slides to H
  servo2.write(POS_C);
  delay(MOVE_DELAY);

  // Already at default position
  Serial.println("✅ HAZARD done");
}

// ============================================================
// MQTT CALLBACK
// ============================================================
void callback(char* topic, byte* payload, unsigned int length) {
  // Guard: if a sorting sequence is running, ignore new messages
  if (busy) {
    Serial.println("⏳ Busy sorting — ignoring message");
    return;
  }

  String msg = "";
  for (unsigned int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  Serial.println("\n====== MQTT RECEIVED ======");
  Serial.println(msg);
  Serial.println("===========================");

  busy = true;

  // Match waste type from JSON payload (substring match)
  if (msg.indexOf("Biodegradable") != -1) {
    bio();
  } else if (msg.indexOf("Recyclable") != -1) {
    recycle();
  } else if (msg.indexOf("Mixed") != -1) {
    mixWaste();
  } else if (msg.indexOf("Hazardous") != -1) {
    hazard();
  } else {
    Serial.println("❓ Unknown waste type — no action");
  }

  busy = false;
  Serial.println("🟢 Ready for next detection\n");
}

// ============================================================
// MQTT RECONNECT
// ============================================================
void reconnect() {
  while (!client.connected()) {
    Serial.print("🔌 Connecting MQTT... ");

    if (client.connect(clientId.c_str())) {
      Serial.println("Connected! ✅");
      client.subscribe(topic, 1);  // QoS 1 for reliable delivery
      Serial.print("📡 Subscribed to: ");
      Serial.println(topic);
    } else {
      Serial.print("Failed (rc=");
      Serial.print(client.state());
      Serial.println(") retrying in 3s...");
      delay(3000);
    }
  }
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n========================================");
  Serial.println("  AI Smart Kachra Vahan — Servo Module  ");
  Serial.println("========================================\n");

  // Attach servos
  servo1.attach(12);
  servo2.attach(14);
  servo3.attach(13);

  // Set all to default positions
  servo1.write(POS_A);
  servo2.write(POS_C);
  servo3.write(TILT_CENTER);
  Serial.println("🔧 Servos initialized (A, C, CENTER)");

  // Connect WiFi
  Serial.print("📶 Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
    if (wifiAttempts > 40) {
      Serial.println("\n❌ WiFi failed after 20s — restarting...");
      ESP.restart();
    }
  }

  WiFi.setSleep(false);  // Keep WiFi active for MQTT
  Serial.println();
  Serial.print("✅ WiFi connected! IP: ");
  Serial.println(WiFi.localIP());

  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  client.setBufferSize(512);  // Handle larger JSON payloads

  reconnect();

  Serial.println("\n🟢 System ready — waiting for waste detection...\n");
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
