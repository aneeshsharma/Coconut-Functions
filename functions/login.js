const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const login = functions.https.onRequest(async (req, res) => {
    console.log(req.body);
    const uid = req.body.uid;
    const docRef = db.collection("users").doc(uid);
    const user = await docRef.get();
    if (user.exists) {
        console.log("User exists");
        res.status(202).json({
            message: "Exists",
            user: user.data(),
        });
    } else {
        await docRef.set(req.body);
        res.status(200).json({
            message: "Done",
            user: docRef,
        });
    }
});

module.exports = login;
