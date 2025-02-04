// Accuracy variables:
const tuneTollerance = 30;
const minimumRMS = 0.005;
const fftSize = 2048;
const smoothness = 600; // Number of (-1) iteration before giving No note detected

/* Accuracy variables:
    - tuneTollerance: is the threshold in cents for which you are in tune with a certain frequency

    - minimumRMS: minimum strength of the signal for which is accepted to be analysied

    - fftSize: must be a power of two. Usually the default is 2048, which provides a good balance between frequency resolution and performance.
        - Lower fftSize -->     Larger frequency bins (worse frequency resolution). Better time resolution, faster.
        - Higher fftSize -->    Finer frequency bins (better resolution but slower processing). Worse time resolution, slower. */

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
      piano.triggerAttackRelease(note, "3n");
    });
});

/* The skeleton of this autoCorrelate() function has been found on gitHub: https://github.com/cwilso/PitchDetect/blob/main/js/pitchdetect.js. */

function autoCorrelate( buf, sampleRate ) {
    // First of all apply the Hann Window function to the buffer
    buf = applyHannWindow(buf)

	// Implements the ACF2+ algorithm
	var SIZE = buf.length;  // SIZE = length of the array
	var rms = 0;            // root mean square: rappresents the signal strength

    /* Measures the signal's strength to ensure there's enough audio data.
    If too quiet (rms < minimumRMS), it returns -1 (indicating no signal detected). */
	for (var i=0; i<SIZE; i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);

	if (rms < minimumRMS)   // minimum signal strength needed
		return -1;

    /* Trim Silence: finds where the signal starts and ends (avoiding noise).
        - r1: Marks the starting index of the significant portion of the signal.
        - r2: Marks the ending index.
        - thres: The amplitude threshold to decide whether a sample is part of the signal or is only silence. */
	var r1 = 0, r2 = SIZE-1, thres = 0.2;

    /* Decide r1 position (only check up to half the buffer because audio signals are often symmetric or periodic,
    and the autocorrelation will handle periodicity.) */
    for (var i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buf[i]) < thres) {
            r1 = i;
            break;
        }
    }

    /* Decide r2 position */
    for (var i = 1; i < SIZE / 2; i++) {
        if (Math.abs(buf[SIZE - i]) < thres) {
            r2 = SIZE - i;
            break;
        }
    }

    /* Cut the buffer to exclude silence */
	buf = buf.slice(r1,r2);
	SIZE = buf.length;

    // Normalize buffer
    var maxVal = Math.max(...buf.map(Math.abs));
    if (maxVal > 0) {
        buf = buf.map(x => x / maxVal);
    }

    /* Perform Autocorrelation: measures how well the signal matches itself when  shifted in time to determine the
    fundamental frequency. The array c will store in c[i] the autocorrelation result for a time lag of i */
	
    var c = new Array(SIZE).fill(0);
	
    /* i rappresents the time lag (if i = 0 -> every sample is multiplied by itself, resulting in the highest possible similarity)
    If the signal repeats itself periodically with period T, then shifting the signal by T (or multiples of  T) will align similar 
    parts of the signal. This produces local maxima (peaks) at those lags. For example, if you have a sine wave with a period of 100 
    samples, the autocorrelation will show peaks at lags of 100, 200, 300, etc.

    Indeed in this case the first significant peak after zero lag is used to estimate the fundamental period (and hence the
    frequency) of the sound. */
    for (var i=0; i<SIZE; i++)
        for (var j=0; j<SIZE-i; j++)
			c[i] = c[i] + buf[j] * buf[j+i];
    
    /*  - buf[j] is the current value of the signal
        - buf[j + i] is the signal value shifted by i samples.
        - buf[j] * buf[j + i] measures the similarity between the signal and its lagged version for this particular offset.
        - the sum of these products for all valid j values gives the autocorrelation value for lag i.
    
    The result c[i] at each lag i gives a measure of how well the signal matches itself when shifted by i samples. */

    /* It is time to find Peak Position, the first peak in the autocorrelation gives the period of the dominant frequency. Of course
    we will skip the initial decreasing part of the autocorrelation array. The autocorrelation function c typically has a large
    initial value at lag 0 (due to perfect self-correlation), which then decreases before rising again at the first significant peak. */
    var d=0; while (c[d]>c[d+1]) d++;

    /* Find the peak position and store it in T0 */
	var maxval=-1, maxpos=-1;

	for (var i=d; i<SIZE; i++) {
		if (c[i] > maxval) {
			maxval = c[i];
			maxpos = i;
		}
	}
	var T0 = maxpos;

    /* Improves the resolution of the period T0 by fitting a parabola to the values around the detected peak.*/
	var x1 = c[T0-1], x2 = c[T0], x3 = c[T0+1];

    /* - x1: autocorrelation value immediately before the current peak (T0-1).
       - x2: autocorrelation value at the current peak (T0).
       - x3: autocorrelation value immediately after the current peak (T0+1). */

    /* Curve parameters: */
	let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;

    /* If the parabola is not flat, then adjust the period with the vertex of the parabola */
	if (a) T0 = T0 - b/(2*a);

    /* Return the frequency:
        - sampleRate: The rate at which the audio signal is sampled (e.g., 44100 Hz for CD-quality audio).
        - T0: the period of the fundamental frequency. */
	return sampleRate / T0;
}

/* Apply the Hann Window function to each sample of the buffer, this function
    - starts and ends at zero: This prevents sudden jumps at the beginning and end of the signal.
    - smoothly increases in the middle: This ensures that middle values have higher weights. */
function applyHannWindow(buf) {
    const SIZE = buf.length;
    // Apply to each buffer the Hann Window function
    for (let i = 0; i < SIZE; i++) {
        buf[i] *= 0.5 * (1 - Math.cos((2 * Math.PI * i) / (SIZE - 1)));
    }
    return buf;
}

// Matches the detected frequency to the closest musical note.
function getClosestNote(freq) {

    let closestNote = noteFrequencies[0];
    let minDiff = Math.abs(freq - noteFrequencies[0].freq);
    
    for (let i = 1; i < noteFrequencies.length; i++) {
        const diff = Math.abs(freq - noteFrequencies[i].freq);
        
        if (diff < minDiff && diff < (noteFrequencies[i].freq * 0.05))  {
            minDiff = diff;
            closestNote = noteFrequencies[i];
      }
    }
    
    /* 
    Find the distant from the rigth note in cents: half step is equal to 100 cents. Cents are a logarithmic unit of pitch interval.
    There are 100 cents in a semitone, and 1200 cents in an octave. This means cents allow us to measure small variations in pitch.
    Pitch (or frequency) doubles every octave, making the relationship between pitch and frequency logarithmic.
    */
    centsDetune = Math.floor( 1200 * Math.log( freq / closestNote.freq)/Math.log(2) );

    return [closestNote, centsDetune];
}

// Function to update the level meter based on the cents value
function updateLevelMeter(detune) {
    let indicator = document.getElementById("tuner-indicator");
    
    if (!indicator) {
        console.error("Errore: elemento tuner-indicator non trovato!");
        return;
    }

    // Normalization beetween -50 e +50
    let position = ((detune + 50) / 100) * 100; 

    // The indicator must not go out of bounds
    position = Math.min(100, Math.max(0, position));

    // Set the % position of the indicator along the "bar"
    indicator.style.left = position + "%";
}

// Initializes the microphone input and prepares it for audio analysis.
function getMicrophoneStream(){
    navigator.mediaDevices.getUserMedia(constraints)

        // On success
        .then((stream) => {

            // Save the stream : 
            currStream = stream;
            console.log('got microphone stream');
            console.log(stream);


            // Add a listener on every track to catch eventual errors
            stream.getTracks().forEach(track => {
              track.addEventListener("ended", () => {
                  console.warn("Track ended unexpectedly, reinitializing stream");
                  stopMicrophoneStream();

                  // Try again to start the stream
                  getMicrophoneStream();
              });
            });

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

// Sets up the audio analyzer for pitch detection.
function startPitchTrack(){

    analyser = audioContext.createAnalyser();   // Creates an AnalyserNode

    analyser.fftSize = fftSize;                    // Number of samples processed in one FFT.

    // Connect the analyser node to the audio context: the source is the audio input, the analyser is needed to analyse the stream.

    source.connect(analyser);

    getPitch()
}

// Continuously detects the pitch and updates the UI.
function getPitch(){
    
    analyser.getFloatTimeDomainData(buffer); // repetitive Ui /window.requestAnimationFrame
    
    let frequencyinHz = autoCorrelate(buffer, audioContext.sampleRate);
    console.log("Frequency detected:" + frequencyinHz);

    if (frequencyinHz === -1) {
        countNoDetection += 1
        if (countNoDetection > smoothness){noteElem.innerHTML = "No note detected";}

    } else {
        countNoDetection = 0
        let [closerNote, detune] = getClosestNote(frequencyinHz);
        noteElem.innerHTML = closerNote.note;
        hzElem.innerHTML = "Your frequency is approximately " + Math.round(frequencyinHz) + " Hz";
        detuneElem.innerHTML = "Detune: " + detune + " cents";
    
        if (detune > 50) {
            
            noteElem.innerHTML = "No note detected";
            detuneWarning.innerHTML = "Out of range";
            detune = 50;

        } else if (detune < -50) {
            
            noteElem.innerHTML = "No note detected";
            detuneWarning.innerHTML = "Out of range";
            detune = -50;

        } else if (Math.abs(detune) < tuneTollerance) {
            
            detuneWarning.innerHTML = "You are in tune!";
            detuneWarning.className = "in-tune";

        } else if (detune < 0) {
            
            detuneWarning.innerHTML = "You are Flat";
            detuneWarning.className = "flat";

        } else {

            detuneWarning.innerHTML = "You are Sharp";
            detuneWarning.className = "sharp";

        }
    updateLevelMeter(detune);
    }

    // Continue to call the function:
    if (!window.requestAnimationFrame){

        // Browsers are not all the same so we also consider FireFox just in case:
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

        noteElem.innerHTML = "Please wait the tuner to load"
        enableMicBtn.classList.add("enabling");
        console.log("Enabling microphone...");

        // turn the mic on and begin tracking
        getMicrophoneStream();

        // Update button style for active state
        enableMicBtn.classList.remove("enabling");
        enableMicBtn.classList.add("active");
    }

    // else the state is to not track
    else{

        stopMicrophoneStream() // end the mic stream
    }
}

// Variables:

const enableMicBtn = document.getElementById("enable-mic");

enableMicBtn.onclick = main;
enableMicBtn.addEventListener("click", () => {
    enableMicBtn.classList.toggle("active");
});

let countNoDetection = 0;
let audioContext = null;
let currStream = null;                              // global variable to save the audio stream
let source = null;                                  // Audio input (microphone stream)
let analyser = null;
let buffer = new Float32Array(fftSize / 2);         // length of array = fftSize/2
let requestAnimationFrameId = null;

const constraints = {audio: true, video: false};
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
