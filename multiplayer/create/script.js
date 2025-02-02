
const firebaseConfig = {
  apiKey: "AIzaSyB-BaTehljfDtni-HAPrYh6rKT9sJyTKaU",
  authDomain: "database-for-singing.firebaseapp.com",
  projectId: "database-for-singing",
  storageBucket: "database-for-singing.appspot.com",
  messagingSenderId: "397721112623",
  appId: "1:397721112623:web:c5ec8963358f8e014736da"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Sends the login data to Firestore
async function sendLoginToFirestore() {
  try {
    // Values from form
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;

    if (!nickname || !password) {
      alert('Please fill in all fields!');
      return;
    }


    const accountsRef = db.collection("store").doc("accounts");

    // User data array
    const userData = [nickname, password, 0, 0, 0, "n", "n", "n", "n", "n", "n", "n", "n", "n"];

    // Updates Firestore
    const doc = await accountsRef.get();

    if (doc.exists) {

      let data = doc.data();
      let usernameExists = false;

      for (let key in data) {
        let array = data[key];

        // Checks if nickname exists
        if (Array.isArray(array) && array.length > 0 && array[0] === nickname) {
          usernameExists = true;
          console.log(`Nickname "${nickname}" already exists in array "${key}".`);
          break; // Uscita dal ciclo se il nome utente è trovato
        }
      }

      if (usernameExists) {
        console.log(`Nickname "${nickname}" already exists.`);
        alert("Username not available. Please retry.")
        return
      } else {
        await accountsRef.update({
          [userData[0]]: userData
        });
      }
    } else {
      await accountsRef.set({
        [userData[0]]: userData
      });
    }

    console.log("✅ Account added successfully!");

    alert('✅ Account successfully created!');
  } catch (error) {
    console.error('❌ Error while creating the account:', error);
    alert('An error occurred. Please try again.');
  }
}

////// WHAT IS ACTUALLY HAPPENING
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("accountForm").addEventListener("submit", async function () {
    event.preventDefault();
    await sendLoginToFirestore();
    window.location.href = "/multiplayer/login/login.html"; // Redirect to login page
    document.getElementById('accountForm').reset();
  });
});