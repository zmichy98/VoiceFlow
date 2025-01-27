// Importa i moduli di Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Configurazione Firebase (sostituisci con i tuoi dati)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inizializza Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funzione per generare una keyword unica
function generateKeyword() {
  return 'keyword-' + Math.random().toString(36).substring(2, 10);
}

// Variabili predefinite fornite dalla piattaforma
const predefinedLevel = 1; // Livello di difficoltà iniziale
const predefinedScore = 0; // Punteggio iniziale

// Gestione del modulo
document.getElementById('accountForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Recupera i valori dal modulo
  const nickname = document.getElementById('nickname').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;

  // Valida i dati
  if (!nickname || !password || !email) {
    alert('Compila tutti i campi!');
    return;
  }

  try {
    // Verifica se il nickname è già utilizzato
    const accountsRef = collection(db, 'accounts');
    const q = query(accountsRef, where('nickname', '==', nickname));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert('Questo nickname è già in uso. Scegline un altro.');
      return;
    }

    // Genera una keyword unica per l'account
    const keyword = generateKeyword();

    // Crea l'oggetto da salvare nel database
    const accountData = {
      nickname: nickname,
      password: password, // Nota: evita di salvare password in chiaro in un'app reale
      email: email,
      keyword: keyword,
      level: predefinedLevel,
      score: predefinedScore
    };

    // Salva i dati nel database Firestore
    await addDoc(collection(db, 'accounts'), accountData);

    alert('Account creato con successo!');
    document.getElementById('accountForm').reset();
  } catch (error) {
    console.error('Errore durante la creazione dell\'account:', error);
    alert('Si è verificato un errore. Riprova.');
  }
});

  