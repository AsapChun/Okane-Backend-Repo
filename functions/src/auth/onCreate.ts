import {adminApp} from "../config/";
import {getFirestore} from "firebase-admin/firestore";
import * as functions from "firebase-functions";

// *********************************************************************
// Triggers
// *********************************************************************
// Function Name:
//   newUser
// Description:
//   This function is triggered when a new user is added to
//   Firebase's Authentication service. The function adds a new document
//   under the "users" collection with the user's associated uid.
// Return Value:
//   A promise resolved with a success message
export const newUser = functions.auth
    .user()
    .onCreate(async (user) => {
      try {
        console.log("user id is:", user.uid);

        // Get Firestore service for adminSDK application
        const db = getFirestore(adminApp);

        // Write new user to Firestore
        const newUserData = {uid: user.uid};
        const writeTime = await db.collection("users")
            .doc(user.uid)
            .set(newUserData)
            .then((writeResult) => {
              const writeTime = writeResult.writeTime.toDate();
              return writeTime;
            });
        console.log("Document updated at", writeTime);

        // Return success message
        return new Promise((resolve) => {
          resolve("Successfully created new user document");
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
