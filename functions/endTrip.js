const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const endTrip = functions.https.onCall(async (data, context) => {
    const uid = data.uid;
    const group = data.groupId;
    const docRef = db.collection("group").doc(group);
    try {
        const groupData = await docRef.get();
        const transactions = groupData.transactions;
        const users = groupData.users;
        const creds = {};
        transactions.forEach((transaction) => {
            const spender = transaction.spender;
            const amount = transaction.amount;
            users.forEach((user) => {
                var c = creds[user];
                if (user === spender) {
                    c += amount;
                } else {
                    c -= amount / (users.length - 1);
                }
                creds[user] = c;
            });
        });

        var posQueue = [];
        var negQueue = [];
        for (var u in creds) {
            if (creds[u] >= 0) {
                posQueue.push({ uid: u, cred: creds[u] });
            } else {
                negQueue.push({ uid: u, cred: creds[u] });
            }
        }
        posQueue.sort((a, b) => {
            return a.cred - b.cred;
        });
        negQueue.sort((a, b) => {
            return b.cred - a.cred;
        });
        console.log(posQueue);
        console.log(negQueue);
    } catch (e) {
        throw new functions.https.HttpsError("internal", e.message);
    }
});

module.exports = endTrip;
