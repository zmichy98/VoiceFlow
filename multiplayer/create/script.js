const CryptoJS = await import("https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js");

// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyB-BaTehljfDtni-HAPrYh6rKT9sJyTKaU",
    authDomain: "database-for-singing.firebaseapp.com",
    projectId: "database-for-singing",
    storageBucket: "database-for-singing.firebasestorage.app",
    messagingSenderId: "397721112623",
    appId: "1:397721112623:web:c5ec8963358f8e014736da"
  };

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Funzione per hashare la password
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

async function sendLoginToFirestore() {
  // Recupera i valori inseriti nel form
  const nickname = document.getElementById('nickname').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;

  if (!nickname || !password || !email) {
    alert('Please fill in all fields!');
    return;
  }

  // Controlla se il nickname esiste già
  const accountsRef = db.collection("store").doc("accounts");

  // Hash della password
  const hashedPassword = hashPassword(password);

  // Creiamo l'array di dati dell'utente
  const userData = [nickname, hashedPassword, email, 0, 0, 0, "beginner", true, false, "C3", "G5", 0];

  // Aggiorna Firestore con il nuovo array senza sovrascrivere
  await accountsRef.set({
    nickname: userData // Nome del campo "ilmioarray" con l'array
  });

  console.log("✅ Account aggiunto correttamente!");

  alert('✅ Account successfully created!');
  window.location.href = "/multiplayer/login/login.html"; // Redirect alla pagina di login
  document.getElementById('accountForm').reset();
}

document.getElementById("accountForm").addEventListener("submit", sendLoginToFirestore);





//////////////////////////////////////////////////////////
// Array da inviare a Firestore
/*
const arrayToSend = ["elemento1", "elemento2", "elemento3", "elemento4"];

// Funzione per inviare l'array a Firestore
async function sendArrayToFirestore() {
  try {
      // Riferimento alla collezione e documento
      const docRef = db.collection("store").doc("accounts"); // Modifica il percorso se necessario

      // Usa setDoc per salvare l'array
      await docRef.set({
          ilmioarray: arrayToSend // Nome del campo "ilmioarray" con l'array
      });

      console.log("✅ Array inviato con successo!");
      alert("Array inviato con successo!");
  } catch (error) {
      console.error("❌ Errore nel salvataggio dell'array:", error);
      alert("Errore nel salvataggio dell'array.");
  }
}

// Aggiungi l'evento al pulsante per inviare l'array quando cliccato
document.getElementById("submit").addEventListener("click", sendArrayToFirestore);
*/