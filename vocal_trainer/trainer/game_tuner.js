/* For a good explanation of the tuner code take a look at the tuner.js page */

/*-------------- VARIABLES --------------*/
// Accuracy variables
const tuneTollerance = 30;
const minimumRMS = 0.001;
const fftSize = 512; //512 or 1024?
const gainValue = 2;

/*  tuneTollerance: is the threshold in cents for which you are in tune with a certain frequency

    minimumRMS: minimum strength of the signa for which is accepted to be analysied

    fftSize: must be a power of two. Usually the default is 2048, which provides a good balance between frequency resolution and performance.
        - Lower fftSize -->     Larger frequency bins (worse frequency resolution). Better time resolution, faster.
        - Higher fftSize -->    Finer frequency bins (better resolution but slower processing). Worse time resolution, slower.
        A smaller buffer means lower latency in detection because you’re processing fewer samples per frame, though you’ll sacrifice some frequency resolution.
    
    Gain Value:
        = 1 --> the input signal passes through unchanged.
        = 0 --> mute the signal
        > 1 --> increases the amplitude (volume gets louder). Can cause distortion if too high.
        > 0 & < 1 -->  attenuates the signal.
        < 0 --> invert the phase of the signal. */

// Other variables
let audioContext = null;
let currStream = null; 
let source = null;
let globalAnalyser = null;
let buffer = new Float32Array(fftSize);
let requestAnimationFrameId = null;
const constraints = {audio: true, video: false};

const enableMicBtn = document.getElementById("playPattern");
const noteElem = document.getElementById("note");
const hzElem = document.getElementById("hz");
const exerciseTitle = document.getElementById("ex-title-text");
const playBtn = document.getElementById("playPattern");

playBtn.style.display = 'none';

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

/*-------------- ACTIVATING THE MICROPHONE AT THE OPENING PAGE --------------*/

function getMicrophoneStream(){
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            currStream = stream;
            console.log('got microphone stream');
            console.log(stream);

            audioContext = new AudioContext(); 
            
            // Make sure the audio context is active
            audioContext.resume();
            source = audioContext.createMediaStreamSource(stream);
            
            /* Create a GAIN NODE (new functionality) to be able to detect also lower sound */
            const gainNode = audioContext.createGain();
            gainNode.gain.value = gainValue; 

            /* Connect the source to the gain. The gain node will be connected to the analyser. */

            source.connect(gainNode);
            
            // Save the gainNode in a global variable
            window.myGainNode = gainNode;

            hzElem.innerHTML = "Hz of the singer"
            noteElem.innerHTML = "Note to play";
            if (exerciseTitle) {
                exerciseTitle.textContent = "Let's start";
                playBtn.style.display = 'inline-block';
            }
        })
        .catch((err) => {
            console.error('Error accessing microphone:', err);
            alert("Microphone access is required for this application. Please enable it.");
        });
}

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

export function main(){
    let isTracking = false;

    console.log('I am hooked up to enableMicBtn')
    if(enableMicBtn){
        isTracking = enableMicBtn.getAttribute("data-tracking") == "true";
        enableMicBtn.setAttribute("data-tracking", !isTracking)
    }
    
    if (!isTracking === true){
        console.log('Call MicStrem function')
        getMicrophoneStream();
    }

    else{
        stopMicrophoneStream()
    }
}

document.addEventListener('DOMContentLoaded', () => {
    main();
});

/*-------------- DETECT THE SINGED NOTE: --------------*/
export function startGamePitchTrack(goalNote, duration) {
    console.log("--------------Start PitchTrack-------------");
    
    // I the global node doesn't exist, create one and connect it to the source
    if (!globalAnalyser) {
        globalAnalyser = audioContext.createAnalyser();
        globalAnalyser.fftSize = fftSize;
        // Collega il GainNode (che abbiamo salvato in window.myGainNode) all'Analyser
        window.myGainNode.connect(globalAnalyser);
    }
    
    // Starting time of the note to sing
    const startTime = performance.now();

    // Calculate the frequency of the Goal Note
    const goalFreqObj = noteFrequencies.find((n) => n.note === goalNote);
    if (!goalFreqObj) {
        console.error("Goal note not found in frequencies list");
        cancelAnimationFrame(requestAnimationFrameId);
        resolve(0);
        return;
    }
    const goalFreq = goalFreqObj.freq;

    noteElem.innerHTML = "Sing " + goalNote + ": " + goalFreq + " Hz";

    console.log("Goal note: " + goalNote);
    console.log("Goal frequency: " + goalFreq);
    
    return new Promise((resolve) => {
        function trackPitch() {
            getGamePitch(goalFreq, duration, startTime, resolve, trackPitch);
        }
        trackPitch();
    })
}

function getGamePitch(goalFreq, duration, startTime, resolve, callback) {

    // Calculate the current time in milliseconds

    const currentTime = performance.now();

     // Calculate the elpsed time in milliseconds

    const elapsedTime = currentTime - startTime;
    console.log("Elapsed Time: " + elapsedTime / 1000 + " seconds");

    // Duration is in second, calculate if the elapsed time is > then duration * 1000

    if (elapsedTime >= duration * 1000) {
        console.log("Time duration exceeded, stopping detection.");
        if (requestAnimationFrameId) {
            cancelAnimationFrame(requestAnimationFrameId);
        }
        resolve(0);
        updateLevelMeter(0)
        return;
    }

    // Take the audio data from the analyser and calculate the frequency

    globalAnalyser.getFloatTimeDomainData(buffer);

    // Take the first 20 values to verify the buffer makes sense
    console.log("Buffer sample (first 20 values):", buffer.slice(0, 20));

    const frequencyInHz = autoCorrelate(buffer, audioContext.sampleRate);
    
    if (frequencyInHz === -1) {

        hzElem.innerHTML = "No note detected";
        console.log("No note detected");

    } else {

        console.log("Sung freq: " + frequencyInHz);

        const detune = getNotediff(frequencyInHz, goalFreq);
        hzElem.innerHTML = "Your frequency is " + frequencyInHz + "Hz"

        if (Math.abs(detune) < tuneTollerance) {
            console.log("Note correct!");
            cancelAnimationFrame(requestAnimationFrameId);
            resolve(1);
            updateLevelMeter(0)
            return;
        }
        updateLevelMeter(detune);
    }

    requestAnimationFrameId = window.requestAnimationFrame(callback);
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
    console.log("RMS: " + rms);

	if (rms<minimumRMS)
		return -1;

	var r1 = 0, r2 = SIZE-1, thres = 0.2;

    for (var i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buf[i]) < thres) {
            r1 = i;
            break;
        }
    }

    for (var i = 1; i < SIZE / 2; i++) {
        if (Math.abs(buf[SIZE - i]) < thres) {
            r2 = SIZE - i;
            break;
        }
    }

	buf = buf.slice(r1,r2);
	SIZE = buf.length;

    // Normalize buffer
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
    
    if (T0 > 0 && T0 < SIZE - 1) {
        var x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
        var a = (x1 + x3 - 2 * x2) / 2;
        var b = (x3 - x1) / 2;
        if (a) {
            T0 = T0 - b / (2 * a);
        }
    }

	return sampleRate / T0;
}

function getNotediff(freq, goalFreq) {
    let centsDetune = Math.floor(1200 * Math.log(freq / goalFreq) / Math.log(2));
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
 