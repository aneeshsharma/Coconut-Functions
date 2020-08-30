const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

// data -> { groupId , transaction: { from, to amount } }
const addTransaction = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while authenticated."
        );
    }
    try {
        const doc = await db.doc(`group/${data.groupId}`).update({
            transactions: admin.firestore.FieldValue.arrayUnion(
                data.transaction
            ),
            users: admin.firestore.FieldValue.arrayUnion(
                data.transaction.spender
            ),
        });
        return doc;
    } catch (e) {
        throw new functions.https.HttpsError("internal", e.message);
    }
});
module.exports = addTransaction;
