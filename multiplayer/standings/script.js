const firebaseConfig = {
  apiKey: "AIzaSyB-BaTehljfDtni-HAPrYh6rKT9sJyTKaU",
  authDomain: "database-for-singing.firebaseapp.com",
  projectId: "database-for-singing",
  storageBucket: "database-for-singing.appspot.com",
  messagingSenderId: "397721112623",
  appId: "1:397721112623:web:c5ec8963358f8e014736da"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function getTopScores() {
  const doc = await db.collection("store").doc("scores").get();

  if (!doc.exists) {
    console.log("The document 'scores' does not exist!");
    return;
  }

  const data = doc.data();
  const top10_b = data["top10_beginner"];
  const top10_i = data["top10_intermediate"];
  const top10_a = data["top10_advanced"];

  // Table from dataset function
  function createTable(data, tableId) {
    const table = document.getElementById(tableId);
    table.innerHTML = ""; // Cleans the table

    // Adds the rows
    for (const [name, score] of Object.entries(data)) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${score[0]}</td><td>${score[1]}</td>`;
      table.appendChild(row);
    }
  }

  createTable(top10_b, "beginnerTable");
  createTable(top10_i, "intermediateTable");
  createTable(top10_a, "advancedTable");
}

// Calls the function
getTopScores();
