import * as functions from "firebase-functions";
import {getFinancialDataFirestore} from "./util";
import {validateUserVerified} from "../common";
import {error} from "firebase-functions/logger";

export const getTotalSpendings = functions.runWith({secrets: ["FINANCIAL_DATA_KEY"]}).https.onCall(
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
        console.log("Entered getTotalSpendings request with:", data);
        const uid = context.auth.uid;
        validateUserVerified(uid);

        const FINANCIAL_DATA_KEY = process.env.FINANCIAL_DATA_KEY;

        // First check firestore if document exists
        // Get Firestore service for adminSDK application
        const getFinancialData = await getFinancialDataFirestore(uid, FINANCIAL_DATA_KEY);

        if (getFinancialData.result) {
          return new Promise((resolve) => {
            resolve(getFinancialData.financialData);
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
