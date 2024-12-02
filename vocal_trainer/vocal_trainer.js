document.addEventListener("DOMContentLoaded", () => {
  /*------------------------ SELECTED LEVEL ------------------------*/
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
          levelDescription.innerHTML = '<p>You only recently started studying singing</p>';
          //innerHTML let us read and modify the HTML content of an element
          //<p> is used to create the paragraph

        } else if (button.textContent === 'Intermediate') {
          levelDescription.innerHTML = '<p>You are not a beginner but not even an advanced singer </p>';
        
        } else if (button.textContent === 'Advanced') {
          levelDescription.innerHTML = '<p>You feel to be a quite great singer!</p>';
        
        } else {
          levelDescription.innerHTML = '<p>Select a level that rappresents you the best!</p>';
        }
      }
      /*I save the selectedLevel variable in the localStorage*/
      localStorage.setItem("selectedLevel", selectedLevel)
    });
  });

  /*------------------------ TRAINING TIME ------------------------*/
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
  /*------------------------ VOCAL RANGE ------------------------*/
  
});