/*-------------- VARIABLES --------------*/
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

/*-------------- ACTIVETING THE MICROPHONE AT THE BEGINNING OF THE WORKOUT: --------------*/
//  Initializes the microphone input and prepares it for audio analysis.
function getMicrophoneStream(){
    navigator.mediaDevices.getUserMedia(constraints)
        // On success
        .then((stream) => {
            // Save the stream : 
            currStream = stream;
            console.log('got microphone stream');
            console.log(stream);

            audioContext = new AudioContext(); 
            source = audioContext.createMediaStreamSource(stream)

            startPitchTrack()
        })
        // On error:
        .catch((err) => {
            console.error('Error accessing microphone:', err);
            alert("Microphone access is required for this application. Please enable it.");
        });
}

// Sets up the audio analyzer for pitch detection.
function startPitchTrack(){
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
}

// Stops the microphone and animation.
function stopMicrophoneStream(){
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

function main(){
    console.log('I am hooked up to enableMicBtn')
    if(enableMicBtn){
        let isTracking = enableMicBtn.getAttribute("data-tracking") == "true";
    }
    enableMicBtn.setAttribute("data-tracking", !isTracking)

    if (!isTracking === true){
        noteElem.innerHTML = " ";
        hzElem.innerHTML = " "
        getMicrophoneStream();
    }
    else{
        stopMicrophoneStream()
        enableMicBtn.innerHTML = "Enable detection"
    }
}

// When the page is opened turn the microphone on microphone is turned on
window.onload = function() {
    main();
};

/*-------------- DETECT THE SINGED NOTE: --------------*/
let startTime = performance.now(); // Record the start time
function getPitch(goalNote, duration) {
    const elapsedTime = performance.now() - startTime; // Calculate elapsed time

    if (elapsedTime >= duration) {
        console.log("Time duration exceeded, stopping detection.");
        cancelAnimationFrame(requestAnimationFrameId); // Stop further calls
        return 0;
    }

    const goalFreq = noteFrequencies.find(n => n.note === goalNote).freq;

    // Perform pitch detection
    analyser.getFloatTimeDomainData(buffer);

    const frequencyinHz = autoCorrelate(buffer, audioContext.sampleRate);
    console.log("Sung freq: " + frequencyinHz);

    if (frequencyinHz === -1) {
        hzElem.innerHTML = "No note detected";
    } else {
        const detune = getNotediff(frequencyinHz, goalFreq);
        hzElem.innerHTML = "The frequency you are singing is approximately " + Math.round(frequencyinHz) + " Hz";
        detuneElem.innerHTML = "You are detuned by " + detune + " cents";

    if (Math.abs(detune) < tuneTollerance) {
        console.log("Note sung correctly");
        main(); // Assuming this is your success callback
        cancelAnimationFrame(requestAnimationFrameId); // Stop further calls
        return 1;
    }

    updateLevelMeter(detune); // Update UI or level meter
    }

    // Continue to call the function using requestAnimationFrame  
    requestAnimationFrameId = window.requestAnimationFrame(() => getPitch(goalNote, duration));

}

/*-------------- TUNER AND FUNCTIONS: --------------*/
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
function getNotediff(freq, goalFreq) {
  centsDetune = Math.floor( 1200 * Math.log( freq / goalFreq)/Math.log(2) );
  return centsDetune;
}

function updateLevelMeter(value, tuneTolerance = 30) {
    if (value === null || value === undefined) {
        levelBar.className = "level norange";
        levelBar.style.width = '50%';
        levelValue.innerText = "No value";
        return;
    }
    const maxRange = 100;
    const normalizedValue = Math.max(-maxRange, Math.min(maxRange, value));
    const percentage = ((normalizedValue + maxRange) / (2 * maxRange)) * 100;

    levelBar.style.width = percentage + '%';
    levelValue.innerText = value;

    let levelClass = "level mid";
    if (normalizedValue < -tuneTolerance) levelClass = "level low";
    else if (normalizedValue > tuneTolerance) levelClass = "level high";

    levelBar.className = levelClass;
}
