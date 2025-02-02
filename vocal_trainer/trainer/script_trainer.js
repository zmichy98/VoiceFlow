// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Access Firestore
const db = firebase.firestore();

//import Game Pitch
import { startGamePitchTrack } from './game_tuner.js';
//import main of the tuner
import { main } from './game_tuner.js';

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
let workout_length = 480;
let firstmanNote = "C2"
let secondmanNote = "D2"
let time_num = 5
let experience = "Beginner";
let mask = false;
let laxVox = false;
let w = "wo1";
let countPoints = 0;
let gear = "No gear selected";
let logged = false;
let nickname;
let password;

// Configures the piano
const piano_trainer = new Tone.Sampler({
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
    baseUrl: "https://tonejs.github.io/audio/salamander/", // samples path
    onload: () => {
        console.log("Piano loaded");
    }
}).toDestination();


//Takes the variables from the previous pages (stored locally)
document.addEventListener("DOMContentLoaded", function () {
    manual = JSON.parse(localStorage.getItem("manual"));
    range = localStorage.getItem("selectedRange").toString();
    firstmanNote = localStorage.getItem("firstNote").toString();
    secondmanNote = localStorage.getItem("secondNote").toString();
    time_num = JSON.parse(localStorage.getItem("sliderValue"));
    experience = localStorage.getItem("selectedLevel").toString();
    mask = JSON.parse(localStorage.getItem("mask"));
    laxVox = JSON.parse(localStorage.getItem("laxVox"));
    gear = localStorage.getItem("selectedGear");
    logged = JSON.parse(localStorage.getItem("loggedIn"));
    if (logged) {
        nickname = localStorage.getItem("nick");
        password = localStorage.getItem("pass");
    }


    // Create an empty div for the icon
    const iconContainer = document.createElement("div");

    // Check conditions and add the appropriate icons
    if (laxVox === true && mask === true) {
        iconContainer.textContent = "ⓂⓁ"; // Both selected
    }
    else if (laxVox === true) {
        iconContainer.textContent = "Ⓛ"; // Only laxVox selected
    }
    else if (mask === true) {
        iconContainer.textContent = "Ⓜ"; // Only mask selected
    }
    // If any icon is selected, append the icon container to the body
    if (iconContainer.textContent) {
        iconContainer.classList.add("icon");
        document.body.appendChild(iconContainer); // Append to body or a specific container
    }

});

//////////////////////////////////////////////////////// HELPER FUNCTIONS

// Shows all the variables values
async function showValues() {
    console.log("*************************************************")
    console.log("***************** LOCAL VARIABLES *********************")
    console.log("*************************************************")
    console.log("Logged in? " + logged)
    console.log("Logged type: " + typeof logged)
    if (logged) {
        console.log("Nickname: " + nickname)
        console.log("Password: " + password)
    }
    console.log("Workout: " + w);
    console.log("Vox type: " + range);
    console.log("Training time: " + time_num);
    console.log("Manual? " + manual);
    console.log("Mask? " + mask);
    console.log("Lax Vox? " + laxVox);
    console.log("Experience: " + experience);
    console.log("**************************************************")
    console.log("**************************************************")
    console.log("**************************************************")
}

// Decides Workout to be played
// ORDER OF CHOICE: Level of skill, time, equipment
function chooseWorkout() {
    if (experience === "Beginner") {
        console.log("ECCOCI, BEGINNER")
        if (time_num === 5) {
            console.log("ECCOCI, 5 minuti")
            if (mask && !laxVox) {
                w = "wo_1b_n_m_05"
            } else if (!mask && laxVox) {
                console.log("ECCOCI, WORKOUT GIUSTO")
                w = "wo_1b_lv_n_05"
            } else if (mask && laxVox) {
                w = "wo_1b_lv_m_05"
            } else {
                w = "wo_1b_n_n_05"
            }
        } else if (time_num === 10) {
            if (mask && !laxVox) {
                w = "wo_1b_n_m_10"
            } else if (!mask && laxVox) {
                w = "wo_1b_lv_n_10"
            } else if (mask && laxVox) {
                w = "wo_1b_lv_m_10"
            } else {
                w = "wo_1b_n_n_10"
            }
        } else if (time_num === 15) {
            if (mask && !laxVox) {
                w = "wo_1b_n_m_15"
            } else if (!mask && laxVox) {
                w = "wo_1b_lv_n_15"
            } else if (mask && laxVox) {
                w = "wo_1b_lv_m_15"
            } else {
                w = "wo_1b_n_n_15"
            }
        } else {
            if (mask && !laxVox) {
                w = "wo_1b_n_m_20"
            } else if (!mask && laxVox) {
                w = "wo_1b_lv_n_20"
            } else if (mask && laxVox) {
                w = "wo_1b_lv_m_20"
            } else {
                w = "wo_1b_n_n_20"
            }
        }
    } else if (experience === "Intermediate") {
        if (time_num === 5) {
            if (mask && !laxVox) {
                w = "wo_2i_n_m_05"
            } else if (!mask && laxVox) {
                w = "wo_2i_lv_n_05"
            } else if (mask && laxVox) {
                w = "wo_2i_lv_m_05"
            } else {
                w = "wo_2i_n_n_05"
            }
        } else if (time_num === 10) {
            if (mask && !laxVox) {
                w = "wo_2i_n_m_10"
            } else if (!mask && laxVox) {
                w = "wo_2i_lv_n_10"
            } else if (mask && laxVox) {
                w = "wo_2i_lv_m_10"
            } else {
                w = "wo_2i_n_n_10"
            }
        } else if (time_num === 15) {
            if (mask && !laxVox) {
                w = "wo_2i_n_m_15"
            } else if (!mask && laxVox) {
                w = "wo_2i_lv_n_15"
            } else if (mask && laxVox) {
                w = "wo_2i_lv_m_15"
            } else {
                w = "wo_2i_n_n_15"
            }
        } else {
            if (mask && !laxVox) {
                w = "wo_2i_n_m_20"
            } else if (!mask && laxVox) {
                w = "wo_2i_lv_n_20"
            } else if (mask && laxVox) {
                w = "wo_2i_lv_m_20"
            } else {
                w = "wo_2i_n_n_20"
            }
        }
    } else if (experience === "Advanced") {
        if (time_num === 5) {
            if (mask && !laxVox) {
                w = "wo_3a_n_m_05"
            } else if (!mask && laxVox) {
                w = "wo_3a_lv_n_05"
            } else if (mask && laxVox) {
                w = "wo_3a_lv_m_05"
            } else {
                w = "wo_3a_n_n_05"
            }
        } else if (time_num === 10) {
            if (mask && !laxVox) {
                w = "wo_3a_n_m_10"
            } else if (!mask && laxVox) {
                w = "wo_3a_lv_n_10"
            } else if (mask && laxVox) {
                w = "wo_3a_lv_m_10"
            } else {
                w = "wo_3a_n_n_10"
            }
        } else if (time_num === 15) {
            if (mask && !laxVox) {
                w = "wo_3a_n_m_15"
            } else if (!mask && laxVox) {
                w = "wo_3a_lv_n_15"
            } else if (mask && laxVox) {
                w = "wo_3a_lv_m_15"
            } else {
                w = "wo_3a_n_n_15"
            }
        } else {
            if (mask && !laxVox) {
                w = "wo_3a_n_m_20"
            } else if (!mask && laxVox) {
                w = "wo_3a_lv_n_20"
            } else if (mask && laxVox) {
                w = "wo_3a_lv_m_20"
            } else {
                w = "wo_3a_n_n_20"
            }
        }
    } else {
        console.log("Error choosing the workout")
    }
    console.log("Chosen workout: " + w)
}

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
    work.push(...workOuts); // loads the new patterns
    console.log("workout excersises: " + work);
}

// Loads exercise
async function setExercise(es) {
    const doc = await db.collection("store").doc("exercises").get();
    const exercisePattern = doc.data()[es];
    pattern.length = 0; // Cleans the array
    pattern.push(...exercisePattern); // loads the new patterns
    tempo = pattern[3];

    const exerciseTitle = document.getElementById("ex-title-text");
    if (exerciseTitle) {
        exerciseTitle.textContent = pattern[0]; // Update the title
    }
    console.log("Exercise title updated to:", pattern[0]);

    // exercise description
    const exerciseDetail = document.getElementById("ex-detail");

    if (exerciseDetail && pattern && pattern.length > 1) {
        exerciseDetail.innerHTML = `<p>${pattern[1]}</p>`; // Set new description from pattern[1]
        console.log("Exercise description updated to:", pattern[1]);
    } else {
        console.log("Pattern[1] is undefined or empty.");
    }

    console.log("Tempo from firebase: " + tempo)
}

// Evaluates Exercise LENGTH
async function setExerciseLength() {
    const qN = 60 / tempo;
    const hN = qN * 2;

    const sM = Tone.Frequency(vox[0]).toMidi(); // Transform to MIDI
    const eM = Tone.Frequency(vox[1]).toMidi();
    const range_length = (eM - sM + 1) + (eM - sM)

    ex_length = ((((pattern.length - 6) * qN) + hN) * range_length);
    console.log("Ex length: " + ex_length)
}

// Evaluates WORKOUT LENGTH
async function setWorkoutLength() {

    const sM = Tone.Frequency(vox[0]).toMidi(); // Transform to MIDI
    const eM = Tone.Frequency(vox[1]).toMidi();
    let range_length_w = (eM - sM + 1) + (eM - sM)
    console.log("sM: -----------" + eM)

    workout_length = 0

    for (let i = 0; i < work.length; i++) {
        let currEx = work[i];

        const doc = await db.collection("store").doc("exercises").get();
        const currPatt = doc.data()[currEx];

        const qN = 60 / currPatt[3];
        const hN = qN * 2;

        let ex_length_i = ((((currPatt.length - 6) * qN) + hN) * range_length_w);
        console.log("Pattern length: " + range_length_w)
        workout_length += (ex_length_i + 2)
        console.log("Ex i length: " + ex_length_i)
        console.log("Workout length: " + workout_length)
    }
}

// Loads vocal range, or the manual range
async function setVocal(vol, man, first, second) {
    const doc = await db.collection("store").doc("vocal_ranges").get();
    if (range === "Soprano" || range === "Mezzosoprano" || range === "Alto" || range === "Tenor" || range === "Baritone" || range === "Bass") {
        const newVoice = doc.data()[vol];
        console.log("vox from Firebase: " + newVoice);
        vox.length = 0;
        vox.push(...newVoice); // Carica i nuovi pattern
        console.log("vox: " + vox);
        console.log("manual: " + man);
        console.log("first note: " + first);
        console.log("second note: " + second);
    }

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

// Login functionalities
async function setLoginValues() {
    console.log("Logged in? " + logged);

    if (logged === true) {
        const accountsRef = db.collection("store").doc("accounts");
        // Creates the account array
        const userData = [nickname, password, 0, 0, 0, experience, time_num, range, gear, manual, firstmanNote, secondmanNote, laxVox, mask];

        // Updates Firestore with new array
        const doc = await accountsRef.get();
        if (doc.exists) {
            await accountsRef.update({
                [userData[0]]: userData
            });
        } else {
            await accountsRef.set({
                [userData[0]]: userData
            });
        }

        console.log("Set login successful!")
    } else {
        console.log("You are not logged in")
    }
}



//////////////////////////////////////////////////////// PLAYER FUNCTIONS

// Plays a note for a certain duration
const playNote = async (note, duration, time) => {
    piano_trainer.triggerAttackRelease(note, duration, time);
    changeKeyColor(note);

    // Gets the note and assigns the points
    try {
        const result = await startGamePitchTrack(note, duration); // reveals the note
        countPoints += result; // adds the result
        const pointsView = document.getElementById("pointsView");
        pointsView.innerHTML = "Points: " + countPoints
    } catch (error) {
        console.error("Error during pitch tracking:", error);
    }
    console.log("Points counter: " + countPoints);
};

// Plays a chord for a certain duration
const playChord = async (curr, duration, time) => {
    const chordNotes = [
        getNoteFromOffset(pattern[4], curr),
        getNoteFromOffset(pattern[5], curr),
        getNoteFromOffset(pattern[6], curr),
    ];
    console.log(`Playing chord: ${chordNotes.join(", ")} for ${duration}`);
    chordNotes.forEach((note) => piano_trainer.triggerAttackRelease(note, duration, time));
    chordNotes.forEach((note) => changeKeyColor(note));
};

// Plays a pattern
const playPattern = async (curr, duration, pTime) => {
    let noteIndex = 7; // Start index of the pattern notes
    let direction = 1; // 1 for ascending, -1 for descending

    let timeOffset = 0; // Evaluates time between notes

    while (noteIndex < pattern.length) {
        const offset = pattern[noteIndex];
        const currNote = getNoteFromOffset(offset, curr);

        // Plans the next note
        Tone.Transport.schedule((time) => {
            playNote(currNote, duration, time);
            console.log(`Playing note: ${currNote} for ${duration}`);
        }, pTime + timeOffset);

        noteIndex++;

        // Adds the duration of the note to the offset time
        timeOffset += duration;
    }
}

// Plays the exercise
const playExercise = async (es) => {

    await setExercise(es)
    await setExerciseLength();

    const noteStart1 = vox[0]; // Starting note for the type of voice
    console.log("First Note: " + noteStart1)
    const noteStart2 = vox[1]; // Ending note for the type of voice
    console.log("Second Note: " + noteStart2)
    const qN = 60 / tempo;
    const dqN = qN * 1.5
    const hdqN = qN * 0.5
    const hN = qN * 2;
    console.log(qN)

    const startMidi = Tone.Frequency(noteStart1).toMidi(); // Transform to MIDI
    console.log("Primo midi: " + startMidi)
    const endMidi = Tone.Frequency(noteStart2).toMidi();
    console.log("Primo midi: " + endMidi)
    let currentMidi = startMidi; // Start at the initial MIDI note
    console.log(currentMidi)

    let now = Tone.now(); // Get current time

    Tone.Transport.start()

    for (let currentMidi = startMidi; currentMidi <= endMidi; currentMidi++) {

        const patt_length = (pattern.length - 5) * qN;
        // Schedule playChord at the correct time
        Tone.Transport.schedule((time) => {
            playChord(currentMidi, hN, time);
        }, now);  // Schedule at `now`, or adjust based on the loop counter

        // Schedule playPattern at the correct time
        Tone.Transport.schedule((time) => {
            playPattern(currentMidi, qN, time);
        }, now + dqN);  // Wait until after the previous chord (hN)

        Tone.Transport.schedule((time) => {
            playChord(currentMidi, qN, time);
        }, now + patt_length);  // Wait until after the previous chord (hN)

        now += qN + patt_length; // Increment time for the next note's start time
    }

    for (let currentMidi = endMidi - 1; currentMidi >= startMidi; currentMidi--) {

        const patt_length = (pattern.length - 5) * qN;
        // Schedule playChord at the correct time
        Tone.Transport.schedule((time) => {
            playChord(currentMidi, hN, time);
        }, now);  // Schedule at `now`, or adjust based on the loop counter

        // Schedule playPattern at the correct time
        Tone.Transport.schedule((time) => {
            playPattern(currentMidi, qN, time);
        }, now + dqN);  // Wait until after the previous chord (hN)

        Tone.Transport.schedule((time) => {
            playChord(currentMidi, qN, time);
        }, now + patt_length);  // Wait until after the previous chord (hN)

        now += qN + patt_length; // Increment time for the next note's start time
    }
}

// Plays the whole workout
const playWorkout = async (w) => {
    const qN = 60 / tempo;
    const hN = qN * 2;

    // Creates the delay
    const delay = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

    for (let exIndex = 0; exIndex < w.length; exIndex++) {
        console.log(`Starting exercise ${exIndex + 1}`);

        let curr_ex = w[exIndex]

        await playExercise(curr_ex);

        await delay(ex_length);

        await delay(2);
    }
}

// Creates a delay
const delay = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));


//////////////////////////////////////////////////////// WINDOW LOAD AND ON CLICK - WHAT IS ACTUALLY HAPPENING

window.onload = function () {
    document.getElementById("playPattern").addEventListener("click", async function () {
        if (this) {
            this.style.display = 'none';
        }
        const exerciseTitle = document.getElementById("ex-title-text");
        exerciseTitle.textContent = "Wait for the workout to load"

        await delay(2);
        setLoginValues();
        await showValues();
        await setVocal(range, manual, firstmanNote, secondmanNote)
        chooseWorkout();
        const workout = w;
        console.log("Workout correct: " + workout)
        await setWorkout(workout);
        await setWorkoutLength()

        //timebar
        const progress = document.getElementById("progress");
        const wDuration = workout_length + 3;

        console.log("Duration ----------------------" + wDuration)

        progress.style.width = "0"; // Reset
        progress.style.transition = `${wDuration}s linear`; // Sets the duration
        progress.style.width = "100%"; // Fills the bar

        // Waits
        await delay(2);

        // Plays the Workout
        await Tone.start();
        console.log("Audio context started");

        playWorkout(work)

        // Redirect to results page after workout is done
        setTimeout(() => {
            setTimeout(() => {
                main();
                localStorage.setItem("currentScore", countPoints)
                window.location.href = "resume.html";
            }, 1000); // 1-second delay before redirecting
        }, wDuration * 1000);

    });
}