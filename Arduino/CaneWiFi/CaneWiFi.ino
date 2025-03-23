#include <WiFi.h>

char ssid[] = STASSID;             //  your network SSID (name) between the " "
char pass[] = STAPSK;      // your network password between the " "
int keyIndex = 0;                 // your network key Index number (needed only for WEP)
int status = WL_IDLE_STATUS;      //connection status
WiFiServer server(80);            //server socket

WiFiClient client = server.available();

int ledPin = LED_BUILTIN;
boolean fallen = false;

#define FALLEN_PIN 18

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  pinMode(FALLEN_PIN, INPUT);

  Serial1.setRX(17);
  Serial1.setTX(16);
  Serial1.begin(115200);

}

void loop() {

  boolean state = digitalRead(FALLEN_PIN);

  if(state != fallen) {
    if(state == true) {
      Serial.println("FALLEN :(");  
    }  
    fallen = state;

    digitalWrite(ledPin, fallen);
  }

//  while(Serial1.available()) {
//    Serial1.read();  
//  }
//  
//  client = server.available();
//
//  if (client) {
//    printWEB();
//  }
}

//void printWifiStatus() {
//  // print the SSID of the network you're attached to:
//  Serial.print("SSID: ");
//  Serial.println(WiFi.SSID());
//
//  // print your board's IP address:
//  IPAddress ip = WiFi.localIP();
//  Serial.print("IP Address: ");
//  Serial.println(ip);
//
//  // print the received signal strength:
//  long rssi = WiFi.RSSI();
//  Serial.print("signal strength (RSSI):");
//  Serial.print(rssi);
//  Serial.println(" dBm");
//
//  Serial.print("To see this page in action, open a browser to http://");
//  Serial.println(ip);
//}
//
//void enable_WiFi() {
//  // check for the WiFi module:
//  if (WiFi.status() == WL_NO_MODULE) {
//    Serial.println("Communication with WiFi module failed!");
//    // don't continue
//    while (true);
//  }
//
//  String fv = WiFi.firmwareVersion();
//  if (fv < "1.0.0") {
//    Serial.println("Please upgrade the firmware");
//  }
//}
//
//void connect_WiFi() {
//  // attempt to connect to Wifi network:
//  while (status != WL_CONNECTED) {
//    Serial.print("Attempting to connect to SSID: ");
//    Serial.println(ssid);
//    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
//    status = WiFi.begin(ssid, pass);
//
//    // wait 10 seconds for connection:
//    for (int i = 0; i < 10; i++) {
//      delay(500);
//      digitalWrite(ledPin, HIGH);
//      delay(500);
//      digitalWrite(ledPin, LOW);
//    }
//  }
//
//  digitalWrite(ledPin, HIGH);
//}

//void printWEB() {
//
//  if (client) {                             // if you get a client,
//    Serial.println("new client");           // print a message out the serial port
//    String currentLine = "";                // make a String to hold incoming data from the client
//    boolean readData = false;
//    while (client.connected()) {            // loop while the client's connected
//      if (client.available()) {             // if there's bytes to read from the client,
//        char c = client.read();             // read a byte, then
//        Serial.write(c);                    // print it out the serial monitor
//        if (c == '\n') {                    // if the byte is a newline character
//
//          // if the current line is blank, you got two newline characters in a row.
//          // that's the end of the client HTTP request, so send a response:
//          if (currentLine.length() == 0) {
//
//            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
//            // and a content-type so the client knows what's coming, then a blank line:
//            client.println("HTTP/1.1 200 OK");
//            client.println("Content-type:text/html");
//            client.println();
//
//            if (readData) {
//
//
//              textBufferIndex = 0;
//
//              client.println("Reading sensor data...");
//
//              long startTime = millis();
//
//              Serial1.print("S");
//
//
//
//              //            for (int i = 0; i < 250; i++) {
//              //              while(millis() - startTime < 4 * i);
//              //              long iterationStart = millis();
//              //
//              //              Serial1.print("R");
//              //              textBufferIndex += Serial1.readBytesUntil('\n', textBuffer + textBufferIndex,  32000 - textBufferIndex - 1);
//              //              textBuffer[textBufferIndex] = '\0';  // null termination character
//              //
//              //              Serial.println(millis() - iterationStart);
//              //            }
//
//              delay(1000);
//
//              while(!Serial1.available());
//
//              delay(100);
//
//              int len = Serial1.parseInt();
//
//              client.print("length: ");
//              client.println(len);
//
//              Serial.print("length: ");
//              Serial.println(len);
//
//              for(int i = 0; i < len; i+=16) {
//                Serial1.print("!");
//                for(int j = 0; j < 16 && i + j < len; j++) {
//                  while(!Serial1.available());
//                  textBuffer[i + j] = Serial1.read();  
//                  Serial.print(textBuffer[i + j]);
//                }
//              }
//
////              int textBufferIndex = Serial1.readBytesUntil('\n', textBuffer,  32000 - 2);
//              textBuffer[len] = '\0';  // null termination character
//
//              client.println("Done reading!!");
//              client.print("Took ");
//              client.print(millis() - startTime);
//              client.println("ms");
//
//              client.print(textBuffer);
//            }
//
//            // The HTTP response ends with another blank line:
//            client.println();
//
//            // break out of the while loop:
//            break;
//          }
//
//          else {      // if you got a newline, then clear currentLine:
//            currentLine = "";
//          }
//        }
//        else if (c != '\r') {    // if you got anything else but a carriage return character,
//          currentLine += c;      // add it to the end of the currentLine
//        }
//
//
//        if (currentLine.endsWith("GET /READ")) {
//          readData = true;
//        }
//      }
//    }
//    // close the connection:
//    client.stop();
//    Serial.println("client disconnected");
//  }
//}
