// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Access Firestore
const db = firebase.firestore();

// Take the selectedRange variable from the html and store it as a new variable
let manual = localStorage.getItem("manual");
let voiceRange = localStorage.getItem("selectedRange").toString();
voiceRange = "Tenor"
let firstmanNote = localStorage.getItem("firstNote").toString();
let secondmanNote = localStorage.getItem("secondNote").toString();
let eser = "es1";
let voce = voiceRange;


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
let vox = ["A2", "B2"]; // Questa Ã¨ una variabile, quindi puoi modificarla
// Variabili note iniziali, possono essere modificate da setVocal

// Recupera il range vocale
async function setVocal(vol, man, first, second) {
    const doc = await db.collection("store").doc("vocal_ranges").get();
    const newVoice = doc.data()[vol];
    vox.length = 0;
    vox.push(...newVoice); // Carica i nuovi pattern
    console.log(vox);
    console.log(man);
    console.log(first);
    console.log(second);

    if (man) {
        vox[0] = first;
        vox[1] = second;
        console.log(vox[0]);
        console.log(vox[1]);
        console.log(first);
        console.log(second);
    }

    console.log(vox);
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

    const noteStart1 = vox[0];  // starting note for the type of voice
    const noteStart2 = vox[1]; // ending note for the type of voice
    console.log(noteStart1);
    console.log(noteStart2);

    const startMidi = Tone.Frequency(noteStart1).toMidi(); // transforms to midi
    const endMidi = Tone.Frequency(noteStart2).toMidi();

    let noteIndex = 7; //starting from 7, the beginning of pattern notes in the exercise array
    let currentMidi = startMidi;
    console.log(`Current Midi: ${currentMidi}`)
    
    // Playing contextual chord
    const playChord = (time) => {
        const offset1 = pattern[4];
        const offset2 = pattern[5];
        const offset3 = pattern[6];

        const offset = pattern[noteIndex];
        const note = getNoteFromOffset(offset, currentMidi);
        changeKeyColor(note);
        console.log(`Playing note: ${note}`);
        piano.triggerAttackRelease(note, "8n", time);
        noteIndex++;

    }

    // Playing next note
    const playNextNote = (time) => {
         const offset = pattern[noteIndex];
         const note = getNoteFromOffset(offset, currentMidi);
         changeKeyColor(note);
         console.log(`Playing note: ${note}`);
         piano.triggerAttackRelease(note, "8n", time);
         noteIndex++;

         if (noteIndex >= pattern.length) {
              noteIndex = 7;
              currentMidi++;

              if(currentMidi > endMidi) {
                   Tone.Transport.stop();
                   noteIndex = 7;
                   console.log("Pattern completato!");
              }
         }
    }

    Tone.Transport.scheduleRepeat(playChord, "16n");
    Tone.Transport.scheduleRepeat(playNextNote, "4n");
    Tone.Transport.start();
}

// Assicurati che il DOM sia pronto
document.addEventListener("DOMContentLoaded", function() {
    // Imposta il range vocale e l'esercizio
    setVocal(voce, manual, firstmanNote, secondmanNote);
    setExercise(eser);
    document.getElementById("playPattern").addEventListener("click", playPattern);
});
