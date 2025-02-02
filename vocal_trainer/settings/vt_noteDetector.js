/* To have a good explanation of the tuner code take a look at the tuner.js page */

// Initialize the Salamander piano sampler
const piano = new Tone.Sampler({
  urls: {
    "A0": "A0.mp3",
    "C1": "C1.mp3",
    "D#1": "Ds1.mp3",
    "F#1": "Fs1.mp3",
    "A1": "A1.mp3",
    "A2": "A2.mp3",
    "C2": "C2.mp3",
    "D#2": "Ds2.mp3",
    "F#2": "Fs2.mp3",
    "C3": "C3.mp3",
    "D#3": "Ds3.mp3",
    "F#3": "Fs3.mp3",
    "A3": "A3.mp3",
    "C4": "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    "A4": "A4.mp3",
    "C5": "C5.mp3",
    "D#5": "Ds5.mp3",
    "F#5": "Fs5.mp3",
    "A5": "A5.mp3",
    "C6": "C6.mp3",
    "D#6": "Ds6.mp3",
    "F#6": "Fs6.mp3",
    "A6": "A6.mp3",
    "C7": "C7.mp3",
    "D#7": "Ds7.mp3",
    "F#7": "Fs7.mp3",
    "A7": "A7.mp3",
    "C8": "C8.mp3"
  },
  baseUrl: "https://tonejs.github.io/audio/salamander/",
  onload: () => {
    console.log("Piano loaded");
  }
}).toDestination();

document.querySelectorAll('.key').forEach(key => {
  key.addEventListener('click', () => {
    const note = key.getAttribute('data-note');
    piano.triggerAttackRelease(note, "6n");
  });
});

/*------------------------ VOCAL RANGE 3 ------------------------*/
// Accuracy variables
const tuneTollerance = 30;
const minimumRMS = 0.002;       
const fftSize = 2048;
const smoothness = 100;

/*Accuracy variables:
    - tuneTollerance: is the threshold in cents for which you are in tune with a certain frequency

    - minimumRMS: minimum strength of the signal for which is accepted to be analysied

    - fftSize: must be a power of two. Usually the default is 2048, which provides a good balance between frequency resolution and performance.
        - Lower fftSize -->     Larger frequency bins (worse frequency resolution). Better time resolution, faster.
        - Higher fftSize -->    Finer frequency bins (better resolution but slower processing). Worse time resolution, slower. */

// Variables for storing notes
let selectingButtonState = "NotSelecting"
let goalNote = null;
let goalFreq = null;
let firstNote = null;
let secondNote = null;

// Variables for the tuner
let countNoDetection = 0;
let audioContext = null;
let currStream = null;
let source = null;
let analyser = null;
let buffer = new Float32Array(fftSize/2);
let requestAnimationFrameId = null;
const constraints = {audio: true, video: false};

// Get elements by Id
const instructions = document.getElementById('instructions');
const selectNoteBtn = document.getElementById('select-note-btn');
const noteButtons = document.querySelectorAll('.key');
const enableMicBtn = document.getElementById("enable-mic");
const noteElem = document.getElementById("note");
const hzElem = document.getElementById("hz");
const detuneElem = document.getElementById("detune");
const detuneWarning = document.getElementById("detune-warning");
const levelBar = document.getElementById("level-bar");
const levelValue = document.getElementById("level-value");
const next3Button = document.getElementById("next_button");

document.addEventListener("DOMContentLoaded", () => {
  if (enableMicBtn) {
    enableMicBtn.style.display = 'none';
  }
  if (next3Button) {
    next3Button.style.display = 'none';
  }
});

// Notes-Frequencies
const noteFrequencies = [
    { note: "C2", freq: 65.41 },
    { note: "C#2", freq: 69.30 },
    { note: "D2", freq: 73.42 },
    { note: "D#2", freq: 77.78 },
    { note: "E2", freq: 82.41 },
    { note: "F2", freq: 87.31 },
    { note: "F#2", freq: 92.50 },
    { note: "G2", freq: 98.00 },
    { note: "G#2", freq: 103.83 },
    { note: "A2", freq: 110.00 },
    { note: "A#2", freq: 116.54 },
    { note: "B2", freq: 123.47 },
  
    { note: "C3", freq: 130.81 },
    { note: "C#3", freq: 138.59 },
    { note: "D3", freq: 146.83 },
    { note: "D#3", freq: 155.56 },
    { note: "E3", freq: 164.81 },
    { note: "F3", freq: 174.61 },
    { note: "F#3", freq: 185.00 },
    { note: "G3", freq: 196.00 },
    { note: "G#3", freq: 207.65 },
    { note: "A3", freq: 220.00 },
    { note: "A#3", freq: 233.08 },
    { note: "B3", freq: 246.94 },
  
    { note: "C4", freq: 261.63 },
    { note: "C#4", freq: 277.18 },
    { note: "D4", freq: 293.66 },
    { note: "D#4", freq: 311.13 },
    { note: "E4", freq: 329.63 },
    { note: "F4", freq: 349.23 },
    { note: "F#4", freq: 369.99 },
    { note: "G4", freq: 392.00 },
    { note: "G#4", freq: 415.30 },
    { note: "A4", freq: 440.00 },
    { note: "A#4", freq: 466.16 },
    { note: "B4", freq: 493.88 },
  
    { note: "C5", freq: 523.25 },
    { note: "C#5", freq: 554.37 },
    { note: "D5", freq: 587.33 },
    { note: "D#5", freq: 622.25 },
    { note: "E5", freq: 659.25 },
    { note: "F5", freq: 698.46 },
    { note: "F#5", freq: 739.99 },
    { note: "G5", freq: 783.99 },
    { note: "G#5", freq: 830.61 },
    { note: "A5", freq: 880.00 },
    { note: "A#5", freq: 932.33 },
    { note: "B5", freq: 987.77 },
  
    { note: "C6", freq: 1046.50 }
];

/*-------------- TUNER --------------*/
function autoCorrelate( buf, sampleRate ) {
 
  buf = applyHannWindow(buf);

	var SIZE = buf.length;
	var rms = 0;

	for (var i=0; i<SIZE; i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
    console.log("RMS: " + rms);

	if (rms<minimumRMS)
		return -1;

	var r1 = 0, r2 = SIZE-1, thres = 0.2;

  for (var i=0; i<SIZE/2; i++)
		if (Math.abs(buf[i]) < thres){ r1=i; break; }

	for (var i=1; i<SIZE/2; i++)
		if (Math.abs(buf[SIZE-i]) < thres) { r2=SIZE-i; break; }

	buf = buf.slice(r1,r2);
	SIZE = buf.length;

  var maxVal = Math.max(...buf.map(Math.abs));
  if (maxVal > 0) {
      buf = buf.map(x => x / maxVal);
  }

	var c = new Array(SIZE).fill(0);
	for (var i=0; i<SIZE; i++)
		for (var j=0; j<SIZE-i; j++)
			c[i] = c[i] + buf[j] * buf[j+i];
         
    var d=0; while (c[d]>c[d+1]) d++;
  
	var maxval=-1, maxpos=-1;
	for (var i=d; i<SIZE; i++) {
		if (c[i] > maxval) {
			maxval = c[i];
			maxpos = i;
		}
	}
    
	var T0 = maxpos;
  var x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
  let a = (x1 + x3 - 2 * x2) / 2;
  let b = (x3 - x1) / 2;
  if (a) {
      T0 = T0 - b / (2 * a);
  }
	return sampleRate / T0;
}

function applyHannWindow(buf) {
  const SIZE = buf.length;
  for (let i = 0; i < SIZE; i++) {
      buf[i] *= 0.5 * (1 - Math.cos((2 * Math.PI * i) / (SIZE - 1)));
  }
  return buf;
}

function getNotediff(freq) {
  centsDetune = Math.floor( 1200 * Math.log( freq / goalFreq)/Math.log(2) );
  return centsDetune;
}

function updateLevelMeter(detune) {
  let indicator = document.getElementById("tuner-indicator");
  
  if (!indicator) {
      console.error("Errore: elemento tuner-indicator non trovato!");
      return;
  }
  
  let position = ((detune + 50) / 100) * 100; 

  position = Math.min(100, Math.max(0, position));

  indicator.style.left = position + "%";
}

function getMicrophoneStream(){
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            currStream = stream;
            console.log('got microphone stream');
            console.log(stream);

            stream.getTracks().forEach(track => {
              track.addEventListener("ended", () => {
                  console.warn("Track ended unexpectedly, reinitializing stream");
                  stopMicrophoneStream();
                  getMicrophoneStream();
              });
            });

            audioContext = new AudioContext(); 
            source = audioContext.createMediaStreamSource(stream)

            startPitchTrack()
        })

        .catch((err) => {
            console.log('Did not get microphone stream: \n' + err);
            enableMicBtn.innerHTML = "Enable Microphone"
        });
}

function stopMicrophoneStream(){ 
  if (currStream !== null){
      console.log("In the stop function");
      let tracks = currStream.getTracks();
      tracks.forEach(track => track.stop());
  }
  window.cancelAnimationFrame(requestAnimationFrameId);
  
  if (audioContext) {
      audioContext.close().then(() => {
          console.log("AudioContext closed");
      });
      audioContext = null;
  }
}

function startPitchTrack(){
    analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    source.connect(analyser);
    console.log(analyser)
    getPitch()
}

function getPitch(){
  analyser.getFloatTimeDomainData(buffer);
    
  let frequencyinHz = autoCorrelate(buffer, audioContext.sampleRate);
  console.log("Frequency in hz: " + frequencyinHz);
  
  if(frequencyinHz === -1){

    countNoDetection += 1
        if (countNoDetection > smoothness){noteElem.innerHTML = "No note detected";}

  } else{
    countNoDetection = 0;

    let detune = getNotediff(frequencyinHz);
    
    hzElem.innerHTML = "The frequency you are singing is approximatly " + Math.round(frequencyinHz) + " Hz";
    
    if (detune > 50) {
      
      detuneElem.innerHTML = "You are detuned by more then + 50 cents: Flat!";
      
    
    } else if (detune < -50) {

      detuneElem.innerHTML = "You are detuned by more then - 50 cents: Sharp!";
    
    } else if (Math.abs(detune) < tuneTollerance) {
      
      saveNote(goalNote);
      console.log("Note saved");
      
      enableMicBtn.innerHTML = "Enable detection";
      noteElem.innerHTML = "";
      hzElem.innerHTML = "";
      detuneElem.innerHTML = "";

      main();
          
      selectingButtonState = "NotSelecting"
      selectNoteBtn.innerHTML = "Start selection";
      return;
    
    } else if (detune < 0) {
      
      detuneElem.innerHTML = "You are detuned by " + detune + " cents: Flat!";
    
    } else {

      detuneElem.innerHTML = "You are detuned by " + detune + " cents: Sharp!";
    }
  
  updateLevelMeter(detune);
  }
  
  if (!window.requestAnimationFrame){
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  }

  requestAnimationFrameId = window.requestAnimationFrame(getPitch);
}

function main(){
  console.log('I am hooked up to enableMicBtn')
  let isTracking = enableMicBtn.getAttribute("data-tracking") == "true";
  enableMicBtn.setAttribute("data-tracking", !isTracking)

  if (!isTracking === true){
    noteElem.innerHTML = "Sing " + goalNote + ", frequency: " + goalFreq + " Hz";
    hzElem.innerHTML = "Please wait the tuner to load"
    enableMicBtn.innerHTML = "enabling ..."
    
    getMicrophoneStream();
    
    enableMicBtn.innerHTML = "Disable detection"
  }
  
  else {
    stopMicrophoneStream()
    enableMicBtn.innerHTML = "Enable detection"
  }
}

if (enableMicBtn) {
    enableMicBtn.addEventListener('click', () => {
      main();
    });
}

/*-------------- STORE VARIABLES --------------*/
function saveNote(goalNote) {

  // If it is the first note selection
  if (firstNote === null) {

    updateLevelMeter(0);
    firstNote = goalNote.trim();
    var element = document.getElementById(firstNote);
    element.classList.add('selected');

    instructions.innerHTML = `<p>Range starts at ${firstNote}, now select and detect the high note</p>`;

    goalNote = null;

    selectingButtonState = "NotSelecting"
    selectNoteBtn.innerHTML = "Start selection";
    selectNoteBtn.classList.remove('active');

    if (enableMicBtn) {
      enableMicBtn.style.display = 'none';
    }
  }

  // If it is the second note and different from the first
  else if (secondNote === null && firstNote !== null) {

    secondNote = goalNote.trim();
    var element = document.getElementById(secondNote);
    element.classList.add('selected');

    instructions.innerHTML = `<p>Range starts at ${firstNote} and ends at ${secondNote}</p>`;

    updateLevelMeter(0);

    if (enableMicBtn) {
      enableMicBtn.style.display = 'none';
      next3Button.style.display = 'inline-block';
      selectNoteBtn.style.display = 'none';
    }

    finalizeSelection();
  }
}

function finalizeSelection() {

  console.log("finalize")

  manual = true;

  localStorage.setItem("manual", manual);
  localStorage.setItem("firstNote", firstNote);
  localStorage.setItem("secondNote", secondNote);
  localStorage.setItem("selectedRange", `from ${firstNote} to ${secondNote}`);
}

/*-------------- NOTE SELECTION --------------*/
if (selectNoteBtn) {

  selectNoteBtn.addEventListener('click', () => {
    console.log(selectingButtonState)

    if (selectingButtonState === "NotSelecting") {
      startNoteSelection();

    } else if (selectingButtonState === "Selecting") {
      stopNoteSelection();
      
    } else if (selectingButtonState === "ChangeNote") {
      resetNoteSelection();

    }
  });
}

function startNoteSelection() {

  selectingButtonState = "Selecting";
  selectNoteBtn.innerHTML = "Stop selection";
  selectNoteBtn.classList.add('active');

  console.log("Selection started:", selectingButtonState);

  noteButtons.forEach(button => {
    button.addEventListener('click', noteClickHandler);
  });
}

function noteClickHandler() {

  goalNote = this.getAttribute('data-note');
  goalFreq = noteFrequencies.find(n => n.note === goalNote).freq; 

  this.classList.add('pressed');

  console.log('Selected Note:', goalNote);

  stopNoteSelection();
}

function stopNoteSelection() {
  selectingButtonState = "ChangeNote";
  selectNoteBtn.innerHTML = "Change note";
  selectNoteBtn.classList.remove('active');

  if (enableMicBtn) {
    enableMicBtn.style.display = 'inline-block';
  }
  
  noteButtons.forEach(button => {
    button.removeEventListener('click', noteClickHandler);
  });

  console.log("Note selection stopped. Current note:", goalNote);
}

function resetNoteSelection() {
  enableMicBtn.innerHTML = "Enable detection";
  noteElem.innerHTML = "";
  hzElem.innerHTML = "";
  detuneElem.innerHTML = "";

  // Stop the microphone
  main();

  // Remove "pressed" class from all keys
  document.querySelectorAll('.key.pressed').forEach(key => {
    key.classList.remove('pressed');
  });

  // Reset goal note
  goalNote = null;
  goalFreq = null;

  if (enableMicBtn) {
    enableMicBtn.style.display = 'none';
  }

  console.log("Selection reset. Restarting selection...");
  startNoteSelection();
}

/*------------------------ SETTINGS BAR ------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  const settings = document.querySelectorAll(".setting");
  const currentPage = parseInt(document.body.dataset.setting);
  const totalSettings = settings.length;

  let currentSetting = parseInt(localStorage.getItem("currentSetting")) || 1;

  if (currentPage > currentSetting) {
    currentSetting = currentPage;
    localStorage.setItem("currentSetting", currentSetting);
  }
  
  settings.forEach((setting, index) => {
    if (index + 1 < currentPage) {
      setting.classList.add("completed");
      setting.textContent = "✔";
    } else if (index + 1 === currentPage) {
      setting.classList.add("active");
    }
  });
});