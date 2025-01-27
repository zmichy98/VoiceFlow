// Import Firebase (must be configured as in previous scripts)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  query,
  equalTo,
  orderByChild
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// References to HTML elements
const loginForm = document.getElementById("loginForm");
const recoverySection = document.getElementById("recoverySection");
const recoveryForm = document.getElementById("recoveryForm");
const errorMessage = document.getElementById("errorMessage");
const createAccountButton = document.getElementById("createAccountButton");

// Handle login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const nickname = document.getElementById("nickname").value;
  const password = document.getElementById("password").value;

  try {
    // Check the database
    const snapshot = await get(ref(db, "accounts"));
    const accounts = snapshot.val();

    // Find the matching account
    const account = Object.values(accounts).find(acc => acc.nickname === nickname);

    if (account && account.password === password) {
      alert("Login successful!");
      window.location.href = "home.html"; // Redirect to the home page
    } else {
      showErrorMessage("Incorrect nickname or password. Recover your account.");
      recoverySection.classList.remove("hidden");
    }
  } catch (error) {
    console.error(error);
    showErrorMessage("Error during login. Please try again later.");
  }
});

// Handle account recovery
recoveryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const recoveryEmail = document.getElementById("recoveryEmail").value;

  try {
    // Search for the email in the database
    const snapshot = await get(ref(db, "accounts"));
    const accounts = snapshot.val();

    const account = Object.values(accounts).find(acc => acc.email === recoveryEmail);

    if (account) {
      alert(`Account recovery successful! Nickname: ${account.nickname}`);
    } else {
      showErrorMessage("Email not found in the database.");
    }
  } catch (error) {
    console.error(error);
    showErrorMessage("Error during account recovery. Please try again later.");
  }
});

// Show an error message
function showErrorMessage(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

// Button to create a new account
createAccountButton.addEventListener("click", () => {
  window.location.href = "createAccount.html"; // Redirect to the account creation page
});
