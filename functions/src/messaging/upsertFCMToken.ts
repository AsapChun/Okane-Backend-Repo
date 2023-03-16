import {adminApp} from "../config/";
import {getFirestore} from "firebase-admin/firestore";
import {validateUserVerified} from "../common";
import * as functions from "firebase-functions";

// Function Name:
//   upsertFCMToken
// Description:
//   This function stores a given user's FCMToken in their associated
//   uid document in Firestore.
// Return Value:
//   A promise resolved with a success message.
export const upsertFCMToken = functions.https.onCall(
    async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "Function must be called while authenticated",
        );
      }
      if (!(typeof data.fcm_token === "string")) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Function must be called with argument fcm_token " +
            "to register a device in Firebase Messaging.",
        );
      }
      try {
        const uid = context.auth.uid;
        validateUserVerified(uid);

        const fcmToken = data.fcm_token;

        // Get Firestore service for adminSDK application
        const db = getFirestore(adminApp);

        // Create the "FCMTokens" sub-collection for the associated uid
        // and an FCMToken document under that sub-collection.
        // The FCMToken document contains the FCMToken itself as well
        // as the timestamp it was created. The timestamp will be used
        // to refresh the FCMToken when necessary
        const timestamp = new Date();
        const fcmTokenBody = {
          fcmToken: fcmToken,
          timestamp: `${timestamp}`,
        };

        const writeTime = await db.collection("users")
            .doc(`${uid}`)
            .collection("FCMTokens")
            .doc(`${fcmToken}`)
            .set(fcmTokenBody)
            .then((writeObject) => {
              const writeTime = writeObject.writeTime;
              return writeTime;
            });
        console.log("Document updated at " +
                    `${writeTime.toDate()}`);

        // Return success message
        return new Promise((resolve) => {
          resolve("Successfully stored FCMToken");
        });
      } catch (error) {
        console.log(error);
        throw new functions.https.HttpsError(
            "unknown",
            error.message,
            error,
        );
      }
    }
);
