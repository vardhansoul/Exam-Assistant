// Refactor to use Firebase v8 compatibility API to fix module import errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBpplF9FEG0sSgyGnLXA1wk7boJgNgO0Ng",
  authDomain: "clubofcompetition-49506.firebaseapp.com",
  projectId: "clubofcompetition-49506",
  storageBucket: "clubofcompetition-49506.appspot.com",
  messagingSenderId: "977913736368",
  appId: "1:977913736368:web:5a66e9d76fa25104369f75"
};

// Initialize Firebase only if it hasn't been initialized yet
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
