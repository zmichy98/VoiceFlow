// Web Audio API context to play notes
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Define note frequencies for multiple octaves
const noteFrequencies = {
    "C": [261.63, 523.25, 1046.50],   // C frequencies for 1st, 2nd, and 3rd octaves
    "C#": [277.18, 554.37, 1108.74],  // C# frequencies for 1st, 2nd, and 3rd octaves
    "D": [293.66, 587.33, 1174.66],   // D frequencies for 1st, 2nd, and 3rd octaves
    "D#": [311.13, 622.25, 1244.51],  // D# frequencies for 1st, 2nd, and 3rd octaves
    "E": [329.63, 659.26, 1318.51],   // E frequencies for 1st, 2nd, and 3rd octaves
    "F": [349.23, 698.46, 1396.91],   // F frequencies for 1st, 2nd, and 3rd octaves
    "F#": [369.99, 739.99, 1479.98],  // F# frequencies for 1st, 2nd, and 3rd octaves
    "G": [392.00, 784.00, 1568.00],   // G frequencies for 1st, 2nd, and 3rd octaves
    "G#": [415.30, 830.61, 1661.22],  // G# frequencies for 1st, 2nd, and 3rd octaves
    "A": [440.00, 880.00, 1760.00],   // A frequencies for 1st, 2nd, and 3rd octaves
    "A#": [466.16, 932.32, 1864.64],  // A# frequencies for 1st, 2nd, and 3rd octaves
    "B": [493.88, 987.77, 1975.53]    // B frequencies for 1st, 2nd, and 3rd octaves
};

// Function to play a note based on the octave number (1, 2, or 3)
function playNote(note, octave) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";  // Sine wave sound

    const frequency = noteFrequencies[note][octave - 1]; // Get the frequency based on the octave
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5;
    
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5); // Play note for 0.5 seconds

    changeKeyColor(note, octave);
}

// Function to change the color of the key when pressed
function changeKeyColor(note, octave) {
    const key = document.querySelector(`.key[data-note="${note}"][data-octave="${octave}"]`);
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

// Function to play a sequence of notes and update the progress bar
function playNoteSequence(notes) {
    let totalDuration = 0;
    let currentTime = 0;

    // Calculate total duration and set up progress bar duration
    notes.forEach(({ note, octave, duration }) => {
        totalDuration += duration;
    });

    // Set the total duration for the progress bar
    const progressBar = document.getElementById("progress");
    progressBar.style.transitionDuration = `${totalDuration}s`;

    // Play the notes one by one with the correct timing
    notes.forEach(({ note, octave, duration }, index) => {
        setTimeout(() => {
            playNote(note, octave);
        }, currentTime * 1000);

        currentTime += duration;
    });

    // Update progress bar as time passes
    let progress = 0;
    const interval = setInterval(() => {
        progress += (100 / totalDuration);
        progressBar.style.width = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 100);
}

// Example of a note sequence with durations (in seconds)
const noteSequence = [
    { note: "C", octave: 1, duration: 1 },
    { note: "E", octave: 1, duration: 1 },
    { note: "G", octave: 1, duration: 1 },
    { note: "C", octave: 2, duration: 1 },
    { note: "E", octave: 2, duration: 1 },
    { note: "G#", octave: 2, duration: 1 }
];

// Play the note sequence
playNoteSequence(noteSequence);
