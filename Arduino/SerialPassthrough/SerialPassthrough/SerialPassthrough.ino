
char textBuffer[512];

void setup() {
  Serial.begin(115200);
  
  Serial1.setRX(17);
  Serial1.setTX(16);
  Serial1.begin(115200);
}

void loop() {
  if (Serial1.available() > 0) {
    int index = 0;
    index = Serial1.readBytesUntil('\n', textBuffer,  511);
    textBuffer[index] = '\0';  // null termination charactererial
}

//  Serial.println(textBuffer);
}
