const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const createVisit = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while authenticated."
        );
    }
    try {
        // create the group
        var creds = {};
        for (var user of data.users) {
            creds[user] = 0;
        }
        const groupDoc = await db.collection("group").add({
            name: data.name,
            description: data.description,
            transactions: [],
            users: data.users,
            credits: creds,
        });
        const groupId = groupDoc.id;
        console.log(groupId);
        // add group to all users
        const userDocUpdates = data.users.map((userId) => {
            return db.doc(`users/${userId}`).update({
                groups: admin.firestore.FieldValue.arrayUnion(groupDoc.id),
            });
        });
        await Promise.all(userDocUpdates);

        await db.doc(`group/${groupId}`).update({
            groupId: groupId,
        });
        return (await db.doc(`group/${groupId}`).get()).data();
    } catch (e) {
        throw new functions.https.HttpsError("internal", e.message);
    }
});
module.exports = createVisit;
