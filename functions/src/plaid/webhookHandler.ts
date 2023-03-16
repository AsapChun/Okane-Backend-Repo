import * as functions from "firebase-functions";
import {calculateYearDate, deleteTransactionsFirestore, getIDFromPlaidItemId, getIncomeAndSpendingData,
  getPlaidAccessToken,
  getTransactionsFirestore,
  getTransactionsHelper,
  parsedTransactions,
  pastDayDate,
  updateTransactionsFirestore,
  writeFinancialDataFirestore,
  writeTransactionsFirestore} from "./util";

export const webhookHandler = functions.runWith({secrets: ["PLAID_ACCESS_TOKEN_KEY", "TRANSACTION_DATA_KEY", "FINANCIAL_DATA_KEY"]}).https.onRequest(
    async (req, res) => {
      const {
        webhook_type: webhookType,
        webhook_code: webhookCode,
        error: error,
        new_transactions: newTransactions,
        item_id: plaidItemId,
        removed_transactions: removeTransactions,
      } = req.body;

      /*
        TODO: Current set up just pulls for a year and does calculations.
        There is a lot of redundancy and optimization that can be done for
        each webhook handler. However, current implementation is the easies
        logic and gets the job done for now.
      */

      const PLAID_ACCESS_TOKEN_KEY = process.env.PLAID_ACCESS_TOKEN_KEY;
      const TRANSACTION_DATA_KEY = process.env.TRANSACTION_DATA_KEY;
      const FINANCIAL_DATA_KEY = process.env.FINANCIAL_DATA_KEY;

      try {
        if (error) {
          throw new Error(error);
        }
        // Get Firestore service for adminSDK application
        if (webhookType === "TRANSACTIONS") {
          switch (webhookCode) {
            case "INITIAL_UPDATE": {
              /*
                Once this webhook has been fired,
                transaction data for the MOST recent 30 days can be fetched for the Item.
              */
              console.log("Entered INITIAL_UPDATE webhook handling");
              console.log(newTransactions, "new transactions are loaded");

              // find associated id with plaidItemId
              const uid = await getIDFromPlaidItemId(plaidItemId);

              console.log("updating document for", uid);
              const yearDate = calculateYearDate();

              // get given user's Plaid accessToken from Firestore
              // should return a decrypted list of access Tokens
              const accessTokenList : string[] = await getPlaidAccessToken(uid, PLAID_ACCESS_TOKEN_KEY);

              const startDate = yearDate.start_date;
              const endDate = yearDate.end_date;

              let transactions : parsedTransactions = {
                ALL_TRANSACTIONS: [],
                INCOME: [],
                TRANSFER_IN: [],
                TRANSFER_OUT: [],
                LOAN_PAYMENTS: [],
                BANK_FEES: [],
                ENTERTAINMENT: [],
                FOOD_AND_DRINK: [],
                GENERAL_MERCHANDISE: [],
                GENERAL_MERCHANDISE_ONLINE_MARKETPLACES: [],
                HOME_IMPROVEMENT: [],
                MEDICAL: [],
                PERSONAL_CARE: [],
                GENERAL_SERVICES: [],
                GOVERNMENT_AND_NON_PROFIT: [],
                TRANSPORTATION: [],
                TRAVEL: [],
                RENT_AND_UTILITIES: [],
              };
              // Gets all transactions for all accesstokens in the past year
              for (const accessToken of accessTokenList) {
                transactions = await getTransactionsHelper(
                    accessToken,
                    startDate,
                    endDate,
                    transactions,
                );
              }

              const transactionDataMessage = await writeTransactionsFirestore(uid, transactions, TRANSACTION_DATA_KEY);
              console.log(transactionDataMessage);

              const financialData = await getIncomeAndSpendingData(transactions);

              const financialDataMessage = writeFinancialDataFirestore(uid, financialData, FINANCIAL_DATA_KEY);
              console.log(financialDataMessage);
              res.status(200).send("Successfully handled HISTORICAL_UPDATE");
              break;
            }
            case "HISTORICAL_UPDATE": {
              /*
                Once this webhook has been fired,
                transaction data BEYOND the most recent 30 days can be fetched for the Item
              */
              console.log("Entered HISTORICAL_UPDATE webhook handling");
              console.log(newTransactions, "new transactions are loaded");

              // find associated id with plaidItemId
              const uid = await getIDFromPlaidItemId(plaidItemId);

              console.log("updating document for", uid);
              const yearDate = calculateYearDate();

              // get given user's Plaid accessToken from Firestore
              // should return a decrypted list of access Tokens
              const accessTokenList : string[] = await getPlaidAccessToken(uid, PLAID_ACCESS_TOKEN_KEY);

              const startDate = yearDate.start_date;
              const endDate = yearDate.end_date;

              let transactions : parsedTransactions = {
                ALL_TRANSACTIONS: [],
                INCOME: [],
                TRANSFER_IN: [],
                TRANSFER_OUT: [],
                LOAN_PAYMENTS: [],
                BANK_FEES: [],
                ENTERTAINMENT: [],
                FOOD_AND_DRINK: [],
                GENERAL_MERCHANDISE: [],
                GENERAL_MERCHANDISE_ONLINE_MARKETPLACES: [],
                HOME_IMPROVEMENT: [],
                MEDICAL: [],
                PERSONAL_CARE: [],
                GENERAL_SERVICES: [],
                GOVERNMENT_AND_NON_PROFIT: [],
                TRANSPORTATION: [],
                TRAVEL: [],
                RENT_AND_UTILITIES: [],
              };
              // returns parsed transactions within the given date from Plaid
              for (const accessToken of accessTokenList) {
                transactions = await getTransactionsHelper(
                    accessToken,
                    startDate,
                    endDate,
                    transactions,
                );
              }

              // Gets all transactions for all accesstokens in the past year
              const transactionDataMessage = await writeTransactionsFirestore(uid, transactions, TRANSACTION_DATA_KEY);
              console.log(transactionDataMessage);

              const financialData = await getIncomeAndSpendingData(transactions);

              const financialDataMessage = writeFinancialDataFirestore(uid, financialData, FINANCIAL_DATA_KEY);
              console.log(financialDataMessage);
              res.status(200).send("Successfully handled HISTORICAL_UPDATE");
              break;
            }
            case "DEFAULT_UPDATE": {
              /*
                Fired when new transaction data is available for an Item. Plaid will typically check for new transaction data several times a day.
                Ex Message:
                {
                  "webhook_type": "TRANSACTIONS",
                  "webhook_code": "DEFAULT_UPDATE",
                  "item_id": "wz666MBjYWTp2PDzzggYhM6oWWmBb",
                  "error": null,
                  "new_transactions": 3
                }
              */
              console.log("Entered DEFAULT_UPDATE webhook handling");
              // find associated id with plaidItemId
              const uid = await getIDFromPlaidItemId(plaidItemId);
              console.log("updating document for", uid);

              // Past 24 Hours
              const pastDay = pastDayDate();

              const accessTokenList : string[] = [plaidItemId];

              const startDate = pastDay.start_date;
              const endDate = pastDay.end_date;

              // get past 24 hour transactions
              let transactions : parsedTransactions = {
                ALL_TRANSACTIONS: [],
                INCOME: [],
                TRANSFER_IN: [],
                TRANSFER_OUT: [],
                LOAN_PAYMENTS: [],
                BANK_FEES: [],
                ENTERTAINMENT: [],
                FOOD_AND_DRINK: [],
                GENERAL_MERCHANDISE: [],
                GENERAL_MERCHANDISE_ONLINE_MARKETPLACES: [],
                HOME_IMPROVEMENT: [],
                MEDICAL: [],
                PERSONAL_CARE: [],
                GENERAL_SERVICES: [],
                GOVERNMENT_AND_NON_PROFIT: [],
                TRANSPORTATION: [],
                TRAVEL: [],
                RENT_AND_UTILITIES: [],
              };
              // returns parsed transactions within the past 24 hours from Plaid
              for (const accessToken of accessTokenList) {
                transactions = await getTransactionsHelper(
                    accessToken,
                    startDate,
                    endDate,
                    transactions,
                );
              }

              // add new transactions to existing transactions object in firestore
              const updatedTransactions = await updateTransactionsFirestore(uid, transactions, TRANSACTION_DATA_KEY);

              // update financialData in firestore
              const financialData = await getIncomeAndSpendingData(updatedTransactions);

              const financialDataMessage = writeFinancialDataFirestore(uid, financialData, FINANCIAL_DATA_KEY);
              console.log(financialDataMessage);
              res.status(200).send("Successfully handled DEFAULT_UPDATE");
              break;
            }
            case "TRANSACTIONS_REMOVED": {
              /*
                Fired when transaction(s) for an Item are deleted.
                Ex:
                {
                  "webhook_type": "TRANSACTIONS",
                  "webhook_code": "TRANSACTIONS_REMOVED",
                  "item_id": "wz666MBjYWTp2PDzzggYhM6oWWmBb",
                  "removed_transactions": [
                    "yBVBEwrPyJs8GvR77N7QTxnGg6wG74H7dEDN6",
                    "kgygNvAVPzSX9KkddNdWHaVGRVex1MHm3k9no"
                  ],
                  "error": null
                }
              */
              console.log("Entered TRANSACTIONS_REMOVED webhook handling");
              // find associated id with plaidItemId
              const removeTransactionsList : string[] = removeTransactions;
              const uid = await getIDFromPlaidItemId(plaidItemId);

              // get current transactions stored in Firestore
              const transactions = await getTransactionsFirestore(uid, TRANSACTION_DATA_KEY);
              if (transactions.result) {
                /*
                  1) remove transactions from firestore
                  2) update Financial Data in firestore
                */
                let parsedTransactions : parsedTransactions = transactions.transaction!;
                // find and remove each transaction id
                parsedTransactions = await deleteTransactionsFirestore(parsedTransactions, removeTransactionsList);

                const transactionDataMessage = await writeTransactionsFirestore(uid, parsedTransactions, TRANSACTION_DATA_KEY);
                console.log(transactionDataMessage);

                const financialData = await getIncomeAndSpendingData(parsedTransactions);
                const financialDataMessage = await writeFinancialDataFirestore(uid, financialData, FINANCIAL_DATA_KEY);
                console.log(financialDataMessage);
                res.status(200).send("Successfully handled TRANSACTIONS_REMOVED");
                break;
              } else {
                throw new Error("Unable to find transactiosn for associated Uid");
              }
            }
            default: {
              throw new Error("Unhandled webhook received");
            }
          }
        }
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });
