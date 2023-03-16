import * as functions from "firebase-functions";
import {plaidClient, plaidWebhookURL} from "../config/";
import {validateUserVerified} from "../common";
import {CountryCode, Products} from "plaid";

// *********************************************************************
// Callable Functions
// *********************************************************************
// Function Name:
//   createPlaidLinkToken
// Description:
//   This function creates a Plaid link token for the user
// Return Values:
//   Link Token data
export const createLinkToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "Function must be called while authenticated",
    );
  }
  try {
    const uid = context.auth.uid;
    validateUserVerified(uid);

    // Create a Plaid link token with the Auth and Transactions products
    const request = {
      user: {
        client_user_id: uid,
      },
      client_name: "Okane App",
      products: [Products.Transactions],
      language: "en",
      country_codes: [CountryCode.Us],
      webhook: plaidWebhookURL,
      redirect_uri: "https://okane-database.web.app/dashboard",
    };

    const linkTokenData = await plaidClient.linkTokenCreate(request)
        .then((response) => {
          console.log("response:", response);
          console.log("linkToken created succesfully!");
          return response.data;
        });

    return new Promise((resolve) => {
      resolve(linkTokenData);
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
