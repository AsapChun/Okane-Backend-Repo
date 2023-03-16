import {adminApp} from "../config/";
import {getFirestore} from "firebase-admin/firestore";
import {validateUserVerified} from "../common";
import * as functions from "firebase-functions";

// Function Name:
//   updateUserBudget
// Description:
//   This function updates the user's stored budget with the given budget
// Return Value:
//   A promise resovled with the user's stored budget
export const updateBudget = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "Function must be called while authenticated",
    );
  }
  if (!(typeof data.budget === "number")) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Function must be called with budget argument containing " +
        "the desired user budget",
    );
  }
  try {
    console.log("Entered updateBudget request with:", data);
    const uid = context.auth.uid;
    validateUserVerified(uid);

    const budget = data.budget;
    console.log("budget:", budget);

    // Get Firestore service for adminSDK application
    const db = getFirestore(adminApp);

    // Update document with given budget
    const updateBody = {
      budget: budget,
    };

    return await db.collection("users").doc(uid)
        .update(updateBody)
        .then((writeObject) => {
          const writeTime = writeObject.writeTime;
          console.log("Document updated at " +
                      `${writeTime.toDate()}`);
          return "Successfully updated user with budget";
        });
  } catch (error) {
    console.log(error);
    throw new functions.https.HttpsError(
        "unknown",
        error.message,
        error,
    );
  }
});
