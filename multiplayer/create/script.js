// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Access Firestore
const db = firebase.firestore();

import CryptoJS from "https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js";

// Funzione per hashare la password
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

// Gestione del form
document.getElementById('accountForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nickname = document.getElementById('nickname').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;

  if (!nickname || !password || !email) {
    alert('Please fill in all fields!');
    return;
  }

  try {
    // Controlla se il nickname è già in uso
    const accountsRef = db.collection("store").doc("accounts");
    const snapshot = await accountsRef.get();

    if (snapshot.exists) {
      const data = snapshot.data();
      if (data.nickname === nickname) {
        alert('This nickname is already taken. Please choose another one.');
        return;
      }
    }

    // Hashtag password
    const hashedPassword = hashPassword(password);

    // Crea il documento con i dati dell'account
    await accountsRef.set({
      nickname,
      password: hashedPassword,
      email,
      points_beg: 0,
      points_int: 0,
      points_adv: 0,
      level: "beginner",
      range_predefined: true,
      manual: false,
      first_note: "C3",
      last_note: "G5",
      time: 0
    });

    // Array da salvare
    const pattern = ["valore1", "valore2", "valore3"]; // Sostituiscilo con il tuo array

    // Funzione per salvare l'array in Firestore
    async function salvaArray() {
      try {
        const docSnap = await accountsRef.get();
    
        if (docSnap.exists) {
          await accountsRef.update({ ilmioarray: pattern });
          console.log("✅ Array aggiornato con successo!");
        } else {
          await accountsRef.set({ ilmioarray: pattern }, { merge: true });
          console.log("✅ Documento creato e array salvato con successo!");
        }
      } catch (error) {
        console.error("❌ Errore nel salvataggio:", error);
      }
    }

    await salvaArray();

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