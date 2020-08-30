const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const login = functions.https.onCall(async (data, context) => {
    console.log(data);
    const uid = data.uid;
    const docRef = db.collection("users").doc(uid);
    const user = await docRef.get();
    if (user.exists) {
        console.log("User exists");
        return { message: "exists" };
    } else {
        try {
            await docRef.set({
                uid: uid,
                name: data.name,
                upiId: data.upiId,
                email: data.email,
            });
            return (await docRef.get()).data();
        } catch (e) {
            throw new functions.https.HttpsError("internal", e.message);
        }
    }
});

module.exports = login;
