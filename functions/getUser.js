const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const getUser = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while authenticated."
        );
    }
    console.log(data.uid);
    const uid = data.uid;
    const docRef = db.collection("users").doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) {
        console.log("No user found");
        throw new functions.https.HttpsError(
            "not-found",
            "No user with given uid"
        );
    } else {
        const user = doc.data();
        return user;
    }
});

module.exports = getUser;
