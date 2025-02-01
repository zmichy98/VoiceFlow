/*-------------- VARIABLES --------------*/
let audioContext = null;
let currStream = null; // global variable to save the audio stream
let source = null; // Audio input (microphone stream)
let globalAnalyser = null;
let buffer = new Float32Array(1024); // length of array = fftSize/2
let requestAnimationFrameId = null;

const tuneTollerance = 30;
const minimumRMS=0.001;

const constraints = {audio: true, video: false};
const enableMicBtn = document.getElementById("playPattern");
const noteElem = document.getElementById("note");
const hzElem = document.getElementById("hz");

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
        .then((stream) => {
            currStream = stream;
            console.log('got microphone stream');
            console.log(stream);

            audioContext = new AudioContext(); 
            // Assicurati che l'AudioContext sia attivo
            audioContext.resume();
            source = audioContext.createMediaStreamSource(stream);
            
            // Crea e configura il GainNode
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 10;  // Imposta il valore di guadagno (modifica questo valore in base alle esigenze)

            // Collega il source al gainNode...
            source.connect(gainNode);
            // ... e poi il gainNode verrà usato in seguito per collegarsi all'Analyser.
            // Per esempio, nella funzione startGamePitchTrack puoi connetterti dal gainNode:
            // gainNode.connect(globalAnalyser);
            
            // Se preferisci gestirlo globalmente, potresti salvare gainNode in una variabile globale:
            window.myGainNode = gainNode;
        })
        .catch((err) => {
            console.error('Error accessing microphone:', err);
            alert("Microphone access is required for this application. Please enable it.");
        });
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

    let isTracking = false;

    console.log('I am hooked up to enableMicBtn')
    if(enableMicBtn){
        isTracking = enableMicBtn.getAttribute("data-tracking") == "true";
        enableMicBtn.setAttribute("data-tracking", !isTracking)
    }
    

    if (!isTracking === true){
<<<<<<< Updated upstream
        noteElem.innerHTML = "Note to play ";
        hzElem.innerHTML = "Hz of the singer"
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

// Variabile per il throttling del pitch detection
let lastDetectionTime = 0;
const detectionInterval = 50; // intervallo in millisecondi, regolabile in base alle performance

export function startGamePitchTrack(goalNote, duration) {
    console.log("-----------Start PitchTrack-----------");
    
=======
// Variabile globale per riutilizzare il nodo Analyser

export function startGamePitchTrack(goalNote, duration) {
    console.log("-------------Start PitchTrack-------------");
    // Se il nodo globale non esiste, crealo e collegalo alla sorgente
>>>>>>> Stashed changes
    if (!globalAnalyser) {
        globalAnalyser = audioContext.createAnalyser();
        globalAnalyser.fftSize = 1024;
        // Collega il GainNode (che abbiamo salvato in window.myGainNode) all'Analyser
        window.myGainNode.connect(globalAnalyser);
    }
    
    const startTime = performance.now();

    console.log("Starting time: " + startTime);
    console.log("Goal note: " + goalNote);
    console.log("Duration: " + duration);
    
    return new Promise((resolve) => {
        function trackPitch() {
            getGamePitch(goalNote, duration, startTime, resolve, trackPitch);
        }
        trackPitch();
    }).finally(() => {
        if (globalAnalyser) {
            window.myGainNode.disconnect(globalAnalyser);
            globalAnalyser = null;
        }
    });
}

function getGamePitch(goalNote, duration, startTime, resolve, callback) {
    
    const currentTime = performance.now();
    const elapsedTime = currentTime - startTime;
    console.log("Elapsed Time: " + elapsedTime / 1000 + "seconds");

    if (elapsedTime >= duration * 1000) {
        console.log("Time duration exceeded, stopping detection.");
        cancelAnimationFrame(requestAnimationFrameId);
        resolve(0);
        return;
    }
    
<<<<<<< Updated upstream
    if (currentTime - lastDetectionTime < detectionInterval) {
        requestAnimationFrameId = window.requestAnimationFrame(callback);
        return;
    }
    lastDetectionTime = currentTime;
    
=======
    // Trova la frequenza target associata alla nota obiettivo
>>>>>>> Stashed changes
    const goalFreqObj = noteFrequencies.find((n) => n.note === goalNote);
    if (!goalFreqObj) {
        console.error("Goal note not found in frequencies list");
        cancelAnimationFrame(requestAnimationFrameId);
        resolve(0);
        return;
    }

    const goalFreq = goalFreqObj.freq;
    console.log("Goal frequency: " + goalFreq);
    noteElem.innerHTML = "Goal note is " + goalNote + ": " + goalFreq;

<<<<<<< Updated upstream
    noteElem.innerHTML = "Sing " + goalNote + ": " + goalFreq + " Hz";
    
    // Preleva i dati audio dal nodo Analyser
=======
    // Preleva i dati audio dal nodo Analyser e calcola la frequenza
>>>>>>> Stashed changes
    globalAnalyser.getFloatTimeDomainData(buffer);
    // Aggiungi qui il log per verificare i primi 20 valori del buffer
    console.log("Buffer sample (first 20 values):", buffer.slice(0, 20));

    const frequencyInHz = autoCorrelate(buffer, audioContext.sampleRate);
    console.log("Sung freq: " + frequencyInHz);
    
    if (frequencyInHz === -1) {
        hzElem.innerHTML = "No note detected";
        console.log("No note detected");
    } else {
<<<<<<< Updated upstream
        const detune = getNotediff(frequencyInHz, goalFreq);
        hzElem.innerHTML = "Your frequency is approximately " + Math.round(frequencyInHz) + " Hz";
=======
        hzElem.innerHTML = "Your frequency is " + frequencyInHz + "Hz"

        const detune = getNotediff(frequencyInHz, goalFreq);
>>>>>>> Stashed changes
        if (Math.abs(detune) < tuneTollerance) {
            console.log("Note sung correctly");
            cancelAnimationFrame(requestAnimationFrameId);
            resolve(1);
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
    var x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) {
        T0 = T0 - b / (2 * a);
    }
	return sampleRate / T0;
}

// Calculate the diff between the note selected and the singed one
function getNotediff(freq, goalFreq) {
    let centsDetune = Math.floor(1200 * Math.log(freq / goalFreq) / Math.log(2));
    return centsDetune;
}

// Function to update the level meter based on the cents value
function updateLevelMeter(detune) {
    let indicator = document.getElementById("tuner-indicator");
    
    if (!indicator) {
        console.error("Errore: elemento tuner-indicator non trovato!");
        return;
    }

    // Normalizziamo il valore tra -50 e +50 -> tra 0% e 100% nella barra
    let position = ((detune + 50) / 100) * 100; 

    // Assicuriamoci che l'indicatore non esca dalla barra
    position = Math.min(100, Math.max(0, position));

    // Imposta la posizione in percentuale rispetto alla larghezza della barra
    indicator.style.left = position + "%";
}
