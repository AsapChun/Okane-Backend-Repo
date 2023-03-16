import {adminApp} from "../config/";
import {getFirestore} from "firebase-admin/firestore";
import {validateUserVerified} from "../common";
import * as functions from "firebase-functions";

// Function Name:
//   validatePlaidLinked
// Description:
//   This function checks if the accessToken has been upserted into Firestore
//   and returns true or false accordingly.
// Return Value:
//   A promise resolving plaidLinked to true or false.
export const validatePlaidLinked = functions.https.onCall(
    async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "Function must be called while authenticated",
        );
      }
      try {
        console.log("Entered validatePlaidLinked request");
        const uid = context.auth.uid;
        validateUserVerified(uid);

        // Get Firestore service for adminSDK application
        const db = getFirestore(adminApp);

        // Get document reference for given uid
        const accessToken = await db.collection("users")
            .doc(uid)
            .collection("plaidItems")
            .get()
            .then((querySnapshot) => {
              let accessToken = "";
              querySnapshot.forEach((docSnapshot) => {
                const data = docSnapshot.data();
                accessToken = data.plaidAccessToken;
              });

              return accessToken;
            });

        if (accessToken) {
          return new Promise((resolve) => {
            resolve({plaidLinked: true});
          });
        } else {
          return new Promise((resolve) => {
            resolve({plaidLinked: false});
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
