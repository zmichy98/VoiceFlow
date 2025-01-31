// Import CryptoJS
import CryptoJS from "https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js";

// Initialize Firebase and Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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


/*
        //test **************************************************************
        // Riferimento al documento "account" dentro la collezione "store"
        const accountRef = db.collection("store").doc("accounts");

        // Funzione per salvare l'array in Firestore
        async function salvaArray() {
            try {
              // Controlla se il documento esiste
              const docSnap = await accountRef.get();
          
              if (docSnap.exists) {
                // Se il documento esiste, aggiorna solo il campo "ilmioarray"
                await accountRef.update({ ilmioarray: pattern });
                console.log("✅ Array aggiornato con successo!");
              } else {
                // Se il documento non esiste, crealo con il campo "ilmioarray"
                await accountRef.set({ ilmioarray: pattern });
                console.log("✅ Documento creato e array salvato con successo!");
              }
            } catch (error) {
              console.error("❌ Errore nel salvataggio:", error);
            }
          }
          

        // Chiama la funzione per salvare l'array
        salvaArray();
        //test **************************************************************
*/