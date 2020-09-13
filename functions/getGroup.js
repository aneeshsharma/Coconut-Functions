const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const getGroup = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while authenticated."
        );
    }
    try {
        const doc = await db.doc(`group/${data.groupId}`).get();
        if (!doc.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Invalid group id"
            );
        } else {
            var groupData = doc.data();
            if (groupData.users && groupData.users.length > 0) {
                var usersExpanded = [];
                /* eslint-disable no-await-in-loop */
                for (var userId of groupData.users) {
                    const userData = (
                        await db.doc(`users/${userId}`).get()
                    ).data();
                    usersExpanded.push(userData);
                }
                /* eslint-enable no-await-in-loop */
                groupData.users = usersExpanded;
            }
            groupData.groupId = data.groupId;
            return groupData;
        }
    } catch (e) {
        throw new functions.https.HttpsError("internal", e.message);
    }
});
module.exports = getGroup;
