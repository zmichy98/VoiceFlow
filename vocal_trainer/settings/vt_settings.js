/*------------------------ VARIABLES --------------------------*/
let selectedLevel = "";

/*------------------------ SETTINGS BAR ------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  const settings = document.querySelectorAll(".setting");
  const currentPage = parseInt(document.body.dataset.setting);
  const totalSettings = settings.length;

  let currentSetting = parseInt(localStorage.getItem("currentSetting")) || 1;

  if (currentPage > currentSetting) {
    currentSetting = currentPage;
    localStorage.setItem("currentSetting", currentSetting);
  }
  
  settings.forEach((setting, index) => {
    if (index + 1 < currentPage) {
      setting.classList.add("completed");
      setting.textContent = "✔";
    } else if (index + 1 === currentPage) {
      setting.classList.add("active");
    }
  });
});


/*------------------------ SELECTED LEVEL ------------------------*/
document.addEventListener("DOMContentLoaded", () => {

  const levelButtons = document.querySelectorAll(".level-button");
  const levelDescription = document.getElementById("level-description");
  const nextButton = document.querySelector(".next_button"); // Select the "Next" button by class

  // Initially hide the "Next" button
  if(nextButton) {
    nextButton.style.display = "none";
  }
 

  levelButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (!button.classList.contains("active")) {
        levelButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        selectedLevel = button.textContent.trim();

        if (button.textContent === "Beginner") {
          levelDescription.innerHTML = "<p>You’ve just started exploring singing.</p>";
        } else if (button.textContent === "Intermediate") {
          levelDescription.innerHTML = "<p>You’re past the beginner stage, but not quite at the advanced level yet.</p>";
        } else if (button.textContent === "Advanced") {
          levelDescription.innerHTML = "<p>You consider yourself a highly skilled singer!</p>";
        } else {
          levelDescription.innerHTML = "<p>Select a level that describes you the best!</p>";
        }

        // Show the "Next" button when a level is selected
        nextButton.style.display = "inline-block";
      }

      localStorage.setItem("selectedLevel", selectedLevel);
      const savedLevel = localStorage.getItem("selectedLevel");
      if (savedLevel) {
        console.log("Your Level: " + localStorage.getItem("selectedLevel"));
      }

    });
  });
});



/*------------------------ TRAINING TIME ------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById('Slider');
  const sliderValue = document.getElementById('trainingTime');
  const nextButton = document.querySelector(".next_button");

  if(nextButton) {
    nextButton.style.display = "none";
  }
  if(slider) {
    slider.addEventListener('input', function() {
      sliderValue.textContent = slider.value;
      if (slider.value > 0) {
        nextButton.style.display = "inline-block";
      } else {
       nextButton.style.display = "none";
      }
      localStorage.setItem("sliderValue", slider.value)
    });
  }
});

/*------------------------ VOCAL RANGE 1 ------------------------*/
let manual = false;
document.addEventListener('DOMContentLoaded', () => {
  let selectedRange = '';
  const rangeButtons = document.querySelectorAll('.range-button');
  const rangeDescription = document.getElementById('range-description');
  const nextButton = document.querySelector('.next_button');

  if (!rangeDescription) {
    console.log('range-description element not found.');
    return;
  }

  // Initially hide the "Next" button
  if(nextButton) {
    nextButton.style.display = "none";
  }

  rangeButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (!button.classList.contains('active')) {
        
        // Remove active class from all buttons
        rangeButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to the clicked button
        button.classList.add('active');
        
        // Update the selected range based on the button clicked
        selectedRange = button.textContent.trim();

        // Change the range description based on the selected range
        if (selectedRange === 'Soprano') {
          rangeDescription.innerHTML = '<p>The highest female voice, typically able to sing in a high range, often soaring above the melody in classical music. (C4-C6)</p>';
        } else if (selectedRange === 'Mezzosoprano') {
          rangeDescription.innerHTML = '<p>A female voice between soprano and contralto, with a rich mid-range and the ability to sing lower notes while retaining brightness. (A3-A5)</p>';
        } else if (selectedRange === 'Contralto') {
          rangeDescription.innerHTML = '<p>The lowest female voice, known for its deep, resonant tones that can reach into the lower registers of the male range. (F3-F5)</p>';
        } else if (selectedRange === 'Tenor') {
          rangeDescription.innerHTML = '<p>The highest male voice, often characterized by its bright, powerful sound, capable of reaching high notes with strength and clarity. (B2-B4)</p>';
        } else if (selectedRange === 'Baritone') {
          rangeDescription.innerHTML = '<p>A male voice with a rich mid-range, sitting comfortably between tenor and bass, capable of a broad vocal range. (G2-G4)</p>';
        } else if (selectedRange === 'Bass') {
          rangeDescription.innerHTML = '<p>The lowest male voice, known for its deep, powerful, and resonant tones, typically providing the foundation in choral settings. (E2-E4)</p>';
        } else {
          rangeDescription.innerHTML = '<p> </p>';
        }

        // Show the "Next" button when a range is selected
        nextButton.style.display = "inline-block";
      }

      // Save the selected range to localStorage
      manual = false;
      localStorage.setItem("manual", manual);
      localStorage.setItem("selectedRange", selectedRange);
    });
  });
});

/*------------------------ VOCAL RANGE 2 ------------------------*/
// Function to start selecting
function activeselect() {
  let firstNote = null;
  let secondNote = null;
  const button = document.querySelector('button');
  const noteButtons = document.querySelectorAll('.key');
  const rangeInterval = document.getElementById('rangeInterval');
  const startselectionText = document.getElementById('startselectionText');
  const nextButton = document.querySelector('.next_button'); // Select the "Next" button by class

  // Initially hide the "Next" button
  if(nextButton) {
    nextButton.style.display = "none";
  }

  button.classList.toggle('active');

  document.querySelectorAll('.key.pressed').forEach(key => {
    key.classList.remove('pressed');
  }); 

  // Add click event listeners when the "Select" button is pressed
  noteButtons.forEach(button => {
    button.addEventListener('click', noteClickHandler); 
  });

  function noteClickHandler() {
    const note = this.getAttribute('data-note'); // Get the note from the data attribute

    // If it's the first note selection
    if (firstNote === null) {
      firstNote = note;
      this.classList.add('pressed');  // Highlight the key
    } 
    // If it's the second note and different from the first
    else if (secondNote === null && note !== firstNote) {
      secondNote = note;
      this.classList.add('pressed');  // Highlight the second key
      finalizeSelection();            // Stop further changes
    }

    updateRangeText();
  }

  function updateRangeText() {
    if (firstNote && !secondNote) {
      rangeInterval.innerHTML = `<p>Range starts at ${firstNote}, select the range ending note</p>`;
      button.classList.toggle('active');
    } else if (firstNote && secondNote) {
      rangeInterval.innerHTML = `<p>Range starts at ${firstNote} and ends at ${secondNote}</p>`; 

      // Show the "Next" button when both notes are selected
      nextButton.style.display = "inline-block";
      startselectionText.innerHTML = "Change interval";
      button.classList.remove('active');
    }
  }

  function finalizeSelection() {
    // Save the selected range to localStorage
    const manual = true;
    localStorage.setItem("manual", manual);
    localStorage.setItem("firstNote", firstNote);
    localStorage.setItem("secondNote", secondNote);
    localStorage.setItem("selectedRange", `from ${firstNote} to ${secondNote}`);

    // Optionally log for debugging
    console.log('First Note:', firstNote, 'Second Note:', secondNote); 
  }
}

// Initialize the Salamander piano sampler
const piano = new Tone.Sampler({
  urls: {
    "A0": "A0.mp3",
    "C1": "C1.mp3",
    "D#1": "Ds1.mp3",
    "F#1": "Fs1.mp3",
    "A1": "A1.mp3",
    "A2": "A2.mp3",
    "C2": "C2.mp3",
    "D#2": "Ds2.mp3",
    "F#2": "Fs2.mp3",
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
  baseUrl: "https://tonejs.github.io/audio/salamander/",
  onload: () => {
    console.log("Piano loaded");
  }
}).toDestination();

// Add sound to all keys (independent of "Select" button)
document.querySelectorAll('.key').forEach(key => {
  key.addEventListener('click', () => {
    const note = key.getAttribute('data-note');
    piano.triggerAttackRelease(note, "4n");
  });
});


/*------------------------ VOCAL GEAR ------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  // Query the gear buttons
  const buttons = document.querySelectorAll(".button-gear");
  
  // Query the "Next" button
  const nextButton = document.querySelector(".next_button");

  // Variables to track selected buttons
  let selectedMask = false; 
  let mask = false;
  let selectedLaxvox = false; 
  let laxVox = false;
  let selectedNone = false; 

  // Initially hide the "Next" button
  if(nextButton) {
    nextButton.style.display = "none";
  }

  // Event listener on click
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Toggle the 'selected' and 'activatedgear' classes
      button.classList.toggle("selected");
      button.classList.toggle("activatedgear");

      // Update variables based on the button's current state
      if (button.id === "mask") {
        selectedMask = button.classList.contains("selected");
        mask = true;
      } else if (button.id === "laxvox") {
        selectedLaxvox = button.classList.contains("selected");
        laxVox = true;
      } else if (button.id === "none") {
        selectedNone = button.classList.contains("selected");
      }

      // If "None of them" is selected, deselect the other buttons
      if (selectedNone) {
        buttons.forEach((btn) => {
          if (btn.id !== "none") {
            btn.classList.remove("selected");
            btn.classList.remove("activatedgear");
          }
        });
        selectedMask = false;
        mask = false;
        selectedLaxvox = false;
        laxVox = false;
      } else if (selectedMask || selectedLaxvox) {
        // Deselect "None of them" if any other button is selected
        const noneButton = document.getElementById("none");
        noneButton.classList.remove("selected");
        noneButton.classList.remove("activatedgear");
        selectedNone = false;
      }

      // Show or hide the "Next" button based on selection
      if (selectedMask || selectedLaxvox || selectedNone) {
        nextButton.style.display = "inline-block";  // Show the "Next" button if any option is selected
      } else {
        nextButton.style.display = "none";          // Hide the "Next" button if no options are selected
      }

      // Update selectedGear variable
      if (selectedMask && selectedLaxvox) {
        selectedGear = "Mask and Laxvox";
      } else if (selectedMask) {
        selectedGear = "Mask";
      } else if (selectedLaxvox) {
        selectedGear = "Laxvox";
      } else if (selectedNone) {
        selectedGear = "No gear selected";
      }

      // Save the selected range to localStorage
      localStorage.setItem("selectedGear", selectedGear);
      localStorage.setItem("mask", mask);
      localStorage.setItem("laxVox", laxVox);

      // Log the states (for debugging or tracking purposes)
      console.log("Mask selected:", selectedMask);
      console.log("Laxvox selected:", selectedLaxvox);
      console.log("None selected:", selectedNone);

    });
  });
});