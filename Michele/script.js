// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Access Firestore
const db = firebase.firestore();

// Crea un nuovo AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Dichiaro le variabili
const startNote = 0;
let notes = [];
let vox = [];
let root = 130.81;
let finNote = 0;
let currNote = startNote;
let speed = 500;

// INPUT DEI COMANDI



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

  // Crea un oscillatore
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine'; // Tipo di onda: 'sine', 'square', 'sawtooth', 'triangle'
  oscillator.frequency.setValueAtTime(f, audioContext.currentTime); // Imposta la frequenza

  // Crea un gain node per controllare il volume
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Imposta il volume
  
  // Collegamenti: oscillatore -> gain -> uscita audio
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Avvia l'oscillatore
  oscillator.start();
  // Ferma l'oscillatore dopo 0.5 secondi
  setTimeout(() => {
    oscillator.stop();
  }, d);
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