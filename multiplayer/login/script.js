// Import Firebase & EmailJS
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import emailjs from "https://cdn.jsdelivr.net/npm/emailjs-com@3.2.0/dist/email.min.js";

// Firebase Config
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

// Initialize EmailJS
emailjs.init("VoiceFlow"); // User ID di EmailJS

// References to HTML elements
const forgotPassword = document.getElementById("forgotPassword");
const recoverySection = document.getElementById("recoverySection");
const recoveryForm = document.getElementById("recoveryForm");

// Toggle recovery form visibility
forgotPassword.addEventListener("click", () => {
  recoverySection.classList.toggle("hidden");
});

// Handle password recovery
recoveryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const recoveryEmail = document.getElementById("recoveryEmail").value;

  try {
    // Query Firestore to find the account by email
    const accountsRef = collection(db, "store/accounts"); // Percorso aggiornato per Firestore
    const q = query(accountsRef, where("email", "==", recoveryEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Error: Email not found in the database.");
      return;
    }

    let account;
    querySnapshot.forEach((doc) => {
      account = doc.data();
    });

    // Prepare email content
    const templateParams = {
      to_email: recoveryEmail,
      nickname: account.nickname,
      password: account.password
    };

    // Send email using EmailJS
    emailjs.send("service_590j2vg", "template_zswucyh", templateParams)
      .then(() => {
        alert("Success: An email has been sent with your account details.");
        console.log("Email sent successfully.");
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        alert("Error: Failed to send recovery email.");
      });

  } catch (error) {
    console.error("Database error:", error);
    alert("Error: There was an issue retrieving your account.");
  }
});

// Handle login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nickname = document.getElementById("nickname").value;
  const password = document.getElementById("password").value;

  try {
    // Query Firestore to find the user by nickname
    const accountsRef = collection(db, "store/accounts");
    const q = query(accountsRef, where("nickname", "==", nickname));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Error: Incorrect nickname or password.");
      return;
    }

    let account;
    querySnapshot.forEach((doc) => {
      account = doc.data();
    });

    // Hash the password before comparing
    const hashedPassword = CryptoJS.SHA256(password).toString();

    if (account.password === hashedPassword) {
      alert("✅ Login successful! Redirecting...");
      window.location.href = "/vocal_trainer/settings/setting5_recap.html"; // Redirect to recap page
    } else {
      alert("Error: Incorrect nickname or password.");
    }

  } catch (error) {
    console.error("Database error:", error);
    alert("Error: There was an issue retrieving your account.");
  }
});


