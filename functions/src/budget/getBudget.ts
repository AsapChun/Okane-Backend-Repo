import {adminApp} from "../config";
import {getFirestore} from "firebase-admin/firestore";
import {validateUserVerified} from "../common";
import * as functions from "firebase-functions";

// Function Name:
//   getUserBudget
// Description:
//   This function gets the user's stored budget
// Return Value:
//   A promise resovled with the user's stored budget
export const getBudget = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "Function must be called while authenticated",
    );
  }
  try {
    console.log("Entered budget get request");
    const uid = context.auth.uid;
    validateUserVerified(uid);

    // Get Firestore service for adminSDK application
    const db = getFirestore(adminApp);

    // Get document reference for given uid
    return await db.collection("users").doc(uid)
        .get()
        .then((docSnapshot) => {
          if (docSnapshot.exists) {
            const data = docSnapshot.data();
            if (data) {
              console.log("Found document with data: ");
              // TODO: update this to return incomeData object
              const budget = data.budget;
              return new Promise((resolve) => {
                resolve(budget);
              });
            } else {
              throw new functions.https.HttpsError(
                  "not-found",
                  "Document is empty",
              );
            }
          } else {
            throw new functions.https.HttpsError(
                "not-found",
                "Document with given uid was not found",
            );
          }
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
