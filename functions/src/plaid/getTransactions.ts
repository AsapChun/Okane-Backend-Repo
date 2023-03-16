import * as functions from "firebase-functions";
import {getTransactionsFirestore} from "./util";
import {validateUserVerified} from "../common";
import * as dotenv from "dotenv";
import {error} from "firebase-functions/logger";

dotenv.config();

// Function Name:
//   getTransactions
// Description:
//   getsAllTransactions for the given user within the defined start and
//   end dates.
// Input:
//   start_date (string)
//   end_date (string)
// Return Values:
//   A promise resolved with an array of pre-defined transactions objects.
export const getTransactions = functions.runWith({secrets: ["TRANSACTION_DATA_KEY"]}).https.onCall(
    async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "Function must be called while authentiated",
        );
      }
      if (!(typeof data.start_date === "string")) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Function must be called with argument start_date (string) " +
            "to get the date for which we want to start looking for " +
            "transactions.",
        );
      }
      if (!(typeof data.end_date === "string")) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Function must be called with argument end_date (string) " +
            "to get the date for which we want to stop looking for " +
            "transactions.",
        );
      }
      try {
        console.log("Entered getTransactions request with:", data);
        const uid = context.auth.uid;
        validateUserVerified(uid);

        const TRANSACTION_DATA_KEY = process.env.TRANSACTION_DATA_KEY;
        // First check firestore if document exists
        // Get Firestore service for adminSDK application
        const transactionQuery = await getTransactionsFirestore(uid, TRANSACTION_DATA_KEY);
        if (transactionQuery.result) {
          return new Promise((resolve) => {
            resolve({
              transaction: transactionQuery.transaction,
            });
          });
        } else {
          throw error;
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
