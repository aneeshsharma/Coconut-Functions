const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const login = require("./functions/login");
const getUser = require("./functions/getUser");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

module.exports = {
    login,
    getUser,
};