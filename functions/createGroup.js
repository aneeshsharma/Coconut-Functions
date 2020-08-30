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
    const doc = await db.collection("group").add({
      name: data.name,
      description: data.description,
      transactoins: [],
      users: data.users,
    });
    return doc;
  } catch (e) {
    throw new functions.https.HttpsError("internal", e.message);
  }
});
module.exports = createVisit;
