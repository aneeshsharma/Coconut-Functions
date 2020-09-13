const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const getUser = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while authenticated."
        );
    }
    console.log(data.uid);
    const uid = data.uid;
    const docRef = db.collection("users").doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) {
        console.log("No user found");
        throw new functions.https.HttpsError(
            "not-found",
            "No user with given uid"
        );
    } else {
        var userData = doc.data();
        var groups = userData.groups;
        /* eslint-disable no-await-in-loop */
        if (groups && groups.length > 0) {
            var groupsExpanded = [];
            for (var groupId of groups) {
                const group = await db.doc(`group/${groupId}`).get();
                var groupData = group.data();
                if (groupData.users && groupData.users.length > 0) {
                    var usersExpanded = [];
                    for (var userId of groupData.users) {
                        const userData = (
                            await db.doc(`users/${userId}`).get()
                        ).data();
                        usersExpanded.push(userData);
                    }
                    groupData.users = usersExpanded;
                }
                groupsExpanded.push(groupData);
            }
            userData.groups = groupsExpanded;
        }
        /* eslint-enable no-await-in-loop */
        return userData;
    }
});

module.exports = getUser;
