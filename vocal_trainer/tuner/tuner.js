/* This first function was found on gitHub: https://github.com/cwilso/PitchDetect/blob/main/js/pitchdetect.js,
it returns the freq in Hz of the buffer in a certaint time domain */
function autoCorrelate( buf, sampleRate ) {
	// Implements the ACF2+ algorithm
	var SIZE = buf.length;
	var rms = 0;

	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;

	var r1=0, r2=SIZE-1, thres=0.2;
	for (var i=0; i<SIZE/2; i++)
		if (Math.abs(buf[i])<thres) { r1=i; break; }
	for (var i=1; i<SIZE/2; i++)
		if (Math.abs(buf[SIZE-i])<thres) { r2=SIZE-i; break; }

	buf = buf.slice(r1,r2);
	SIZE = buf.length;

	var c = new Array(SIZE).fill(0);
	for (var i=0; i<SIZE; i++)
		for (var j=0; j<SIZE-i; j++)
			c[i] = c[i] + buf[j]*buf[j+i];

	var d=0; while (c[d]>c[d+1]) d++;
	var maxval=-1, maxpos=-1;
	for (var i=d; i<SIZE; i++) {
		if (c[i] > maxval) {
			maxval = c[i];
			maxpos = i;
		}
	}
	var T0 = maxpos;

	var x1=c[T0-1], x2=c[T0], x3=c[T0+1];
	a = (x1 + x3 - 2*x2)/2;
	b = (x3 - x1)/2;
	if (a) T0 = T0 - b/(2*a);

	return sampleRate/T0;
}

function getClosestNote(freq) {
    /* Find the closest Note */
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
    
    /* Find the distant from the rigth note in cents */
    // A half step is = to 100 cents
    centsDetune = Math.floor( 1200 * Math.log( freq / closestNote.freq)/Math.log(2) );

    return [closestNote, centsDetune];
}

function getMicrophoneStream(){
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            currStream = stream; // save the stream
            console.log('got microphone stream');

            /* A stream consists of several tracks, such as video or audio tracks.
            Each track is specified as an instance of MediaStreamTrack.*/
            console.log(stream);

            /* In the next two steps we are going to translate the stream into something that
            the webAudio API can do the analysing on*/
            // Create AudioContext (This is a constractor part of the web audio API)
            audioContext = new AudioContext(); 

            // Inside the ciontext, create the source
            source = audioContext.createMediaStreamSource(stream)

            startPitchTrack()
        })
        .catch((err) => {
            console.log('Did not get microphone stream: \n' + err);

            /* handle the error */
            enableMicBtn.innerHTML = "Enable Microphone"
        });
}

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

function startPitchTrack(){
    analyser = audioContext.createAnalyser();

    analyser.fftSize = 2048;

    // Connect the analyser node to the audio context
    source.connect(analyser); // the source is the audio input, the analyser is needed to analyse the stream

    getPitch()
}

function getPitch(){
    // repetitive Ui /window.requestAnimationFrame
    analyser.getFloatTimeDomainData(buffer);
    let frequencyinHz = autoCorrelate(buffer, audioContext.sampleRate);
    console.log(frequencyinHz);
    
    if(frequencyinHz === -1){

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

        if(Math.abs(detune) < 30){
            detuneWarning.innerHTML = "You are in tune!";
            detuneWarning.className = "in-tune";
        }
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
