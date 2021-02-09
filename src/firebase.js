import firebase from "firebase";

const firebaseConfig = {
    apiKey: "AIzaSyCcXWSGl6L22lzKBBW-9qUo4FRuqgA2-Oc",
    authDomain: "rechat-ish.firebaseapp.com",
    projectId: "rechat-ish",
    storageBucket: "rechat-ish.appspot.com",
    messagingSenderId: "541765889629",
    appId: "1:541765889629:web:eba60f574dc57b9e2aa7b4",
    measurementId: "G-6Z5XYLD21G"
  };
  
const firebaseInstance = firebase.initializeApp(firebaseConfig);
const db = firebaseInstance.firestore();
const auth = firebase.auth();
const analytics = firebase.analytics();
const timestamp = firebase.firestore.FieldValue.serverTimestamp();
const provider = new firebase.auth.GoogleAuthProvider();
const storage = firebase.storage();


export { auth, db, timestamp, analytics, provider, storage };
