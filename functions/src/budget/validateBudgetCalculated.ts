import {adminApp} from "../config/";
import {getFirestore} from "firebase-admin/firestore";
import {validateUserVerified} from "../common";
import * as functions from "firebase-functions";

// Function Name:
//   validateBudgetCalculated
// Description:
//   This function checks if the budget has been calculated and upserted
//   into Firestore and return true or false accordingly.
// Return Value:
//   A promise resolving budgetCalculatged to true or false
export const validateBudgetCalculated = functions.https.onCall(async (
    data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "Function must be called while authenticated",
    );
  }
  try {
    console.log("Entered validateBudgetCalculated request");
    const uid = context.auth.uid;
    validateUserVerified(uid);

    // Get Firestore service for adminSDK application
    const db = getFirestore(adminApp);

    // Get document reference for given uid
    const budget = await db.collection("users")
        .doc(uid)
        .get()
        .then((docSnapshot) => {
          if (docSnapshot.exists) {
            const data = docSnapshot.data();
            console.log("Found document with data: " +
                        `${JSON.stringify(data)}`);
            let budget = -1;
            if (data) {
              budget = data.budget;
            }

            return budget;
          } else {
            throw new functions.https.HttpsError(
                "not-found",
                "Document with given uid was not found",
            );
          }
        });

    if (budget < 0) {
      console.log("no budget");
      return new Promise((resolve) => {
        resolve({budgetCalculated: false});
      });
    } else {
      console.log("budget found");
      return new Promise((resolve) => {
        resolve({budgetCalculated: true});
      });
    }
  } catch (error) {
    console.log(error);
    throw new functions.https.HttpsError(
        "unknown",
        error.message,
        error,
    );
  }
});
