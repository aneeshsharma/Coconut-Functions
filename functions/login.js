const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const login = functions.https.onCall(async (data, context) => {
    console.log(req.body);
    const uid = data.uid;
    const docRef = db.collection("users").doc(uid);
    const user = await docRef.get();
    if (user.exists) {
        console.log("User exists");
        return user.data();
    } else {
        try {
            const doc = await db.collection("users").add({
                uid: uid,
                name: data.name,
                upiId: data.upiId,
                email: data.email,
            });
            return doc;
        } catch (e) {
            throw new functions.https.HttpsError("internal", e.message);
        }
    }
});

module.exports = login;
