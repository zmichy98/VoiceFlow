// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import CryptoJS from "https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js";

// Firebase Config (Usiamo i tuoi dati)
const firebaseConfig = {
  apiKey: "AIzaSyB-BaTehljfDtni-HAPrYh6rKT9sJyTKaU",
  authDomain: "database-for-singing.firebaseapp.com",
  projectId: "database-for-singing",
  storageBucket: "database-for-singing.firebasestorage.app",
  messagingSenderId: "397721112623",
  appId: "1:397721112623:web:c5ec8963358f8e014736da"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to hash passwords before storing them
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

// Handle form submission for creating an account
document.getElementById('accountForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Retrieve input values
  const nickname = document.getElementById('nickname').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;

  // Validate input
  if (!nickname || !password || !email) {
    alert('Please fill in all fields!');
    return;
  }

  try {
    // Check if the nickname is already in use
    const accountsRef = collection(db, 'store/accounts'); // Percorso aggiornato
    const q = query(accountsRef, where('nickname', '==', nickname));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert('This nickname is already taken. Please choose another one.');
      return;
    }

    // Hash the password before storing it
    const hashedPassword = hashPassword(password);

    // Store account data in Firestore
    await addDoc(collection(db, 'store/accounts'), {
      nickname: nickname,
      password: hashedPassword, // Hashed password for security
      email: email,
      points_beg: 0,  // Punteggio iniziale Beginner
      points_int: 0,  // Punteggio iniziale Intermediate
      points_adv: 0,  // Punteggio iniziale Advanced
      level: "beginner", // Default level at signup
      range_predefined: true, // Assume default range is predefined
      manual: false, // Default to false (not manual)
      first_note: "C3", // Default lowest note
      last_note: "G5", // Default highest note
      time: 0 // Default training time (in minutes)
    });
    
    alert('Account successfully created!');
    window.location.href = "/multiplayer/login/login.html";
    document.getElementById('accountForm').reset();
  } catch (error) {
    console.error('Error while creating the account:', error);
    alert('An error occurred. Please try again.');
  }
});


