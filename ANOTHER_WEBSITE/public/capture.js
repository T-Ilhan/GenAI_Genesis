(function() {
  const width = 320;
  let height = 0;
  let streaming = false;
  let captureInterval;

  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const photo = document.getElementById('photo');

  // Add error display element
  const errorDisplay = document.createElement('div');
  errorDisplay.style.color = 'red';
  errorDisplay.style.marginTop = '10px';
  document.querySelector('.contentarea').appendChild(errorDisplay);

  // Add loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.textContent = 'Sending to server...';
  loadingIndicator.style.display = 'none';
  document.querySelector('.contentarea').appendChild(loadingIndicator);

  // New: Server communication function
  async function sendImageToBackend(imageData) {
    try {
      loadingIndicator.style.display = 'block';
      errorDisplay.textContent = '';
      
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          image: imageData.split(',')[1] // Remove data URL prefix
        })
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      console.log('Image successfully sent to backend');
      
    } catch (error) {
      console.error('Upload failed:', error);
      errorDisplay.textContent = `Error: ${error.message}`;
    } finally {
      loadingIndicator.style.display = 'none';
    }
  }

  // Modified: Add server communication
  function takepicture() {
    if (!streaming) return;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);
    const imageData = canvas.toDataURL('image/jpeg');
    photo.src = imageData;
    
    // Send to backend
    sendImageToBackend(imageData);
  }

  (function() {
    const width = 320;
    let height = 0;
    let streaming = false;
    let captureInterval;
  
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const photo = document.getElementById('photo');
  
    function startup() {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          video.srcObject = stream;
          video.play();
        })
        .catch(err => {
          console.error(`Camera Error: ${err}`);
          alert(`Camera Access Required: ${err.message}`);
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
  
          // Start automatic capture every second
          captureInterval = setInterval(takepicture, 1000);
        }
      }, false);
    }
  
    function takepicture() {
      if (!streaming) return;
  
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, width, height);
      const data = canvas.toDataURL('image/jpeg');
      photo.src = data;
  
      // For ChatGPT integration later:
      // sendToChatGPT(data); 
    }
  
    // Cleanup when page closes
    window.addEventListener('beforeunload', () => {
      clearInterval(captureInterval);
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
    });
  
    window.addEventListener('load', startup);
  })();
})();