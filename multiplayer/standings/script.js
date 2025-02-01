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


async function getTopScores() {
  const doc = await db.collection("store").doc("scores").get();

  if (!doc.exists) {
      console.log("Il documento 'scores' non esiste!");
      return;
  }

  const data = doc.data();
  const top10_b = data["top10_beginner"];
  const top10_i = data["top10_intermediate"];
  const top10_a = data["top10_advanced"];

  // Trova l'elemento <ol> nella pagina
  const beginnerList = document.getElementById("beginnerList");
  const interList = document.getElementById("intermediateList");
  const advancedList = document.getElementById("advancedList");

  // Svuota la lista prima di riempirla
  beginnerList.innerHTML = "";
  interList.innerHTML = "";
  advancedList.innerHTML = "";

  // Itera sulla mappa e crea gli <li>
  for (const [name, score] of Object.entries(top10_b)) {
      const li = document.createElement("li");
      li.textContent = `${score[0]}: ${score[1]}`;
      beginnerList.appendChild(li);
  }
  for (const [name, score] of Object.entries(top10_i)) {
      const li = document.createElement("li");
      li.textContent = `${score[0]}: ${score[1]}`;
      interList.appendChild(li);
  }
  for (const [name, score] of Object.entries(top10_a)) {
      const li = document.createElement("li");
      li.textContent = `${score[0].padEnd(2)}: ${score[1]}`;
      advancedList.appendChild(li);
  }
}

// Chiamare la funzione per recuperare e mostrare i dati
getTopScores();