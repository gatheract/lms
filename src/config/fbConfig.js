import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/functions'
import 'firebase/auth';
import 'firebase/analytics';
import 'firebase/storage';
import {config} from '../firebase-config';



// Initialize Firebase
firebase.initializeApp(config);
firebase.firestore();

const storage = firebase.storage();
const functions = firebase.functions();

export {
    storage,
    functions,
    firebase as default
}
