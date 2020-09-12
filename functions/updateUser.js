const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const updateUser = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while authenticated."
        );
    }
    console.log(data.uid);
    const uid = data.uid;
    try {
        const docRef = db.collection("users").doc(uid);
        const result = await docRef.update({ upiId: data.upiId });
        return data.upiId;
    } catch (err) {
        throw new functions.https.HttpsError("internal", err.message);
    }
});

module.exports = updateUser;
