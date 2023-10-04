import firebase from 'firebase/app';

// Web app's Firebase configuration
const config = {
    apiKey: 'AIzaSyAK7CJuZ7jIXYdHZAzo5deLpU6-jrof1As',
    authDomain: 'subwaysurfers-84a83.firebaseapp.com',
    projectId: 'subwaysurfers-84a83',
    storageBucket: 'subwaysurfers-84a83.appspot.com',
    messagingSenderId: '957309311396',
    appId: '1:957309311396:web:94cc251253e5d7f1c04931',
    /**
     *  Optional on firebase JS SDK v7.20.0 and later
     */
    measurementId: 'G-JW84QXCLG9',
    databaseURL: 'https://subwaysurfers-84a83-default-rtdb.europe-west1.firebasedatabase.app/',
};

function initFireBase(): void
{
    firebase.initializeApp(config);
}

export { initFireBase };
