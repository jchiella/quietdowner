navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

if (navigator.getUserMedia) {
  navigator.getUserMedia({
      audio: true
    },
    (stream) => {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);


      javascriptNode.onaudioprocess = () => {
          var array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          var values = 0;

          var length = array.length;
          for (var i = 0; i < length; i++) {
            values += (array[i]);
          }

          const average = values / length;
          
          renderMeter(average);
        }
    },
    (err) => {
      console.log("The following error occured: " + err.name);
    });
} else {
  console.log("getUserMedia not supported");
}

const renderMeter = (average) => {
  const ctx = document.querySelector('canvas').getContext('2d');
  const dbs = Math.round(average - 40);

  const yellowThreshold = parseInt(document.querySelector('#yellow-threshold').value);
  const redThreshold = parseInt(document.querySelector('#red-threshold').value);

  const dbIndicator = document.querySelector('#dbs');
  dbIndicator.classList.remove('green', 'red', 'yellow');

  ctx.clearRect(0, 0, 100, 300);
  if (dbs < yellowThreshold) {
    ctx.fillStyle = 'green';
    dbIndicator.classList.add('green');
  } else if (dbs >= yellowThreshold && dbs < redThreshold) {
    ctx.fillStyle = 'yellow';
    dbIndicator.classList.add('yellow');
  } else if (dbs >= redThreshold) {
    ctx.fillStyle = 'red';
    dbIndicator.classList.add('red');
  }
  ctx.fillRect(0, 300 - average, 100, 300);

  dbIndicator.textContent = `${dbs} dB`;
}