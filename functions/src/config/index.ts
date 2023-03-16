// Import necessary libraries
import * as config from "./config";
import {initializeApp} from "firebase-admin/app";
import {Configuration, PlaidApi, PlaidEnvironments} from "plaid";

// Initialize applications and database
export const adminApp = initializeApp();

// Initialize plaid configuration
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": config.plaidClientId,
      "PLAID-SECRET": config.plaidSecret}}});
export const plaidClient = new PlaidApi(plaidConfig);
export const plaidWebhookURL = "https://us-central1-okane-database.cloudfunctions.net/webhookHandler";
