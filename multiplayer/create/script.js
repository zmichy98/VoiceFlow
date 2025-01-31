
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
  const userData = [nickname, password, 0, 0, 0, "beginner", true, false, "C3", "G5", 0];

  // Aggiorna Firestore con il nuovo array senza sovrascrivere
  await accountsRef.set({
    [userData[0]]: userData // Nome del campo "ilmioarray" con l'array
  });

  console.log("✅ Account aggiunto correttamente!");

  alert('✅ Account successfully created!');
  window.location.href = "/multiplayer/login/login.html"; // Redirect alla pagina di login
  document.getElementById('accountForm').reset();
} catch (error) {
  console.error('❌ Error while creating the account:', error);
  alert('An error occurred. Please try again.');
}

}

document.getElementById("submit").addEventListener("click", sendLoginToFirestore);





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