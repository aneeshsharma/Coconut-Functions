const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const endTrip = functions.https.onCall(async (data, context) => {
    const uid = data.uid;
    const group = data.groupId;
    const docRef = db.collection("group").doc(group);
    try {
        const groupData = await (await docRef.get()).data();
        const transactions = groupData.transactions;
        const users = groupData.users;
        const creds = {};
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
            return b.cred - a.cred;
        });
        negQueue.sort((a, b) => {
            return a.cred - b.cred;
        });

        var payments = [];
        var p = 0;
        var n = 0;
        while (p < posQueue.length && n < negQueue.length) {
            if (posQueue[p].cred >= -negQueue[n].cred) {
                posQueue[p].cred += negQueue[n].cred;
                const amount = -negQueue[n].cred;
                negQueue[n].cred = 0;
                payments.push({
                    from: negQueue[n].uid,
                    to: posQueue[p].uid,
                    amount,
                });
                n++;
                if (posQueue[p].cred <= 0.01) {
                    p++;
                }
            } else {
                negQueue[n].cred += posQueue[p].cred;
                const amount = posQueue[p].cred;
                posQueue[p].cred = 0;
                payments.push({
                    from: negQueue[n].uid,
                    to: posQueue[p].uid,
                    amount,
                });
                p++;
                if (negQueue[n].cred <= 0.01) {
                    n++;
                }
            }
        }
        console.log(payments);
        const doc = await db.collection("group").doc(group).update({
            payments: payments,
        });
        return { message: "Ended" };
    } catch (e) {
        throw new functions.https.HttpsError("internal", e.message);
    }
});

module.exports = endTrip;
