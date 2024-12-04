// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Access Firestore
const db = firebase.firestore();

// Crea un nuovo AudioContext
Tone.start();
console.log('Audio context started');

// Configura il piano Salamander
const piano = new Tone.Sampler({
  urls: {
    "A0": "A0.mp3",
    "C1": "C1.mp3",
    "D#1": "Ds1.mp3",
    "F#1": "Fs1.mp3",
    "A1": "A1.mp3",
    "C2": "C2.mp3",
    "D#2": "Ds2.mp3",
    "F#2": "Fs2.mp3",
    "A2": "A2.mp3",
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
  baseUrl: "https://tonejs.github.io/audio/salamander/", // Percorso dei campioni
  onload: () => {
    console.log('Piano loaded');
  }
}).toDestination();

// Dichiaro le variabili
const startNote = 0;
let notes = [];
let vox = [];
let root = 130.81;
let finNote = 0;
let currNote = startNote;
let speed = 500;

// Recupera il range vocale

async function setVocal(vol) {
  db.collection("store").doc("vocal_ranges").get().then((doc) => {
    const vox = doc.data()[vol];
    console.log(vox);
    root = vox[0];
    finNote = vox[1];
    console.log(root);
    console.log(finNote);
  })
}

// Carica l'esercizio

function setExercise(eser) {
  db.collection("store").doc("exercises").get().then((doc) => {
    notes = doc.data()[eser];
    speed = 60 / notes[4] * 1000;
    console.log(notes);
    console.log(speed);
  })
}


// Suona una nota

function playNote(f, d) {

  piano.triggerAttackRelease("C4", "2n");

}

// Suona il pattern

function playPattern(eser, f) {
  
    // FA SUONARE SINGOLARMENTE LE NOTE, partendo dal quinto elemento dell'array
    notes.slice(4).forEach((note, index) => {
      //calcolo la frequenza reale
      const freq = f * (Math.pow(2 ** note, 1 / 12));
      //suono la nota
      setTimeout(() => {
        playNote(freq, speed - (speed / 10));
        console.log(note);
      }, index * speed);
    });
  
}

// Suona l'intero esercizio per la voce specifica

function playExercise(es, vo) {

  // CARICA VOCE E ESERCIZIO
  setVocal(vo);
  setExercise(es);
  setTimeout(() => {
    
    //scala ascendente
    while (currNote != finNote) {
      //aggiorna la tonalità
      const currRoot = root * (Math.pow(2 ** currNote, 1 / 12));
      //suona il pattern nella nuova tonalità
      setTimeout(() => {
        playPattern(es, currRoot);
      }, currNote * speed * (notes.length - 4));
      //aggiorna lo step
      currNote++;
    }

    
/////////////////////////// DA RIVEDEREEEEEEEE /////////////////////////////////////
    /*
    //scala discendente
    while (currNote != startNote) {
      //aggiorna la tonalità
      const currRoot = root * (Math.pow(2 ** currNote, 1 / 12));
      //suona il pattern nella nuova tonalità
      setTimeout(() => {
        playPattern(es, currRoot);
      }, currNote * speed * (4 - notes.length));
      //aggiorna lo step
      currNote--;
    }
    */
  }, 2000);
  

}



// CLICK DEL BOTTONE

document.getElementById('es1').addEventListener('click', function() {
  const selectElement = document.getElementById('voiceSelect');
  const selectedVoice = selectElement.value;
  playExercise('es1', selectedVoice);
});