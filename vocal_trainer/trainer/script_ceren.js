// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Access Firestore
const db = firebase.firestore();

// Take the selectedRange variable from the html and store it as a new variable
let manual = false;
manual = localStorage.getItem("manual");
let voiceRange = localStorage.getItem("selectedRange").toString();
voiceRange = "Tenor";
let firstmanNote = localStorage.getItem("firstNote").toString();
let secondmanNote = localStorage.getItem("secondNote").toString();
let eser = "es4";
let voce = voiceRange;
let tempo = 120;
const workout = "wo1";
let exDuration = 30;
let exDuration_woSteps = 30;


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
let wo = ["es1", "es2"];
// Variabili note iniziali, possono essere modificate da setVocal

// Recupera il range vocale
async function setVocal(vol, man, first, second) {
    const doc = await db.collection("store").doc("vocal_ranges").get();
    const newVoice = doc.data()[vol];
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

// Carica l'esercizio
async function setExercise(es) {
  const doc = await db.collection("store").doc("exercises").get();
  const exercisePattern = doc.data()[es];
  pattern.length = 0; // Pulisci l'array pattern
  pattern.push(...exercisePattern); // Carica i nuovi pattern
  tempo = pattern[3];
  console.log("Tempo from firebase: " + tempo)
  //console.log(speed);
  const exDuration_woSteps = (60 / tempo) * (pattern.length - 7 + 3);
  console.log("Exercise duration wo Steps: " + exDuration_woSteps);
}

// Carica il workout
async function setWorkout(w) {
  const doc = await db.collection("store").doc("workouts").get();
  const workOuts = doc.data()[w];
  console.log("workouts retrieved from Firestore:", workOuts);

  wo.length = 0;
  wo.push(...workOuts); // Carica i nuovi pattern
  console.log("workout excersises: " + wo);
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
    return new Promise(async (resolve) => {
        await Tone.start();
        console.log("Audio context started");

        const noteStart1 = vox[0]; // Starting note for the type of voice
        const noteStart2 = vox[1]; // Ending note for the type of voice

        const startMidi = Tone.Frequency(noteStart1).toMidi(); // Transform to MIDI
        const endMidi = Tone.Frequency(noteStart2).toMidi();

        let currentMidi = startMidi; // Start at the initial MIDI note
        let noteIndex = 7; // Start index of the pattern notes
        let direction = 1; // 1 for ascending, -1 for descending
        let hasSwitchedToDescending = false; // Tracks if we've switched to descending
        let isPlayingPattern = false; // Indicates whether the pattern is being played

        // Reset and start fresh
        Tone.Transport.stop();
        Tone.Transport.cancel(); // Clear all scheduled events
        console.log("Transport reset");

        exDuration = exDuration_woSteps * (endMidi - startMidi + 1);
        console.log("Exercise duration: " + exDuration);

        Tone.Transport.bpm.value = tempo;
        console.log("BPM transport: " + Tone.Transport.bpm.value);

        const playChord = (time, duration) => {
            const chordNotes = [
                getNoteFromOffset(pattern[4], currentMidi),
                getNoteFromOffset(pattern[5], currentMidi),
                getNoteFromOffset(pattern[6], currentMidi),
            ];
            console.log(`Playing chord: ${chordNotes.join(", ")} at ${time}s for ${duration}`);
            chordNotes.forEach((note) => piano.triggerAttackRelease(note, duration, time));
        };

        const playNextNote = (time) => {
            const offset = pattern[noteIndex];
            const note = getNoteFromOffset(offset, currentMidi);
            changeKeyColor(note);
            piano.triggerAttackRelease(note, "4n", time);
            console.log(`Playing note: ${note} at ${time}s`);

            noteIndex++;
            if (noteIndex >= pattern.length) {
                noteIndex = 7; // Reset the pattern index
                return true; // Signal the end of the pattern
            }
            return false; // Signal that the pattern is still ongoing
        };

        const repeatSequence = (time) => {
            if (!isPlayingPattern) {
                // Play the first chord (2 beats)
                playChord(time, "2n");
                isPlayingPattern = true;
                return time + Tone.Time("2n").toSeconds(); // Schedule next section   /////////QUI TIME
            }

            // Play the pattern
            const patternEnd = playNextNote(time);
            if (patternEnd) {
                const waitTime = Tone.Time("4n").toSeconds(); // Wait for 1 beat
                Tone.Transport.scheduleOnce(() => {
                    // Play the final chord at the same pitch as currentMidi
                    playChord(time + waitTime, "4n"); // Play chord at currentMidi pitch

                    // Handle ascending or descending transition
                    if (direction === 1 && currentMidi === endMidi) {
                        direction = -1; // Switch to descending
                        hasSwitchedToDescending = true;
                        console.log("Switching to descending");
                    } else if (direction === -1 && currentMidi === startMidi) {
                        // Stop when back to the start
                        Tone.Transport.stop();
                        console.log("Pattern completato!");
                        resolve(); // Resolve the promise when the pattern is completed
                        return;
                    }

                    // Move the currentMidi note after playing the final chord
                    currentMidi += direction;
                }, time + waitTime); // Schedule the chord with delay

                isPlayingPattern = false;

                return time + Tone.Time("2n").toSeconds(); // Schedule next iteration
            }

            return time + Tone.Time("4n").toSeconds(); // Schedule the next note
        };

        // Schedule the sequence
        let nextTime = Tone.Transport.now();
        const scheduleSequence = () => {
            nextTime = repeatSequence(nextTime);
            if (Tone.Transport.state === "started") {
                Tone.Transport.scheduleOnce(scheduleSequence, nextTime);
            }
        };

        // Start the transport
        Tone.Transport.start();
        scheduleSequence();
    });
};




/*
// plays the workout

const playWorkout = async (wo) => {
    await Tone.start();
    console.log("Audio context started");

    if (Array.isArray(wo)) {
        let exerciseIndex = 0; // Indice per tracciare gli esercizi
        let nextTime = Tone.Transport.now(); // Tempo di inizio

        const playNextExercise = async () => {
            if (exerciseIndex < wo.length) {
                const currentExercise = wo[exerciseIndex];
                console.log(`Esecuzione esercizio: ${currentExercise}`);

                // Imposta l'esercizio
                await setExercise(currentExercise);

                // Aggiungi un ritardo di 2 secondi tra gli esercizi
                //nextTime += exDuration + 2; // Aggiungi 2 secondi al tempo di inizio
                nextTime += 60; // Aggiungi 2 secondi al tempo di inizio
                console.log("Next time: " + nextTime);

                // Riproduci il pattern
                await playPattern(); // Questo è il tuo playPattern complesso

                // Incrementa l'indice per il prossimo esercizio
                exerciseIndex++;

                // Pianifica il prossimo esercizio dopo il ritardo
                Tone.Transport.scheduleOnce(playNextExercise, nextTime);
            } else {
                // Quando tutti gli esercizi sono stati eseguiti, ferma la trasport
                Tone.Transport.stop();
                console.log("Workout completato!");
            }
        };

        // Inizia a eseguire gli esercizi
        playNextExercise();

    } else {
        console.error("wo non è un array:", wo);
    }
};
*/


// Play specific exercise
const playExercise = async (ex) => {
    setExercise(ex);
    console.log("Playing this: " + ex);
    await playPattern(); // Aspetta che playPattern completi l'esecuzione
};




// Assicurati che il DOM sia pronto
document.addEventListener("DOMContentLoaded", function() {
    // Imposta il range vocale e l'esercizio
    setVocal(voce, manual, firstmanNote, secondmanNote);
    setWorkout(workout);
    document.getElementById("playPattern").addEventListener("click", async function() {
        for (let wo_i = 0; wo_i < wo.length; wo_i++) {
            await setExercise(wo[wo_i]); // Imposta l'esercizio corrente
            console.log("Playing this: " + wo[wo_i]);
    
            // Reset della transport per sicurezza
            Tone.Transport.stop();
            Tone.Transport.cancel();
    
            // Riparte da zero per il nuovo esercizio
            Tone.Transport.start();
            let startTime = Tone.Transport.now(); // Reset del tempo di riferimento
    
            await playPattern(startTime); // Passa il tempo iniziale al pattern
            console.log("Esercizio completato, pausa di 2 secondi...");
            startTime = 0;
    
            // Pausa di 2 secondi tra gli esercizi
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        console.log("Tutti gli esercizi sono stati riprodotti!");
    });    
});