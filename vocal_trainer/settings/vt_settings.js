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
  /* The listener comand wait that all the HTML page is fully loaded before running 
  the JS code. Useful to not let the code be exicuted before that all the elements
  are loaded on the DOM */

  /* I create a variable named selectedLevel to save the level choosed */
  let selectedLevel = '';

  /* Select all buttons with the class "level-button" and save them in the
  levelButtons variable.*/
  const levelButtons = document.querySelectorAll('.level-button');
  
  /* Select element by the id, every element in html should have an unique id that
  can be used to be called in the JS code. In this case the 'level-description' id
  referes to the div elememnt in which we want to write the description of the level.
  The link to that element we then save it in the variabl levelDescription*/
  const levelDescription = document.getElementById('level-description');

  /*Add click event listener to each button saved in levelButton, when one of those
  button is selected, the folluing function will be run.*/
  levelButtons.forEach(button => {
    //now, the button 'button' is clicked, anche code goes forward
    button.addEventListener('click', () => {

      /*Now, if the button clicked is NOT alreay active (has the class active) then
      the code runs the following code:*/
      if (!button.classList.contains('active')) {

        /*to be sure that only one button at the time is active, we remove the
        active class to all the level buttons*/
        levelButtons.forEach(btn => btn.classList.remove('active')); //btn is a parameter used to refer to each button in the list levelButtons

        /* We now add the "active" class to the clicked button 'button'*/
        button.classList.add('active');
        
        /*I save the level choosed in the variable*/
        selectedLevel = button.textContent.trim();

        /* To display the corresponding description based on the clicked 
        button we use an if.
        If the text contained in the button is 'Beginner, then we modify the text
        of the element with ID levelDescription */
        if (button.textContent === 'Beginner') {
          levelDescription.innerHTML = '<p> You’ve just started exploring singing.</p>';
          //innerHTML let us read and modify the HTML content of an element
          //<p> is used to create the paragraph

        } else if (button.textContent === 'Intermediate') {
          levelDescription.innerHTML = '<p>You’re past the beginner stage, but not quite at the advanced level yet.</p>';
        
        } else if (button.textContent === 'Advanced') {
          levelDescription.innerHTML = '<p>You consider yourself a highly skilled singer!</p>';
        
        } else {
          levelDescription.innerHTML = '<p>Select a level that describes you the best!</p>';
        }
      }
      /*I save the selectedLevel variable in the localStorage*/
      localStorage.setItem("selectedLevel", selectedLevel)
    });
  });
});

/*------------------------ TRAINING TIME ------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  // I Select the slider by its id and save it in the costant
  const slider = document.getElementById('Slider');
  // I save the value selected with the slider and save it in the sliderValue variable
  const sliderValue = document.getElementById('trainingTime');

  // I add an event listener to keep the time value loaded in real time
  slider.addEventListener('input', function() {
    sliderValue.textContent = slider.value;  // Aggiorna il testo con il valore dello slider
    /*I save the sliderValuel variable in the localStorage*/
    localStorage.setItem("sliderValue", slider.value)
  });
});

/*------------------------ VOCAL RANGE 1 ------------------------*/
let manual = false;
document.addEventListener('DOMContentLoaded', () => {
  let selectedRange = '';
  const rangeButtons = document.querySelectorAll('.range-button');
  const rangeDescription = document.getElementById('range-description');

  // Check if the range description exists in the DOM
  if (!rangeDescription) {
    console.error('range-description element not found.');
    return;
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
          rangeDescription.innerHTML = '<p>The highest female voice, typically able to sing in a high range, often soaring above the melody in classical music.</p>';
        } else if (selectedRange === 'Mezzosoprano') {
          rangeDescription.innerHTML = '<p>A female voice between soprano and contralto, with a rich mid-range and the ability to sing lower notes while retaining brightness.</p>';
        } else if (selectedRange === 'Contralto') {
          rangeDescription.innerHTML = '<p>The lowest female voice, known for its deep, resonant tones that can reach into the lower registers of the male range.</p>';
        } else if (selectedRange === 'Tenor') {
          rangeDescription.innerHTML = '<p>The highest male voice, often characterized by its bright, powerful sound, capable of reaching high notes with strength and clarity.</p>';
        } else if (selectedRange === 'Baritono') {
          rangeDescription.innerHTML = '<p>A male voice with a rich mid-range, sitting comfortably between tenor and bass, capable of a broad vocal range.</p>';
        } else if (selectedRange === 'Bass') {
          rangeDescription.innerHTML = '<p>The lowest male voice, known for its deep, powerful, and resonant tones, typically providing the foundation in choral settings.</p>';
        } else {
          rangeDescription.innerHTML = '<p> </p>';
        }
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
  const button = document.querySelector('button');
  const noteButtons = document.querySelectorAll('.key');
  const rangeInterval = document.getElementById('rangeInterval');
  const satrtselection = document.getElementById('startselection');

  button.classList.toggle('active')

  let firstNote = null;
  let secondNote = null;

  // Add click event listeners when the "Select" button is pressed
  noteButtons.forEach(button => {
    button.addEventListener('click', noteClickHandler); 
  });

  function noteClickHandler() {
    const note = this.getAttribute('data-note'); // Get the note from the data attribute

    // If it's the first note selection
    if (firstNote === null) {
      firstNote = note;
      this.classList.add('pressed'); // Highlight the key
    } 
    // If it's the second note and different from the first
    else if (secondNote === null && note !== firstNote) {
      secondNote = note;
      this.classList.add('pressed'); // Highlight the second key
      finalizeSelection(); // Stop further changes
    }

    
    updateRangeText();
  }

  function updateRangeText() {
    if (firstNote && !secondNote) {
      rangeInterval.innerHTML = `<p>Range starts at ${firstNote}, select the range ending note</p>`;
    } else if (firstNote && secondNote) {
      rangeInterval.innerHTML = `<p>Range starts at ${firstNote} and ends at ${secondNote}</p>`; 
      startselection.innerHTML = " ";
    }
  }

  function finalizeSelection() {
    // Save the selected range to localStorage
    manual = true;
    localStorage.setItem("manual", manual);
    localStorage.setItem("firstNote", firstNote);
    localStorage.setItem("secondNote", secondNote);
    localStorage.setItem("selectedRange", `from ${firstNote} to ${secondNote}`);

    // Optionally log for debugging
    console.log('First Note:', firstNote, 'Second Note:', secondNote);

    // Remove event listeners to prevent further changes
    noteButtons.forEach(button => {
      button.removeEventListener('click', noteClickHandler);
    });
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
    piano.triggerAttackRelease(note, "6n");
  });
});

/*------------------------ VOCAL RANGE 3 ------------------------*/

/*------------------------ VOCAL GEAR ------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  //query the gear buttons
  const buttons = document.querySelectorAll(".button-gear");

  // Variables to track selected buttons
  let selectedMask = false;
  let selectedLaxvox = false;
  let selectedNone = false;
  let selectedGear = "No gear selected";

  // event listener on click
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Toggle the 'selected' and 'activatedgear' classes
      button.classList.toggle("selected");
      button.classList.toggle("activatedgear");

      // Update variables based on the button's current state
      if (button.id === "mask") {
        selectedMask = button.classList.contains("selected");
      } else if (button.id === "laxvox") {
        selectedLaxvox = button.classList.contains("selected");
      } else if (button.id === "none") {
        selectedNone = button.classList.contains("selected");
      }

      // If you select "None of them" the other need to be deselected
      if (selectedNone) {
        // Deselect other buttons
        buttons.forEach((btn) => {
          if (btn.id !== "none") {
            btn.classList.remove("selected");
            btn.classList.remove("activatedgear");
          }
        });
        // update variables
        selectedMask = false;
        selectedLaxvox = false;

        //If you select mask or laxvox deselect none of them
      } else if (selectedMask || selectedLaxvox) {
        // Deselect "None of them" if any other button is selected
        const noneButton = document.getElementById("none");
        noneButton.classList.remove("selected");
        noneButton.classList.remove("activatedgear");
        // Update variable
        selectedNone = false;
      }

      // Update variable slectedGear
      if (selectedMask && selectedLaxvox) {
        selectedGear = "mask and laxvox"
      } else if (selectedMask) {
        selectedGear = "mask"
      } else if (selectedLaxvox) {
        selectedGear = "lax vox"
      } else if (selectedNone) {
        selectedGear = "No gear selected"
      }

      // Save the selected range to localStorage
      localStorage.setItem("selectedGear", selectedGear);

      // Log the states (for debugging or tracking purposes)
      console.log("Mask selected:", selectedMask);
      console.log("Laxvox selected:", selectedLaxvox);
      console.log("None selected:", selectedNone);
    });
  });
});