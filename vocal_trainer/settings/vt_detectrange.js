/*------------------------ VOCAL RANGE 3 ------------------------*/
/*-------------- VARIABLES --------------*/
let selectingNote = false;
let goalNote = null;
let goalFreq = null;
let firstNote = null;
let secondNote = null;

let audioContext = null;
let currStream = null; // global variable to save the audio stream
let source = null; // Audio input (microphone stream)
let analyser = null;
let buffer = new Float32Array(1024); // length of array = fftSize/2
let requestAnimationFrameId = null;

const selectNoteBtn = document.getElementById('select-note-btn');
const noteButtons = document.querySelectorAll('.key');

const tuneTollerance = 30;
const constraints = {audio: true, video: false};
const enableMicBtn = document.getElementById("enable-mic");
const noteElem = document.getElementById("note");
const hzElem = document.getElementById("hz");
const detuneElem = document.getElementById("detune");
const detuneWarning = document.getElementById("detune-warning");
const levelBar = document.getElementById("level-bar");
const levelValue = document.getElementById("level-value");

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

/*-------------- PIANO SAMPLES --------------*/
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

// Add sound to all keys (independent of "Select" button)
document.querySelectorAll('.key').forEach(key => {
  key.addEventListener('click', () => {
    const note = key.getAttribute('data-note');
    piano.triggerAttackRelease(note, "6n");
  });
});

/*-------------- TUNER --------------*/
function autoCorrelate( buf, sampleRate ) {
	var SIZE = buf.length;
	var rms = 0;

	for (var i=0; i<SIZE; i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01)
		return -1;

	var r1 = 0, r2 = SIZE-1, thres = 0.2;

  for (var i=0; i<SIZE/2; i++)
		if (Math.abs(buf[i]) < thres){ r1=i; break; }

	for (var i=1; i<SIZE/2; i++)
		if (Math.abs(buf[SIZE-i]) < thres) { r2=SIZE-i; break; }

	buf = buf.slice(r1,r2);
	SIZE = buf.length;

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
	var x1 = c[T0-1], x2 = c[T0], x3 = c[T0+1];
	a = (x1 + x3 - 2*x2)/2;
	b = (x3 - x1)/2;
	if (a) T0 = T0 - b/(2*a);
	return sampleRate / T0;
}

// Calculate the diff between the note selected and the singed one
function getNotediff(freq) {
  centsDetune = Math.floor( 1200 * Math.log( freq / goalFreq)/Math.log(2) );
  return centsDetune;
}

function updateLevelMeter(value) { // Function to update the level meter based on the cents value
    const percentage = value + 50;

    // Write the value in the bar
    levelBar.style.width = percentage + '%';
    levelValue.innerText = value;

    // Change color based on value
    if (value < - tuneTollerance) {
        levelBar.className = "level low";
    } else if (value > tuneTollerance) {
        levelBar.className = "level high";
    } else if (value === null) {
        levelBar.className = "level norange";
    } else {
        levelBar.className = "level mid";
    }
}

function updateLevelMeter(value, tuneTolerance = 5) {
  if (value === null || value === undefined) {
      levelBar.className = "level norange";
      levelBar.style.width = '50%'; // Neutral position
      levelValue.innerText = "No value";
      return;
  }

  // Map value to a percentage (assuming typical range of -100 to 100)
  const maxRange = 100; // Maximum absolute value for visualization
  const normalizedValue = Math.max(-maxRange, Math.min(maxRange, value)); // Clamp between -100 and 100
  const percentage = ((normalizedValue + maxRange) / (2 * maxRange)) * 100;

  // Update bar width and display value
  levelBar.style.width = percentage + '%';
  levelValue.innerText = value;

  // Assign classes based on value
  let levelClass = "level mid"; // Default to "mid"
  if (normalizedValue < -tuneTolerance) {
      levelClass = "level low";
  } else if (normalizedValue > tuneTolerance) {
      levelClass = "level high";
  }

  levelBar.className = levelClass;
}

function getMicrophoneStream(){ //  Initializes the microphone input and prepares it for audio analysis.
    navigator.mediaDevices.getUserMedia(constraints)
        // On success
        .then((stream) => {
            // Save the stream : 
            currStream = stream;
            console.log('got microphone stream');
            console.log(stream);

            audioContext = new AudioContext(); 
            source = audioContext.createMediaStreamSource(stream)

            // Call the function that detects the pitch
            startPitchTrack()
        })
        // On error:
        .catch((err) => {
            // handle the error
            console.log('Did not get microphone stream: \n' + err);
            enableMicBtn.innerHTML = "Enable Microphone"
        });
}

function stopMicrophoneStream(){ // Stops the microphone and animation.
    if (currStream !== null){
        console.log("In the stop function");
        let tracks = currStream.getTracks();
        console.log(tracks)
        
        for(let i = 0; i < tracks.length; i++){
            tracks[i].stop();
        }
    }
    window.cancelAnimationFrame(requestAnimationFrameId);
}

// Sets up the audio analyzer for pitch detection.
function startPitchTrack(){
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    getPitch()
}

// Continuously detects the pitch and updates the UI.
function getPitch(){
    // repetitive Ui /window.requestAnimationFrame
    analyser.getFloatTimeDomainData(buffer);
    
    let frequencyinHz = autoCorrelate(buffer, audioContext.sampleRate);
    console.log(frequencyinHz);
    
    if(frequencyinHz === -1){
      hzElem.innerHTML = "No note detected";
    } else{
        let detune = getNotediff(frequencyinHz);
        hzElem.innerHTML = "The frequency you are singing is approximatly " + Math.round(frequencyinHz) + " Hz";
        detuneElem.innerHTML = "You are detuned by " + detune + " cents";

        if(Math.abs(detune) < tuneTollerance){
            saveNote(goalNote);
            console.log("Note saved");

            enableMicBtn.innerHTML = "Enable detection";
            noteElem.innerHTML = "";
            hzElem.innerHTML = "";
            detuneElem.innerHTML = "";
            main();
            return;
        }
        updateLevelMeter(detune);
    }

    // Continue to call the function:

    if (!window.requestAnimationFrame){
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }
    requestAnimationFrameId = window.requestAnimationFrame(getPitch);
}

function main(){ //Main function to activate and stop Microphone streaming
    console.log('I am hooked up to enableMicBtn')
    let isTracking = enableMicBtn.getAttribute("data-tracking") == "true";
    enableMicBtn.setAttribute("data-tracking", !isTracking)

    if (!isTracking === true){
        noteElem.innerHTML = "Sing " + goalNote + ", frequency: " + goalFreq + " Hz";
        hzElem.innerHTML = "Please wait the tuner to load"
        enableMicBtn.innerHTML = "enabling ..."
        getMicrophoneStream();
        enableMicBtn.innerHTML = "Disable detection"
        enableMicBtn.classList.add('notusable');
        selectNoteBtn.classList.remove('notusable');
    }
    else{
        stopMicrophoneStream()
        enableMicBtn.innerHTML = "Enable detection"
    }
}

enableMicBtn.addEventListener('click', () => {
  main();
});

/*-------------- STORE VARIABLES --------------*/
function saveNote(goalNote) {
  // If it's the first note selection
  if (firstNote === null) {
    firstNote = goalNote.trim();
    var element = document.getElementById(firstNote);
    element.classList.add('selected');
    rangeInterval.innerHTML = `<p>Range starts at ${firstNote}, now select and detect the high note</p>`;
    goalNote = null;
  }
  // If it's the second note and different from the first
  else if (secondNote === null && firstNote !== null) {
    secondNote = goalNote.trim();
    var element = document.getElementById(secondNote);
    element.classList.add('selected');
    rangeInterval.innerHTML = `<p>Range starts at ${firstNote} and ends at ${secondNote}</p>`; 
    finalizeSelection();
  }
}

function finalizeSelection() {
  enableMicBtn.classList.add('notusable');
  selectNoteBtn.classList.add('notusable');
  // Save the selected range to localStorage
  manual = true;
  localStorage.setItem("manual", manual);
  localStorage.setItem("firstNote", firstNote);
  localStorage.setItem("secondNote", secondNote);
  localStorage.setItem("selectedRange", `from ${firstNote} to ${secondNote}`);

  // Optionally log for debugging
  console.log('First Note:', firstNote, 'Second Note:', secondNote);
}

/*-------------- NOTE SELECTION --------------*/
selectNoteBtn.addEventListener('click', () => {
  if (selectingNote) {
    stopNoteSelection()
  } else {
    startNoteSelection()
  }
});

function startNoteSelection() {
  selectingNote = true;
  selectingNote = null; // Reset selected note
  selectNoteBtn.innerHTML = "Stop selection"; // Change button text
  selectNoteBtn.classList.add('active'); // Optional styling

  noteButtons.forEach(button => {
    button.addEventListener('click', noteClickHandler); 
  });
}

function stopNoteSelection() {
  selectingNote = false;
  selectNoteBtn.innerHTML = "Start selection"; // Change button text
  selectNoteBtn.classList.remove('active'); // Remove optional styling

  // Remove event listener from each note button
  noteButtons.forEach(button => {
    button.removeEventListener('click', noteClickHandler);
  });

  // Debugging or further use of the selected note
  if (goalNote) {
    console.log("Selected note:", goalNote);
  } else {
    console.log("No note selected.");
  }
}

function noteClickHandler() {
  goalNote = this.getAttribute('data-note'); // Get the note from the data attribute
  goalFreq = noteFrequencies.find(n => n.note === goalNote).freq; 
  this.classList.add('pressed'); // Highlight the key 
  console.log('Note:', goalNote);
  enableMicBtn.classList.remove('notusable');
  selectNoteBtn.classList.add('notusable');
  stopNoteSelection();
};

