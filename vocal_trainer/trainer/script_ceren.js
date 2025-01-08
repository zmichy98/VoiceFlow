

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Access Firestore
const db = firebase.firestore();

// Defines variables
let manual = false;
let range = "Tenor";
let eser = "es1";
let tempo = 120;
let exDuration = 30;
let exDuration_woSteps = 30;
let ex_length = 120;
const pattern = [0, 2, 4, 5, 7, 5, 4, 2, 0];
let vox = ["A2", "B2"];
const work = ["es1", "es2"];


//Takes the variables from the previous pages (stored locally)
manual = localStorage.getItem("manual");
range = localStorage.getItem("selectedRange").toString();
let firstmanNote = localStorage.getItem("firstNote").toString();
let secondmanNote = localStorage.getItem("secondNote").toString();
// To be inserted: time, experience, tools


//Decides Workout to be played (TO BE DONE)



//Variable values (for testing only)
const workout = "wo1";
range = "Tenor";
eser = "es3";
exDuration = 30;
manual = false;


////////////////////////////////////////////////////////

// HELPER FUNCTIONS

// Configures the piano
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

// Calculates the midi note from an integer offset
const getNoteFromOffset = (offset, refNote) => {
    const midiNote = refNote + offset;
    return Tone.Frequency(midiNote, "midi").toNote();
}

// Loads workout
async function setWorkout(wo) {
    const doc = await db.collection("store").doc("workouts").get();
    const workOuts = doc.data()[wo];
    console.log("workouts retrieved from Firestore:", workOuts);
  
    work.length = 0;
    work.push(...workOuts); // Carica i nuovi pattern
    console.log("workout excersises: " + work);
  }

// Loads exercise
async function setExercise(es) {
    const doc = await db.collection("store").doc("exercises").get();
    const exercisePattern = doc.data()[es];
    pattern.length = 0; // Pulisci l'array pattern
    pattern.push(...exercisePattern); // Carica i nuovi pattern
    tempo = pattern[3];
    //const ex_length = (pattern.length) * 60 / tempo;
    //console.log("Ex length: " + ex_length)
    console.log("Tempo from firebase: " + tempo)
    //console.log(speed);
  }

  async function setExerciseLength() {
    const qN = 60 / tempo;
    const hN = qN * 2;

    const sM = Tone.Frequency(vox[0]).toMidi(); // Transform to MIDI
    const eM = Tone.Frequency(vox[1]).toMidi();
    const range_length = (eM - sM + 1) + (eM - sM)

    ex_length = ((((pattern.length-5) * qN) + hN + qN) * range_length);
    console.log("Ex length: " + ex_length)
  }

  

// Loads vocal range, or the manual range
async function setVocal(vol, man, first, second) {
    const doc = await db.collection("store").doc("vocal_ranges").get();
    const newVoice = doc.data()[vol];
    console.log("vox from Firebase: " + newVoice);
    vox.length = 0;
    vox.push(...newVoice); // Carica i nuovi pattern
    console.log("vox: " + vox);
    console.log("manual: " + man);
    console.log("first note: " + first);
    console.log("second note: " + second);

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


// Evaluates WORKOUT LENGTH






// Timebar








///////////// ACTUAL FUNCTIONS

// Plays a note for a certain duration

const playNote = async (note, duration, time) => {
    piano.triggerAttackRelease(note, duration, time);
}

// Plays a chord for a certain duration

const playChord = async (curr, duration, time) => {
    const chordNotes = [
        getNoteFromOffset(pattern[4], curr),
        getNoteFromOffset(pattern[5], curr),
        getNoteFromOffset(pattern[6], curr),
    ];
    console.log(`Playing chord: ${chordNotes.join(", ")} for ${duration}`);
    chordNotes.forEach((note) => piano.triggerAttackRelease(note, duration, time));
};

// Plays a pattern

const playPattern = async (curr, duration, now) => {
    let noteIndex = 7; // Start index of the pattern notes
    let direction = 1; // 1 for ascending, -1 for descending
    //const now = Tone.now(); // Ottieni il tempo corrente in Tone.js
    let timeOffset = 0; // Variabile per calcolare il tempo tra le note

    while (noteIndex < pattern.length) {
        const offset = pattern[noteIndex];
        const currNote = getNoteFromOffset(offset, curr);

        // Pianifica la riproduzione della nota a tempo
        Tone.Transport.schedule((time) => {
            playNote(currNote, duration, time); // Chiamata alla funzione playNote con il tempo corretto
            console.log(`Playing note: ${currNote} for ${duration}`);
        }, now + timeOffset); // Programma la riproduzione in base al tempo corrente

        noteIndex++;

        // Aggiungi la durata della nota (duration) al tempo di offset
        timeOffset += duration; // Incrementa l'offset del tempo
    }
}

// Plays the exercise

const playExercise = async (es) => {
    
    await setVocal(range, manual, firstmanNote, secondmanNote)
    await setExercise(es)

    await setExerciseLength();

    console.log("Lunghezza esercizio ------------------- " + ex_length)

    const noteStart1 = vox[0]; // Starting note for the type of voice
    console.log("Prima nota" + noteStart1)
    const noteStart2 = vox[1]; // Ending note for the type of voice
    console.log("Seconda nota" + noteStart2)
    const qN = 60 / tempo;
    const hN = qN * 2;
    console.log(qN)

    const startMidi = Tone.Frequency(noteStart1).toMidi(); // Transform to MIDI
    console.log("Primo midi " + startMidi)
    const endMidi = Tone.Frequency(noteStart2).toMidi();
    console.log("Primo midi " + endMidi)
    let currentMidi = startMidi; // Start at the initial MIDI note
    console.log(currentMidi)

    let now = Tone.now(); // Get current time

    for (let currentMidi = startMidi; currentMidi <= endMidi; currentMidi++) {

        Tone.Transport.stop()

        const patt_length = (pattern.length-5) * qN;
        // Schedule playChord at the correct time
        Tone.Transport.schedule((time) => {
            playChord(currentMidi, hN, time);
        }, now);  // Schedule at `now`, or adjust based on the loop counter

        // Schedule playPattern at the correct time
        Tone.Transport.schedule((time) => {
            playPattern(currentMidi, qN, time);
        }, now + hN);  // Wait until after the previous chord (hN)

        Tone.Transport.schedule((time) => {
            playChord(currentMidi, qN, time);
        }, now + patt_length + hN);  // Wait until after the previous chord (hN)
        
        Tone.Transport.start()

        now += hN + patt_length + qN; // Increment time for the next note's start time
    }

    for (let currentMidi = endMidi - 1; currentMidi >= startMidi; currentMidi--) {

        Tone.Transport.stop()

        const patt_length = (pattern.length-5) * qN;
        // Schedule playChord at the correct time
        Tone.Transport.schedule((time) => {
            playChord(currentMidi, hN, time);
        }, now);  // Schedule at `now`, or adjust based on the loop counter

        // Schedule playPattern at the correct time
        Tone.Transport.schedule((time) => {
            playPattern(currentMidi, qN, time);
        }, now + hN);  // Wait until after the previous chord (hN)

        Tone.Transport.schedule((time) => {
            playChord(currentMidi, qN, time);
        }, now + patt_length + hN);  // Wait until after the previous chord (hN)
        
        Tone.Transport.start()

        now += hN + patt_length + qN; // Increment time for the next note's start time
    }
}


// Plays the workout
const playWorkout = async (w) => {
    const qN = 60 / tempo;
    const hN = qN * 2;

    // Funzione per creare un delay in base ai secondi
    const delay = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

    for (let exIndex = 0; exIndex < w.length; exIndex++) {
        console.log(`Starting exercise ${exIndex + 1}`);

        let curr_ex = w[exIndex]
        // Assicurati che l'esercizio venga impostato prima di procedere

        await playExercise(curr_ex);  // Esegui l'esercizio

        // Aspetta 2 secondi prima di eseguire il prossimo esercizio
        await delay(ex_length);

        await delay(2);
    }
}


// Funzione per creare un delay in base ai secondi
const delay = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("playPattern").addEventListener("click", async function() {
        await Tone.start();  // Avvia Tone.js

        console.log("Audio context started");
        await setWorkout(workout);  // Imposta l'allenamento
        playWorkout(work)
    });
});