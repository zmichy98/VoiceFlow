//ANGELICA
const frequencyToNoteDB = [
  ['C3', 261.63],
  ['Db3', 277.18],
  ['D3', 293.66],
  ['Eb3', 311.13],
  ['E3', 329.63],
  ['F3', 349.23],
  ['Gb3', 369.99],
  ['G3', 392.00],
  ['Ab3', 415.30],
  ['A3', 440.00],
  ['Bb3', 466.16],
  ['B3', 493.88],

  ['C4', 523.25],
  ['Db4', 554.37],
  ['D4', 587.33],
  ['Eb4', 622.25],
  ['E4', 659.25],
  ['F4', 698.46],
  ['Gb4', 739.99],
  ['G4', 783.99],
  ['Ab4', 830.61],
  ['A4', 880.00],
  ['Bb4', 932.33],
  ['B4', 987.77],

  ['C5', 1046.50],
  ['Db5', 1108.73],
  ['D5', 1174.66],
  ['Eb5', 1244.51],
  ['E5', 1318.51],
  ['F5', 1396.91],
  ['Gb5', 1479.98],
  ['G5', 1567.98],
  ['Ab5', 1661.22],
  ['A5', 1760.00],
  ['Bb5', 1864.66],
  ['B5', 1975.53],

  ['C6', 2093.00]
];

tunerNote = document.getElementById('TunerNote');
var pointer = document.getElementById('pointer');
slider = document.getElementById('freqRange');
var screen = document.getElementById('TunerScreen');
var setTuner = false;
var tunerSwitch = true;
var mediaStream;
let audioContext;
let frequencyInterval;
const windowWidth_value = 100;
const initAudioButton = document.getElementById('initAudioButton')
toggle = false;
initAudioButton.src = 'toggle_switch_on.png';

initAudioButton.addEventListener('click', tunerStartStop('tuner'));
const resultDisplay = document.getElementById('result');

function initAudioContext() {
  changeScreen( true );
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
      //Creazione contesto audio
      
  //Input microfono
  navigator.mediaDevices.getUserMedia({audio : true})
  .then(stream => {
      
      mediaStream = stream;
      const microphone = audioContext.createMediaStreamSource(stream);
      //Inizializzazione low-pass filter
      const lowpassFilter = audioContext.createBiquadFilter();
      lowpassFilter.type = 'lowpass';
      lowpassFilter.frequency.value = 1000;
      //Inizializzazione analyser
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 8192;
      analyser.minDecibels = -90;
      //analyser.maxDecibels = 12;
      microphone.connect(lowpassFilter);
      lowpassFilter.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      var dataArray = new Float32Array(bufferLength);
      var targetNoteIndex = index;
      var targetNote = frequencyToNoteDB[targetNoteIndex];
      tunerNote.value = targetNote;
        

      

      

      //Funzione per la frequenza attuale
      function getFrequency(){
          if(setTuner){
              var frequency = 0;
              analyser.getFloatTimeDomainData(dataArray);
              frequency = window.yin(dataArray, audioContext.sampleRate);
              //var frequency = 175 + slider.value/10;

              var diff = handleNoteDifferences(targetNote, frequency, targetNoteIndex);
              
              
              if(diff[0] <= 100){
                  console.log('TPAIN')
                  if(diff[1] === 'LOW'){
                      value = (100 - diff[0])*0.5 - 50;
                      //document.getElementById('freqRange').value = value;
                      

                  }else if(diff[1] === 'HIGH'){
                      value = (100 + diff[0])*0.5 - 50;
                      //document.getElementById('freqRange').value = value;                       
                      
                  }
                  tunerNote.style.backgroundColor = getColor(diff[0]);
              }else{
                  if(diff[1] === 'LOW'){
                      value = -50;
                  }
                  if(diff[1] === 'HIGH'){
                      value = 50;
                  }
                  tunerNote.style.backgroundColor = '#575454';
              }
              pointer.style.transform = "rotate(" + value + "deg)"; 
              

          }
      }   
          
      frequencyInterval = setInterval(getFrequency,100);
          // this should stop the loop if setTuner is 0
  })
  .catch(error => {
      console.error('Errore apertura microfono', error);
  })
}



//restituisce il valore in centesimi di semitono della differenza tra la frequenza della nota di target e quella misurata dal microfono
function handleNoteDifferences(targetNote, frequency, targetNoteIndex){
  var noteBefore = [];
  var noteAfter = [];
  var stateString = '';
  if((targetNoteIndex - 1) >= 0){
      noteBefore = frequencyToNoteDB[targetNoteIndex - 1];
  }else{
      noteBefore = ['B2',246.94];
  }

  if(targetNoteIndex - (-1) <= frequencyToNoteDB.length){
      noteAfter = frequencyToNoteDB[targetNoteIndex - (-1)];
  }else{
      noteAfter = ['Db6', 2217.462];
  }
  var centDown = (targetNote[1] - noteBefore[1])/100;
  var centUp = (noteAfter[1] - targetNote[1])/100;
  var centDiff = 1010;

  if(frequency < noteBefore[1]){
      stateString = 'LOW'
  }else if(frequency > noteAfter[1]){
      stateString =  'HIGH'
  }else if(frequency <= targetNote[1]){
      centDiff = (targetNote[1] - frequency)/centDown;
      stateString = 'LOW'
  }else if (frequency > targetNote[1]){
      centDiff = (frequency - targetNote[1])/centUp;
      stateString = 'HIGH'
  }
  return [centDiff, stateString];
}

//controllo attivazione tuner

function tunerStartStop(call = ''){
  if(call==='usa'){
      if(!isthrill && tunerSwitch){
          if(mediaStream){
              setTuner = false;
              stopAudioContext()}
          setTuner = true;
          initAudioContext();
      }
  }
  if(call==='tuner'){
      if(!isthrill){
          if(!tunerSwitch){
              tunerSwitch=true;
              initAudioButton.src='toggle_switch_on.png';
              windowWidth = windowWidth_value;
              setTuner = true;
              initAudioContext();
          }else{
              tunerSwitch=false;
              initAudioButton.src='toggle_switch_off.png';
              windowWidth = null;
              setTuner = false;
              stopAudioContext();
          }
      }
  }
  if(call==='thrill'){
      if(isthrill && tunerSwitch && mediaStream){
          windowWidth = null;
          setTuner = false;
          stopAudioContext();            
      }else if(!isthrill && tunerSwitch){
          windowWidth = windowWidth_value;
          setTuner = true;
          initAudioContext();
      }
  }
}

function stopAudioContext() {
  changeScreen( false );
  if (frequencyInterval) {
      clearInterval(frequencyInterval);
      frequencyInterval = null;
  }
  if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
  }
  if (audioContext) {
      audioContext.close();
      audioContext = null;
  }
}


// Convert decimal RGB values to hexadecimal notation
function getColor(makeColor){
  
  var colorShift = Math.round(makeColor*2.55);
  var red = 0 + colorShift;
  var green = 255 - colorShift;
  var blue = 0;
  
  var hexColor = "#" + decimalToHex(red) + decimalToHex(green) + decimalToHex(blue);
  return hexColor
}

function decimalToHex(decimalValue) {
  var hexValue = Math.round(decimalValue).toString(16); // Convert to hexadecimal string
  return hexValue.length == 1 ? "0" + hexValue : hexValue; // Add leading zero if necessary
}

function changeScreen( value ) {
  /*const elements = document.querySelectorAll('.Accordatore');
  elements.forEach(element => {
      if(!element.classList.contains('switch')){
          element.style.opacity = '1';
      }
      element.style.opacity = value; // Cambia il valore di opacità desiderato*/
      let color ='';
      if(value){c1='#E3B505'; c2='#888'}else{c1='#888'; c2='#575454';}
      screen.style='background-image: radial-gradient(farthest-corner at 50% 100%,'+c1+','+c2+')';
  };

  