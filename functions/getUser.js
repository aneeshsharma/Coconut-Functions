const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const getUser = functions.https.onRequest(async (req, res) => {
    console.log(req.query.uid);
    const uid = req.query.uid;
    const docRef = db.collection("users").doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) {
        console.log("No user found");
        res.status(400).json({
            message: "Invalid ID",
        });
    } else {
        const user = doc.data();
        res.status(200).json({
            message: "Done",
            user: user,
        });
    }
});

module.exports = getUser;
