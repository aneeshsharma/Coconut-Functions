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
    const groupDoc = await db.collection("group").add({
      name: data.name,
      description: data.description,
      transactoins: [],
      users: data.users.map((uid) => ({ uid, credit: 0 })),
    });
    // add group to all users
    const userDocUpdates = data.users.map((userId) => {
      return db.doc(`users/${userId}`).update({
        groups: admin.firestore.FieldValue.arrayUnion(groupDoc.id),
      });
    });
    await Promise.all(userDocUpdates);
    return groupDoc;
  } catch (e) {
    throw new functions.https.HttpsError("internal", e.message);
  }
});
module.exports = createVisit;
