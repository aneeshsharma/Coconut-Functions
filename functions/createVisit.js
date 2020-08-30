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
    db.collection("visit").add({
      name: data.name,
      description: data.description,
      transactoins: [],
      users: data.users,
    });
  } catch (e) {
    res.send(e.message);
  }
});
module.exports = createVisit;
