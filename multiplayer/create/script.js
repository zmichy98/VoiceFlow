
  const firebaseConfig = {
    apiKey: "AIzaSyB-BaTehljfDtni-HAPrYh6rKT9sJyTKaU",
    authDomain: "database-for-singing.firebaseapp.com",
    projectId: "database-for-singing",
    storageBucket: "database-for-singing.appspot.com",
    messagingSenderId: "397721112623",
    appId: "1:397721112623:web:c5ec8963358f8e014736da"
  };

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function sendLoginToFirestore() {
  try {
    // Recupera i valori inseriti nel form
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;

    if (!nickname || !password) {
      alert('Please fill in all fields!');
      return;
    }

    // Controlla se il nickname esiste già
    const accountsRef = db.collection("store").doc("accounts");

    // Creiamo l'array di dati dell'utente
    const userData = [nickname, password, 0, 0, 0, "n", "n", "n", "n", "n", "n", "n", "n", "n"];

// Aggiorna Firestore con il nuovo array senza sovrascrivere
    const doc = await accountsRef.get();

    if (doc.exists) {
      
      let data = doc.data();
      let usernameExists = false;  // Flag per sapere se il nome utente esiste già

      for (let key in data) {
        let array = data[key];
  
        // Verifica che l'array esista e se il primo elemento (nome utente) è uguale a targetUsername
        if (Array.isArray(array) && array.length > 0 && array[0] === nickname) {
          usernameExists = true;
          console.log(`Il nome utente "${nickname}" esiste già nell'array "${key}".`);
          break; // Uscita dal ciclo se il nome utente è trovato
        }
      }

      if (usernameExists) {
        console.log(`Il nome utente "${nickname}" esiste già.`);
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

    console.log("✅ Account aggiunto correttamente!");

    alert('✅ Account successfully created!');
  } catch (error) {
    console.error('❌ Error while creating the account:', error);
    alert('An error occurred. Please try again.');
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("accountForm").addEventListener("submit", async function() {
    event.preventDefault();
    await sendLoginToFirestore();
    window.location.href = "/multiplayer/login/login.html"; // Redirect alla pagina di login
    document.getElementById('accountForm').reset();
  });
});