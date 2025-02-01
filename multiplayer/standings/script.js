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
  console.log("Beginner top 10:", top10_b);
  
  const top10_i = data["top10_intermediate"];
  console.log("Intermediate top 10:", top10_i);
  
  const top10_a = data["top10_advanced"];
  console.log("Advanced top 10:", top10_a);
}

// Chiamare la funzione
await getTopScores();


/*

// Function to fetch and sort leaderboard data
async function fetchLeaderboard(level) {
  try {
    const accountsRef = collection(db, "accounts");
    const querySnapshot = await getDocs(accountsRef);

    const leaderboard = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.scores && data.scores[level] !== undefined) {
        leaderboard.push({
          nickname: data.nickname,
          score: data.scores[level]
        });
      }
    });

    // Sort leaderboard in descending order and get top 20
    leaderboard.sort((a, b) => b.score - a.score);
    return leaderboard.slice(0, 20);
  } catch (error) {
    console.error(`Error fetching leaderboard for ${level}:`, error);
    return [];
  }
}

// Function to display leaderboards
async function displayLeaderboards() {
  const beginnerLeaderboard = await fetchLeaderboard("beginner");
  const intermediateLeaderboard = await fetchLeaderboard("intermediate");
  const advancedLeaderboard = await fetchLeaderboard("advanced");

  renderLeaderboard("beginnerList", beginnerLeaderboard);
  renderLeaderboard("intermediateList", intermediateLeaderboard);
  renderLeaderboard("advancedList", advancedLeaderboard);
}

// Function to render leaderboard in HTML
function renderLeaderboard(containerId, leaderboard) {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // Clear previous data

  if (leaderboard.length === 0) {
    container.innerHTML = "<p>No data available</p>";
    return;
  }

  leaderboard.forEach((player, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `#${index + 1} ${player.nickname}: ${player.score}`;
    container.appendChild(listItem);
  });
}

// Load leaderboards on page load
displayLeaderboards();
*/