/*------------------------ VOCAL GEAR ------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    // Query the gear buttons
    const buttons = document.querySelectorAll(".button-gear");
    console.log("ciao");
  
    // Variables to track selected buttons
    let selectedMask = false; 
    let selectedLaxvox = false; 
    let selectedNone = false; 
    let selectedGear = "No gear selected";
  
    // Event listener on click
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
          console.log(selectedLaxvox);
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
          selectedLaxvox = false;
        } else if (selectedMask || selectedLaxvox) {
          // Deselect "None of them" if any other button is selected
          const noneButton = document.getElementById("none");
          noneButton.classList.remove("selected");
          noneButton.classList.remove("activatedgear");
          selectedNone = false;
        }
  
        // Update selectedGear variable
        if (selectedMask && selectedLaxvox) {
          selectedGear = "mask and laxvox";
        } else if (selectedMask) {
          selectedGear = "mask";
        } else if (selectedLaxvox) {
          selectedGear = "lax vox";
        } else if (selectedNone) {
          selectedGear = "No gear selected";
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