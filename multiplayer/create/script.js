// Import Firebase 8
//import firebase from "https://www.gstatic.com/firebasejs/7.2.0/firebase-app.js";
//import "https://www.gstatic.com/firebasejs/7.2.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-BaTehljfDtni-HAPrYh6rKT9sJyTKaU",
  authDomain: "database-for-singing.firebaseapp.com",
  projectId: "database-for-singing",
  storageBucket: "database-for-singing.firebasestorage.app",
  messagingSenderId: "397721112623",
  appId: "1:397721112623:web:c5ec8963358f8e014736da"
};

// Initialize Firebase and Firestore (Firebase 8 syntax)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Funzione per hashare la password

// Gestione del form di registrazione
document.getElementById('accountForm').addEventListener('submit', async function (e) {

  try {
    // Controlla se il nickname esiste già
    const accountsRef = db.collection("store").doc("accounts");
    const docSnapshot = await accountsRef.get();

    let usersArray = [];
    
    if (docSnapshot.exists) {
      usersArray = docSnapshot.data().users || [];
      
      // Controlla se il nickname è già presente
      if (usersArray.some(user => user[0] === "test")) {
        alert('This nickname is already taken. Please choose another one.');
        return;
      }
    }


    // Creiamo l'array di dati dell'utente
    const userData = [0, 1, 2];

    // Aggiunge il nuovo utente all'array
    usersArray.push(userData);

    // Aggiorna Firestore con il nuovo array senza sovrascrivere
    await accountsRef.set({ users: usersArray }, { merge: true });

    console.log("✅ Account aggiunto correttamente!");

    alert('✅ Account successfully created!');
    window.location.href = "/multiplayer/login/login.html"; // Redirect alla pagina di login
    document.getElementById('accountForm').reset();

  } catch (error) {
    console.error('❌ Error while creating the account:', error);
    alert('An error occurred. Please try again.');
  }
});


