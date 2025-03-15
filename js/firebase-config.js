// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC8adIdL1paiMuyzWeLJy1UqgqEvjBj1Sw",
    authDomain: "monopoly-game-d3f52.firebaseapp.com",
    projectId: "monopoly-game-d3f52",
    storageBucket: "monopoly-game-d3f52.firebasestorage.app",
    messagingSenderId: "740025492291",
    appId: "1:740025492291:web:e4241a5385ff854e4c05f6",
    databaseURL: "https://monopoly-game-d3f52-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
