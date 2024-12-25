/* This first function was found on gitHub: https://github.com/cwilso/PitchDetect/blob/main/js/pitchdetect.js,
it returns the dominant freq in Hz of the buffer (array) */
function autoCorrelate( buf, sampleRate ) {
	// Implements the ACF2+ algorithm
	var SIZE = buf.length; // SIZE = length of the array
	var rms = 0; // root mean square: calculate the signal strength

    /* Measures the signal's strength to ensure there's enough audio data. 
    If too quiet (rms < 0.01), it returns -1 (indicating no signal detected). */
	for (var i=0; i<SIZE; i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;

    /* Trim Silence: finds where the signal starts and ends (avoiding noise). */
    // r1: Marks the starting index of the significant portion of the signal.
    // r2: Marks the ending index.
    // thres: The amplitude threshold to decide whether a sample is part of the signal or silence.
	var r1 = 0, r2 = SIZE-1, thres = 0.2;

    // Decide r1 position (only check up to half the buffer because audio signals are often symmetric or periodic, and the autocorrelation will handle periodicity.)
	for (var i=0; i<SIZE/2; i++)
		if (Math.abs(buf[i]) < thres){ r1=i; break; }

    // Decide r2 position
	for (var i=1; i<SIZE/2; i++)
		if (Math.abs(buf[SIZE-i]) < thres) { r2=SIZE-i; break; }
    // Cut the buffer to exclude silence
	buf = buf.slice(r1,r2);
	SIZE = buf.length;

    /* Perform Autocorrelation: measures how well the signal matches itself when 
    shifted in time to determine the fundamental frequency.*/
	var c = new Array(SIZE).fill(0); // c[i] will store the autocorrelation result for a time lag of i
	for (var i=0; i<SIZE; i++)
		for (var j=0; j<SIZE-i; j++)
			c[i] = c[i] + buf[j] * buf[j+i];
            // buf[j] is the current value of the signal
            // buf[j + i] is the signal value shifted by i samples.
            // buf[j] * buf[j + i] measures the similarity between the signal and its lagged version for this particular offset.
            // The sum of these products for all valid j values gives the autocorrelation value for lag i.

    /* The result c[i] at each lag i gives a measure of how well the signal matches itself when shifted by i samples.
    Peaks in the autocorrelation array correspond to strong periodicity in the signal. */

    // Find Peak Position: The first peak in the autocorrelation gives the period of the dominant frequency.
	// Skips the initial decreasing part of the autocorrelation array.
    /* The autocorrelation function c typically has a large initial value at lag 0 (due to perfect self-correlation),
    which then decreases before rising again at the first significant peak. */
    var d=0; while (c[d]>c[d+1]) d++;

    // Find the peak position and store it in T0
	var maxval=-1, maxpos=-1;
	for (var i=d; i<SIZE; i++) {
		if (c[i] > maxval) {
			maxval = c[i];
			maxpos = i;
		}
	}
	var T0 = maxpos;

    // Improves the resolution of the period (T0) by fitting a parabola to the values around the detected peak.
	var x1 = c[T0-1], x2 = c[T0], x3 = c[T0+1];
	a = (x1 + x3 - 2*x2)/2;
	b = (x3 - x1)/2;
	if (a) T0 = T0 - b/(2*a);

    // Return the frequency
    /*
    sampleRate: The rate at which the audio signal is sampled (e.g., 44100 Hz for CD-quality audio).
    T0: The period of the fundamental frequency, measured in terms of sample indices. This value is obtained after identifying and refining the peak position in the autocorrelation function.
    */
	return sampleRate / T0;
}

// Matches the detected frequency to the closest musical note.
function getClosestNote(freq) {
    // As closest note take a generical note and we store diff between freq and notefreq
    let closestNote = noteFrequencies[0];
    let minDiff = Math.abs(freq - noteFrequencies[0].freq);

    // loop to find the note whose freq is the closest to the dominant frequency
    for (let i = 1; i < noteFrequencies.length; i++) {
      const diff = Math.abs(freq - noteFrequencies[i].freq);
      if (diff < minDiff && diff < (noteFrequencies[i].freq * 0.05))  {
        minDiff = diff;
        closestNote = noteFrequencies[i];
      }
    }
    
    /* 
    Find the distant from the rigth note in cents: half step is equal to 100 cents 
    Cents are a logarithmic unit of pitch interval. There are 100 cents in a semitone,
    and 1200 cents in an octave. This means cents allow us to measure small variations in pitch
    Pitch (or frequency) doubles every octave, making the relationship between pitch and frequency logarithmic.
    */
    centsDetune = Math.floor( 1200 * Math.log( freq / closestNote.freq)/Math.log(2) );

    return [closestNote, centsDetune];
}

// Function to update the level meter based on the cents value
function updateLevelMeter(value) {
    const percentage = ((value + 50) / 100) * 100; // Scale the value to 0-100

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

//  Initializes the microphone input and prepares it for audio analysis.
function getMicrophoneStream(){
    // Requests microphone access consists of several tracks, such as video or audio tracks. 
    // Each track is specified as an instance of MediaStreamTrack.
    navigator.mediaDevices.getUserMedia(constraints)
        // On success
        .then((stream) => {
            // Save the stream : 
            currStream = stream;
            console.log('got microphone stream');
            console.log(stream);

            /* In the next two steps we are going to translate the stream into something that
            the webAudio API can analyse*/
            audioContext = new AudioContext(); // Create AudioContext (This is a constractor part of the web audio API)
            source = audioContext.createMediaStreamSource(stream) // Inside the context, create the source

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

// Stops the microphone and animation.
function stopMicrophoneStream(){
    if (currStream !== null){
        // get the tracks from the stream
        let tracks = currStream.getTracks();
        console.log(tracks)

        // stop each one
        for(let i = 0; i < tracks.length; i++){
            tracks[i].stop();
        }
    }

    window.cancelAnimationFrame(requestAnimationFrameId);
}

// Sets up the audio analyzer for pitch detection.
function startPitchTrack(){
    // Creates an AnalyserNode
    analyser = audioContext.createAnalyser();

    // Number of samples processed in one FFT.
    analyser.fftSize = 2048;

    // Connect the analyser node to the audio context: the source is the audio input, the analyser is needed to analyse the stream
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
        noteElem.innerHTML = "No note detected";

    } else{
        let [closerNote, detune] = getClosestNote(frequencyinHz);
        noteElem.innerHTML = closerNote.note;
        hzElem.innerHTML = "Your frequency is approximatly " + Math.round(frequencyinHz) + " Hz";
        detuneElem.innerHTML = "You are detuned by " + detune + " cents";

        if(detune < 0){
            detuneWarning.innerHTML = "You are Flat";
            detuneWarning.className = "flat";
        } else{
            detuneWarning.innerHTML = "You are Sharp";
            detuneWarning.className = "sharp";
        }

        if(Math.abs(detune) < tuneTollerance){
            detuneWarning.innerHTML = "You are in tune!";
            detuneWarning.className = "in-tune";
        }

        if(Math.abs(detune) > 50){
            noteElem.innerHTML = "No note detected";
            detuneWarning.innerHTML = "Out of range";
            detune = null;
        }

        updateLevelMeter(detune);
    }

    // Continue to call the function:

    if (!window.requestAnimationFrame){ // Browsers are not all the same so we also consider FireFox just in case:
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }
    // In this way the function is called costantly, until the Id is cleared
    requestAnimationFrameId = window.requestAnimationFrame(getPitch);
}

function main(){
    console.log('I am hooked up to enableMicBtn')
    let isTracking = enableMicBtn.getAttribute("data-tracking") == "true"; // boolean
    enableMicBtn.setAttribute("data-tracking", !isTracking)

    // What is the state of the app?
    // if the state is to pitch track
    if (!isTracking === true){
        enableMicBtn.innerHTML = "enabling ..."

        // turn the mic on and begin tracking
        getMicrophoneStream();

        // make enableMicBtn say "disable mic" <-- toggle state
        enableMicBtn.innerHTML = "Disable Microphone"
    }

    // else the state is to not track
    else{

        // end the mic stream
        stopMicrophoneStream()

        // make enableMicBtn say "enable mic" <-- toggle state
        enableMicBtn.innerHTML = "Enable Microphone"
    }
}

// Variables
let audioContext = null;
let currStream = null; // global variable to save the audio stream
let source = null; // Audio input (microphone stream)
let analyser = null;
let buffer = new Float32Array(1024); // length of array = fftSize/2
let requestAnimationFrameId = null;

const constraints = {audio: true, video: false};
const enableMicBtn = document.getElementById("enable-mic");
const noteElem = document.getElementById("note");
const hzElem = document.getElementById("hz");
const detuneElem = document.getElementById("detune");
const detuneWarning = document.getElementById("detune-warning");
const tuneTollerance = 30;
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

enableMicBtn.onclick = main;
