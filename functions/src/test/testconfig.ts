import * as config from "../config/config";
import {Configuration, PlaidApi, PlaidEnvironments} from "plaid";
import * as functions from "firebase-functions-test";
import {initializeApp, applicationDefault} from "firebase-admin/app";

// Initializing adminSDK for auth and firestore applications
export const projectId = "okane-database";
export const firebaseAPIKey = config.firebaseAPIKey;
export const testEnv = functions();
export const adminApp = initializeApp({
  credential: applicationDefault()}, "TestSDK"
);

// Create Plaid client
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments["sandbox"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": config.plaidClientId,
      "PLAID-SECRET": config.plaidSecret,
    },
  },
});

export const plaidClient = new PlaidApi(plaidConfig);

// Firebase Functions HTTP Request URLs
export const httpURLs = {
  "budget": "http://localhost:5001/okane-database/us-central1/budget/",
  "plaidToken": "http://localhost:5001/okane-database/us-central1/plaidToken/",
  "plaidTransactions": "http://localhost:5001/okane-database/us-central1/plaidTransactions/",
};
