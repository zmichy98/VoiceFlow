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

  // VARIABLES
  //const experience = localStorage.getItem("selectedLevel");
  const experience = "Advanced"
  console.log("selected level: " + experience);
  let top10;

  // Recupera tutte le liste di punteggi
  async function showTop10() {
    const doc = await db.collection("store").doc("scores").get();
    
    if (!doc.exists) {
        console.log("Il documento 'scores' non esiste!");
        return;
    }

    const data = doc.data();
    const top10_b = data["top10_beginner"];
    const top10_i = data["top10_intermediate"];
    const top10_a = data["top10_advanced"];

    // Choose score list
    if (experience === "Beginner") {
        top10 = top10_b
    } else if (experience === "Intermediate") {
        top10 = top10_i
    } else if (experience === "Advanced") {
        top10 = top10_a
    } else {
        console.log("Error loading the level.")
    }

    const scoreList = document.getElementById("scoreList");
    scoreList.innerHTML = "";

    for (const [name, score] of Object.entries(top10)) {
        const li = document.createElement("li");
        li.textContent = `${score[0]}: ${score[1]}`;
        scoreList.appendChild(li);
    }
  }

  // Chiamare la funzione per recuperare e mostrare i dati
  await showTop10();
