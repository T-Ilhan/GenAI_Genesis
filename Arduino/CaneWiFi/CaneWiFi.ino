#include <WiFi.h>
#include "arduino_secrets.h"

char ssid[] = STASSID;             //  your network SSID (name) between the " "
char pass[] = STAPSK;      // your network password between the " "
int keyIndex = 0;                 // your network key Index number (needed only for WEP)
int status = WL_IDLE_STATUS;

// if you don't want to use DNS (and reduce your sketch size)
// use the numeric IP instead of the name for the server:
//IPAddress server(74,125,232,128);  // numeric IP for Google (no DNS)
char server[] = "10.231.222.143";    // name address for Google (using DNS)

// Initialize the Ethernet client library
// with the IP address and port of the server
// that you want to connect to (port 80 is default for HTTP):

#define FALLEN_PIN 18
boolean fallen = false;

WiFiClient client;

int ledPin = LED_BUILTIN;

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  //  while (!Serial);

  enable_WiFi();
  connect_WiFi();

  printWifiStatus();

  Serial1.setRX(17);
  Serial1.setTX(16);
  Serial1.begin(115200);

}

void loop() {
  boolean state = digitalRead(FALLEN_PIN);

   while (client.available()) {

    char c = client.read();

    Serial.write(c);

  }

  if(state != fallen) {
    if(state == true) {
      Serial.println("FALLEN :(");  
    }  
    fallen = state;

    digitalWrite(ledPin, fallen);

    String host = String("Host: ") + String(server);

if (client.connect(server, 5000)) {

 client.stop();
    Serial.println("connected to server");

    // Make a HTTP request:

    client.println("POST /fallen");

    client.println(host.c_str());

    client.println("Connection: close");
    client.println("Content-Type: application/json");

    client.println();
     String jsonData = "{\"userId\":\"DEMO\"}";  // JSON formatted data
    client.println("Content-Length: " + String(jsonData.length()));
    client.println();  // Blank line to indicate end of headers
    client.println(jsonData); // Send the JSON payload

    delay(500);


    

  } else {
    Serial.println("FAILED");  
  }
    
  }
}

void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your board's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");

  Serial.print("To see this page in action, open a browser to http://");
  Serial.println(ip);
}

void enable_WiFi() {
  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  String fv = WiFi.firmwareVersion();
  if (fv < "1.0.0") {
    Serial.println("Please upgrade the firmware");
  }
}

void connect_WiFi() {
  // attempt to connect to Wifi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    status = WiFi.begin(ssid, pass);

    // wait 10 seconds for connection:
    for (int i = 0; i < 10; i++) {
      delay(500);
      digitalWrite(ledPin, HIGH);
      delay(500);
      digitalWrite(ledPin, LOW);
    }
  }

  digitalWrite(ledPin, HIGH);
}
