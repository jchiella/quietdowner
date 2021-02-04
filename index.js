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

      ctx = document.querySelector('canvas').getContext('2d');

      javascriptNode.onaudioprocess = () => {
          var array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          var values = 0;

          var length = array.length;
          for (var i = 0; i < length; i++) {
            values += (array[i]);
          }

          var average = values / length;

          // var dbs = Math.round(average - 40);

          ctx.clearRect(0, 0, 100, 300);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 300 - average, 100, 300);
        }
    },
    (err) => {
      console.log("The following error occured: " + err.name);
    });
} else {
  console.log("getUserMedia not supported");
}