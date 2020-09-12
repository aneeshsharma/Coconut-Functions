const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const login = functions.https.onCall(async (data, context) => {
    console.log(data);
    const uid = data.uid;
    const docRef = db.collection("users").doc(uid);
    const user = await docRef.get();
    if (user.exists) {
        console.log("User exists");
        var userData = user.data();
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
                groupData.groupId = groupId;
                groupsExpanded.push(groupData);
            }
            userData.groups = groupsExpanded;
        }
        /* eslint-enable no-await-in-loop */
        return userData;
    } else {
        try {
            await docRef.set({
                uid: uid,
                name: data.name,
                upiId: data.upiId,
                email: data.email,
                profilePic: data.profilePic || "",
            });
            return (await docRef.get()).data();
        } catch (e) {
            throw new functions.https.HttpsError("internal", e.message);
        }
    }
});

module.exports = login;
