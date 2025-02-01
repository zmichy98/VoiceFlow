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
const experience = localStorage.getItem("selectedLevel");
console.log("selected level: " + experience);
let top10;
let logged = localStorage.getItem("loggedIn");
console.log("Logged In: " + logged)

//let currScore = localStorage.getItem("currentScore"); /////////////////////////////////// CAMBIARE
let currScore = 25;

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

    // Funzione per creare una tabella da un dataset
    function createTable(data, tableId) {
        const scoreList = document.getElementById(tableId);
        scoreList.innerHTML = ""; // Pulisce la tabella prima di aggiungere nuovi dati

        // Aggiunge le righe con i dati
        for (const [name, score] of Object.entries(data)) {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${score[0]}</td><td>${score[1]}</td>`;
            scoreList.appendChild(row);
        }
    }

    createTable(top10, "scoreList");


}

async function updateYourScore() {

    if (logged) {
        try {
            let point_i = 14;

            if (experience === "Beginner") {
                point_i = 2;
            } else if (experience === "Intermediate") {
                point_i = 3;
            } else if (experience === "Advanced") {
                point_i = 4;
            } else {
                console.log("Error loading the level.")
            }

            const accountsRef = db.collection("store").doc("accounts")
            const doc = await accountsRef.get();

            if (!doc.exists) {
                console.log("Il documento 'accounts' non esiste!");
                return;
            }

            const data = doc.data();
            let account = data[localStorage.getItem("nick")];
            console.log("Account selezionato: " + account)
            console.log("Punteggio attuale: " + currScore)

            if (account[point_i] < currScore) {
                account[point_i] = currScore;

                // Aggiorna Firestore con il nuovo array senza sovrascrivere
                if (doc.exists) {
                    await accountsRef.update({
                        [account[0]]: account
                    });
                } else {
                    await accountsRef.set({
                        [account[0]]: account
                    });
                }

                console.log("✅ Punteggio aggiornato correttamente!");
                alert("Nuovo record personale!");
            }

        } catch (error) {
            console.error('❌ Error while updating the score:', error);
            alert('An error occurred. Please try again.');
        }
    }
}

async function showCurrentScore() {
    document.getElementById("punteggio").textContent = "You've done: " + currScore;
}

async function updateTop10() {
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

    let mioNome = "unknown";

    if (logged) {
        mioNome = localStorage.getItem("nick"); // Il tuo nome
    }

    let mioPunteggio = currScore; // Il tuo punteggio

    // Convertiamo l'oggetto in un array di valori
    let classificaArray = Object.values(top10);

    // Aggiungiamo il nostro punteggio alla classifica
    classificaArray.push([mioNome, mioPunteggio]);

    // Ordiniamo la classifica in base al punteggio (secondo elemento dell'array)
    classificaArray.sort((a, b) => b[1] - a[1]);

    // Prendiamo solo le prime 10 posizioni
    let top10Finale = classificaArray.slice(0, 10);

    // Stampiamo il risultato
    console.log("Classifica aggiornata (Top 10):");
    top10Finale.forEach(([nickname, punteggio], index) => {
        console.log(`${index + 1}. ${nickname} - ${punteggio}`);
    });

    let posizione = 0;
    // Riferimento al documento specifico
    let docRef = db.collection("store").doc("scores");

    let classifica = "top10_" + experience.toLowerCase();
    console.log("classifica da aggiornare: " + classifica)

    for (posizione; posizione < top10Finale.length; posizione++) {
        docRef.update({
            [`${classifica}.${posizione}`]: [top10Finale[posizione][0], top10Finale[posizione][1]]  // Usa la notazione con le parentesi quadre
        })
            .then(() => console.log("Posizione aggiornata correttamente!"))
            .catch(error => console.error("Errore durante l'aggiornamento:", error));
    }
    







}

    // Chiamare la funzione per recuperare e mostrare i dati
    document.addEventListener("DOMContentLoaded", async function () {
        await showCurrentScore();
        await updateTop10();
        await showTop10();
        await updateYourScore();
    });