const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const joinGroup = functions.https.onCall(async (data, context) => {
    // if (!context.auth) {
    //     throw new functions.https.HttpsError(
    //         "failed-precondition",
    //         "The function must be called while authenticated."
    //     );
    // }
    try {
        const groupDoc = db.doc(`group/${data.groupId}`);
        await groupDoc.update({
            users: admin.firestore.FieldValue.arrayUnion(data.uid),
        });
        await db.doc(`users/${data.uid}`).update({
            groups: admin.firestore.FieldValue.arrayUnion(data.groupId),
        });
        var groupData = (await groupDoc.get()).data();
        if (groupData.users && groupData.users.length > 0) {
            var usersExpanded = [];
            /* eslint-disable no-await-in-loop */
            for (var userId of groupData.users) {
                const userData = (await db.doc(`users/${userId}`).get()).data();
                usersExpanded.push(userData);
            }
            /* eslint-enable no-await-in-loop */
            groupData.users = usersExpanded;
        }
        groupData.groupId = data.groupId;
        return groupData;
    } catch (e) {
        throw new functions.https.HttpsError("internal", e.message);
    }
});
module.exports = joinGroup;
