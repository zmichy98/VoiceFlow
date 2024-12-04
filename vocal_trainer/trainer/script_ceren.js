// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Access Firestore
const db = firebase.firestore();

// DALLE PAGINE DI GIANLUIGI
let eser = "es1";
const voce = "tenor";  // Variabile dichiarata con let per poterla modificare

// Function to change the color of the key when pressed
function changeKeyColor(note) {
    const key = document.querySelector(`.key[data-note="${note}"]`);
    if (key) {
        const originalColor = key.style.backgroundColor;
        key.style.transition = "background-color 0.1s"; // Smooth transition for color change
        key.style.backgroundColor = "silver"; // Change color when key is pressed

        // Reset color back after a short delay (0.2s)
        setTimeout(() => {
            key.style.backgroundColor = originalColor;
        }, 200);
    }
}

// Variabili
const pattern = [0, 2, 4, 5, 7, 5, 4, 2, 0];
let vox = []; // Questa Ã¨ una variabile, quindi puoi modificarla
// Variabili note iniziali, possono essere modificate da setVocal
//let noteStart1 = "C3";
//let noteStart2 = "E3";

// Recupera il range vocale
async function setVocal(vol) {
    const docRef = db.collection("store").doc("vocal_ranges");
    const docSnap = await docRef.get();
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Assicurati che il campo 'tenor' esista e sia un array
      const voiceArray = data[voce];  // voce è la variabile che contiene 'tenor' o un altro valore
      if (Array.isArray(voiceArray)) {
        vox.length = 0;  // Svuota l'array vox
        vox.push(...voiceArray);  // Carica l'array 'tenor' in vox
        console.log(vox);  // Verifica che i dati siano caricati correttamente
      } else {
        console.error("Il campo 'voice' non è un array valido.");
      }
    } else {
      console.log("Documento non trovato!");
    }
}

// Carica l'esercizio
async function setExercise(es) {
  const doc = await db.collection("store").doc("exercises").get();
  const exercisePattern = doc.data()[es];
  pattern.length = 0; // Pulisci l'array pattern
  pattern.push(...exercisePattern); // Carica i nuovi pattern

  // Calcola la velocitÃ 
  //const speed = 60 / pattern[4] * 1000; // Assicurati che pattern abbia abbastanza elementi
  console.log(pattern);
  //console.log(speed);
}

const noteStart1 = vox[0];  // Modifica le note vocali
const noteStart2 = vox[1];
console.log(noteStart1);
console.log(noteStart2);
const startMidi = Tone.Frequency(noteStart1).toMidi();
const endMidi = Tone.Frequency(noteStart2).toMidi();

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
         console.log("Piano loaded");
    }
}).toDestination();

// Calcola la nota midi da "root"
const getNoteFromOffset = (offset, refNote) => {
    const midiNote = refNote + offset;
    return Tone.Frequency(midiNote, "midi").toNote();
}

const playPattern = async () => {
    await Tone.start();
    console.log("Audio context started");

    let index = 5;
    let currentMidi = startMidi;
    console.log(`Current Midi: ${currentMidi}`)
    
    // Nota corrente
    const playNextNote = (time) => {
         const offset = pattern[index];
         const note = getNoteFromOffset(offset, currentMidi);
         changeKeyColor(note);
         console.log(`Playing note: ${note}`);
         piano.triggerAttackRelease(note, "8n", time);
         index++;

         if (index >= pattern.length) {
              index = 5;
              currentMidi++;

              if(currentMidi > endMidi) {
                   Tone.Transport.stop();
                   console.log("Pattern completato!");
              }
         }
    }

    Tone.Transport.scheduleRepeat(playNextNote, "4n");
    Tone.Transport.start();
}

// Assicurati che il DOM sia pronto
document.addEventListener("DOMContentLoaded", function() {
    // Imposta il range vocale e l'esercizio
    setVocal(voce);
    setExercise(eser);
    document.getElementById("playPattern").addEventListener("click", playPattern);
});
