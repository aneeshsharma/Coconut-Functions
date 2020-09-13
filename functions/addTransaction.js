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
    const groupDoc = db.doc(`group/${data.groupId}`);
    try {
        await groupDoc.update({
            transactions: admin.firestore.FieldValue.arrayUnion(
                data.transaction
            ),
        });
        var groupData = (await groupDoc.get()).data();
        var users = groupData.users;
        var transactions = groupData.transactions;

        var creds = {};
        transactions.forEach((transaction) => {
            const spender = transaction.spender;
            const amount = transaction.amount;
            users.forEach((user) => {
                var c = creds[user] || 0;
                if (user === spender) {
                    c += Number(amount);
                } else {
                    c -= amount / (users.length - 1);
                }
                creds[user] = c;
            });
        });
        console.log(creds);

        await groupDoc.update({
            credits: creds,
        });

        return (await groupDoc.get()).data();
    } catch (e) {
        throw new functions.https.HttpsError("internal", e.message);
    }
});
module.exports = addTransaction;
