// Importa i moduli di Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query, where } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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

// Funzione per generare le classifiche
async function generateLeaderboard(level) {
  try {
    // Recupera gli account con il livello specifico
    const accountsRef = collection(db, 'accounts');
    const q = query(accountsRef, where('level', '==', level), orderBy('score', 'desc'));
    const querySnapshot = await getDocs(q);

    // Estrai i dati e prendi solo i primi 20
    const leaderboard = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      leaderboard.push({
        nickname: data.nickname,
        score: data.score
      });
    });

    return leaderboard.slice(0, 20); // Limita alla top 20
  } catch (error) {
    console.error(`Errore nel recupero della classifica per il livello ${level}:`, error);
    return [];
  }
}

// Funzione per visualizzare le classifiche
async function displayLeaderboards() {
  const beginnerLeaderboard = await generateLeaderboard(1); // Livello Beginner
  const intermediateLeaderboard = await generateLeaderboard(2); // Livello Intermediate
  const advancedLeaderboard = await generateLeaderboard(3); // Livello Advanced

  // Crea il contenuto HTML per ogni classifica
  renderLeaderboard('beginnerLeaderboard', beginnerLeaderboard, 'Beginner');
  renderLeaderboard('intermediateLeaderboard', intermediateLeaderboard, 'Intermediate');
  renderLeaderboard('advancedLeaderboard', advancedLeaderboard, 'Advanced');
}

// Funzione per creare la classifica HTML
function renderLeaderboard(containerId, leaderboard, title) {
  const container = document.getElementById(containerId);
  container.innerHTML = `<h3>${title} Leaderboard</h3>`;
  if (leaderboard.length === 0) {
    container.innerHTML += '<p>No data available</p>';
    return;
  }

  const list = document.createElement('ol'); // Lista ordinata
  leaderboard.forEach(player => {
    const listItem = document.createElement('li');
    listItem.textContent = `${player.nickname}: ${player.score}`;
    list.appendChild(listItem);
  });

  container.appendChild(list);
}

// Avvia il caricamento delle classifiche all'apertura della pagina
displayLeaderboards();
