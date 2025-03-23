(function() {
  const width = 320;
  let height = 0;
  let streaming = false;
  let captureInterval;

  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const photo = document.getElementById('photo');
  const startButton = document.getElementById('startbutton');
  
  // Add result display elements
  const dangerResult = document.createElement('div');
  dangerResult.id = 'danger-result';
  dangerResult.style.marginTop = '10px';
  dangerResult.style.fontWeight = 'bold';
  document.querySelector('.contentarea').appendChild(dangerResult);
  
  const sceneResult = document.createElement('div');
  sceneResult.id = 'scene-result';
  sceneResult.style.marginTop = '5px';
  document.querySelector('.contentarea').appendChild(sceneResult);

  

  // Add loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loading-indicator';
  loadingIndicator.textContent = 'Analyzing image...';
  loadingIndicator.style.display = 'none';
  document.querySelector('.contentarea').appendChild(loadingIndicator);

  // Server communication function
  async function sendImageToBackend(imageData) {
    try {
      loadingIndicator.style.display = 'block';
      errorDisplay.style.display = 'none';
      errorDisplay.textContent = '';
      
      // For danger detection
      const dangerResponse = await fetch('http://localhost:5001/analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          image: imageData.split(',')[1],
          question_type: 'danger'
        })
      });
      
      // For scene description
      const sceneResponse = await fetch('http://localhost:5001/analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          image: imageData.split(',')[1],
          question_type: 'scene'
        })
      });

      if (!dangerResponse.ok || !sceneResponse.ok) {
        throw new Error(`Server error: ${!dangerResponse.ok ? dangerResponse.status : sceneResponse.status}`);
      }
      
      // Process and display responses
      const dangerData = await dangerResponse.json();
      const sceneData = await sceneResponse.json();
      
      // Update the UI with results
      dangerResult.textContent = `Danger detected: ${dangerData.result}`;
      dangerResult.style.color = dangerData.result === 'Yes' ? '#d63031' : '#00b894';
      
      sceneResult.textContent = `Scene: ${sceneData.result}`;
      
      console.log('Image successfully analyzed');
      
    } catch (error) {
      console.error('Analysis failed:', error);
     
    }
  }

  function takepicture() {
    if (!streaming) return;

    const context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
      const imageData = canvas.toDataURL('image/jpeg');
      photo.setAttribute('src', imageData);
      
      // Send to backend for analysis
      sendImageToBackend(imageData);
    }
  }

  function startup() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error(`Camera Error: ${err}`);
        errorDisplay.textContent = `Camera Access Required: ${err.message}`;
        errorDisplay.style.display = 'block';
      });

    video.addEventListener('canplay', () => {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);
        height = isNaN(height) ? width / (4/3) : height;

        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    startButton.addEventListener('click', () => {
      // Toggle automatic capture
      if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
        startButton.textContent = 'Start automatic capture';
      } else {
        captureInterval = setInterval(takepicture, 1000);
        startButton.textContent = 'Stop automatic capture';
      }
    });
  }

  // Cleanup when page closes
  window.addEventListener('beforeunload', () => {
    if (captureInterval) {
      clearInterval(captureInterval);
    }
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
  });

  window.addEventListener('load', startup);
})();