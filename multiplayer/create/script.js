// Import Firebase 8
import firebase from "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js";
const CryptoJS = await import("https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js");

// Firebase Config (Usiamo i tuoi dati)
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
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

// Gestione del form di registrazione
document.getElementById('accountForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Recupera i valori inseriti nel form
  const nickname = document.getElementById('nickname').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;

  if (!nickname || !password || !email) {
    alert('Please fill in all fields!');
    return;
  }

  try {
    // Controlla se il nickname esiste già
    const accountsRef = db.collection("store").doc("accounts");
    const docSnapshot = await accountsRef.get();

    let usersArray = [];
    
    if (docSnapshot.exists) {
      usersArray = docSnapshot.data().users || [];
      
      // Controlla se il nickname è già presente
      if (usersArray.some(user => user[0] === nickname)) {
        alert('This nickname is already taken. Please choose another one.');
        return;
      }
    }

    // Hash della password
    const hashedPassword = hashPassword(password);

    // Creiamo l'array di dati dell'utente
    const userData = [nickname, hashedPassword, email, 0, 0, 0, "beginner", true, false, "C3", "G5", 0];

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


