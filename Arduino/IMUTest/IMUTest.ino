/*
  Arduino LSM9DS1 - Simple Gyroscope

  This example reads the gyroscope values from the LSM9DS1
  sensor and continuously prints them to the Serial Monitor
  or Serial Plotter.

  The circuit:
  - Arduino Nano 33 BLE Sense

  created 10 Jul 2019
  by Riccardo Rizzo

  This example code is in the public domain.
*/

#include <Arduino_LSM6DSOX.h>

float gx, gy, gz;
float ax, ay, az;
float mx, my, mz;

//char textBuffer[512];
char textBuffer[32000];
int textBufferIndex = 0;

void setup() {
  Serial.begin(115200);
  Serial1.begin(115200);

  while(!IMU.begin()) {
    delay(1000);
    Serial.println("Failed to initialize IMU!");
    IMU.end();  
  }

  Serial.println("gX\tgY\tgZ\taX\taY\taZ\tmX\tmY\tmZ");
}

void loop() {

  if (IMU.gyroscopeAvailable()) {
    IMU.readGyroscope(gx, gy, gz);
  }

  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(ax, ay, az);
  }

  //  if (IMU.magneticFieldAvailable()) {
  //      IMU.readMagneticField(mx, my, mz);
  //    }

  if (Serial1.available()) {
    char c = Serial1.read();

    if (c == 'R') { // READ CURRENT SENSOR
      sprintf(textBuffer, "%f\t2f\t%f\t%f\t%f\t%f", gx, gy, gz, ax, ay, az);
      //      Serial.println(textBuffer);
      Serial1.println(textBuffer);
    } else if (c == 'S') { // SAVE DATA

      run:

      Serial.println("GET");
      
      long startTime = millis();

      textBufferIndex = 0;
      
      for (int i = 0; i < 250; i++) {
        while (millis() - startTime < 4 * i);


  if (IMU.gyroscopeAvailable()) {
    IMU.readGyroscope(gx, gy, gz);
  }

  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(ax, ay, az);
  }
        
        textBufferIndex += sprintf(textBuffer + textBufferIndex, "%f\t%f\t%f\t%f\t%f\t%f\t", gx, gy, gz, ax, ay, az);
      }
      
      textBuffer[textBufferIndex] = '\0';
      Serial.println(millis() - startTime);
      Serial.println(strlen(textBuffer));


      int len = strlen(textBuffer);

      Serial1.println(len);

      for(int i = 0; i < len; i+=16) {
        while(!Serial1.available());
        c = Serial1.read();
        if(c == 'S') {
          goto run;
          break;  
        }
        for(int j = 0; j < 16 && i + j < len; j++) {
          Serial1.print(textBuffer[i + j]);  
          Serial.print(textBuffer[i + j]);
        }
      }

      Serial1.println();

//      Serial1.println(textBuffer);
    }
  }
}
