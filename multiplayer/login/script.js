
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

// Initialize EmailJS
//emailjs.init("VoiceFlow"); // User ID di EmailJS

// References to HTML elements
const forgotPassword = document.getElementById("forgotPassword");
const recoverySection = document.getElementById("recoverySection");
const recoveryForm = document.getElementById("recoveryForm");


// Funzione per salvare i dati localmente /////////////////////////////////
async function dataRedirectingAndSave(a) {

  let logged = false;

  if(a[5] === "n") {
    localStorage.setItem("loggedIn", true);
    localStorage.setItem("nick", a[0]);
    localStorage.setItem("pass", a[1]);
    logged = localStorage.getItem("loggedIn");
    console.log("Logged in status: " + logged);
    window.location.href = "/vocal_trainer/settings/setting1_level.html"; // Redirect to recap page
    return
  }
  if(a[6] === "n") {
    localStorage.setItem("loggedIn", true);
    localStorage.setItem("nick", a[0]);
    localStorage.setItem("pass", a[1]);
    logged = localStorage.getItem("loggedIn");
    console.log("Logged in status: " + logged);
    window.location.href = "/vocal_trainer/settings/setting2_time.html"; // Redirect to recap page
    return
  }
  if(a[7] === "n") {
    localStorage.setItem("loggedIn", true);
    localStorage.setItem("nick", a[0]);
    localStorage.setItem("pass", a[1]);
    logged = localStorage.getItem("loggedIn");
    console.log("Logged in status: " + logged);
    window.location.href = "/vocal_trainer/settings/setting3_vocrange.html"; // Redirect to recap page
    return
  }
  if(a[8] === "n") {
    localStorage.setItem("loggedIn", true);
    localStorage.setItem("nick", a[0]);
    localStorage.setItem("pass", a[1]);
    logged = localStorage.getItem("loggedIn");
    console.log("Logged in status: " + logged);
    window.location.href = "/vocal_trainer/settings/setting4_vocgear.html"; // Redirect to recap page
    return
  }

  localStorage.setItem("nick", a[0]);
  localStorage.setItem("pass", a[1]);
  localStorage.setItem("begPoint", a[2]);
  localStorage.setItem("intPoint", a[3]);
  localStorage.setItem("advPoint", a[4]);
  localStorage.setItem("selectedLevel", a[5]);
  localStorage.setItem("sliderValue", a[6]);
  localStorage.setItem("selectedRange", a[7]);
  localStorage.setItem("selectedGear", a[8]);
  localStorage.setItem("manual", a[9]);
  localStorage.setItem("firstNote", a[10]);
  localStorage.setItem("secondNote", a[11]);
  localStorage.setItem("laxVox", a[12]);
  localStorage.setItem("mask", a[13]);
  localStorage.setItem("loggedIn", true);
  logged = localStorage.getItem("loggedIn");
  console.log("Logged in status: " + logged);
  
  window.location.href = "/vocal_trainer/settings/setting5_recap.html"; // Redirect to recap page
}

// Handle login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nickname = document.getElementById("nickname").value;
  const password = document.getElementById("password").value;

  try {
    // Query Firestore to find the user by nickname
    const accountsRef = db.collection("store").doc("accounts");
    const docSnap = await accountsRef.get();
    
    if (!docSnap.exists) {
      alert("Error: No accounts found.");
      return;
    }
    
    const accountsData = docSnap.data(); // Otteniamo il contenuto del documento
    
    // Cerchiamo il nickname come chiave nell'oggetto
    if (!accountsData[nickname]) {
      alert("Error: Incorrect nickname or password.");
      return;
    }
    
    // Account trovato 🎉
    const account = accountsData[nickname];
    console.log("✅ Account trovato:", account);

    if (account[1] === password) {
      alert("✅ Login successful! Redirecting...");

      //CHIAMARE FUNZIONE PER SALVARE LOCALMENTE i VALORI
      await dataRedirectingAndSave(account);

    } else {
      alert("Error: Incorrect nickname or password.");
      return;
    }

  } catch (error) {
    console.error("Database error:", error);
    alert("Error: There was an issue retrieving your account.");
  }
});


//<script type="module" src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>