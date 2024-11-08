// Crea un sintetizzatore
const synth = new Tone.Synth().toDestination();

// Controllo del volume
const volumeControl = new Tone.Volume(-12).toDestination();
synth.connect(volumeControl);

// Seleziona elementi HTML
const keys = document.querySelectorAll('.key');
const bkeys = document.querySelectorAll('.bkey');
const volumeSlider = document.getElementById('volume');
const waveformSelect = document.getElementById('waveform');
const waveformButtons = document.querySelectorAll('.waveform-button');

// Mappa dei tasti e delle note
const keyToNote = {
    'a': 'C3',
    's': 'D3',
    'd': 'E3',
    'f': 'F3',
    'g': 'G3',
    'h': 'A3',
    'j': 'B3',
    'k': 'C4',
    'w': 'C#3',
    'e': 'D#3',
    't': 'F#3',
    'y': 'G#3',
    'u': 'A#3'
};

//activate
const leds = document.querySelectorAll('.led');

function activateKey(note) {
  const key = document.querySelector(`.key[data-note="${note}"]`);
  if (key) {
    key.classList.add('on');
    setTimeout(() => key.classList.remove('on'), 200);
  }
}

function activateBKey(note) {
  const bkey = document.querySelector(`.bkey[data-note="${note}"]`);
  if (bkey) {
    bkey.classList.add('on');
    setTimeout(() => bkey.classList.remove('on'), 200);
  }
}

// Aggiungi eventi alle note della tastiera
keys.forEach(key => {
    key.addEventListener('mousedown', () => {
        const note = key.getAttribute('data-note');
        synth.triggerAttackRelease(note, '0.5');
        activateKey(note);
    });
});

// Aggiungi eventi alle note della tastiera
bkeys.forEach(bkey => {
    bkey.addEventListener('mousedown', () => {
        const note = bkey.getAttribute('data-note');
        synth.triggerAttackRelease(note, '0.5');
        activateBKey(note);
    });
});

// Controllo del volume
volumeSlider.addEventListener('change', (e) => {
    const volume = e.target.value;
    volumeControl.volume.value = volume;
  console.log(volumeControl.volume.value)
});

// Cambia il tipo di onda quando un pulsante è premuto
waveformButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Rimuovi la classe attiva da tutti i pulsanti
        waveformButtons.forEach(btn => btn.classList.remove('active'));
        // Aggiungi la classe attiva al pulsante corrente
        button.classList.add('active');
        // Cambia la forma d'onda
        const waveform = button.getAttribute('data-waveform');
        synth.oscillator.type = waveform;
    });
});

// Ascolta gli eventi della tastiera del computer
document.addEventListener('keydown', (e) => {
    const note = keyToNote[e.key.toLowerCase()];
    if (note) {
        synth.triggerAttackRelease(note, '0.5');
        activateKey(note); // Attiva il feedback visivo
    }
});
