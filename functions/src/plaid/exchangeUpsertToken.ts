import * as functions from "firebase-functions";
import {adminApp, plaidClient} from "../config/";
import {getFirestore} from "firebase-admin/firestore";
import {sendMessage} from "../messaging/util";
import {validateUserVerified} from "../common";
import {encryptPlaidAccessToken} from "../encryption/util";

// Function Name:
//   exchangeUpsertToken
// Description:
//   The function exchanges the given Plaid public token for a Plaid access
//   token then upserts the access token to Firestore for the associated uid.
// Return Values:
//   Link Token data
export const exchangeUpsertToken = functions.runWith({secrets: ["PLAID_ACCESS_TOKEN_KEY"]})
    .https.onCall(async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "Function must be called while authenticated",
        );
      }
      if (!(typeof data.public_token === "string")) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Function must be called with public_token argument containing " +
            "the Plaid public_token",
        );
      }
      try {
        const uid = context.auth.uid;
        validateUserVerified(uid);

        const PLAID_ACCESS_TOKEN_KEY = process.env.PLAID_ACCESS_TOKEN_KEY;
        // Run token exchange to obtain Plaid accessToken
        const publicToken = data.public_token;
        const exchangeRequestBody = {
          "public_token": publicToken,
        };

        const {accessToken, itemId} = await plaidClient
            .itemPublicTokenExchange(exchangeRequestBody)
            .then((response) => {
              const accessToken = response.data.access_token;
              const itemId = response.data.item_id;
              return {
                accessToken,
                itemId,
              };
            });


        // Get Firestore service for adminSDK application
        const db = getFirestore(adminApp);

        // Upsert uid collection with Plaid accessToken
        const plaidUpdateBody = {
          plaidAccessToken: encryptPlaidAccessToken(`${accessToken}`, PLAID_ACCESS_TOKEN_KEY),
          plaidItemId: `${itemId}`,
        };

        // Writes encrypted plaid access token to firestore
        const writeTime = await db.collection("users")
            .doc(`${uid}`)
            .collection("plaidItems")
            .doc(`${itemId}`)
            .set(plaidUpdateBody)
            .then((writeResult) => {
              const writeTime = writeResult.writeTime.toDate();
              return writeTime;
            });
        console.log("Document updated at", writeTime);

        // Send success message to Extension client
        const msgData = {
          title: "Plaid linked",
        };

        const success = await sendMessage(uid, msgData)
            .then((success) => {
              return success;
            });

        if (success) {
          // Return success message
          return new Promise((resolve) => {
            resolve("Successfully updated user with plaidItemId and " +
                    "plaidAccessToken");
          });
        } else {
          throw new Error("Message failed to send");
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
