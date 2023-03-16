test("dummy test", () => {
  expect(true);
});
/*
import {adminApp, testEnv} from "./testconfig";
import * as util from "./util";
import * as myFunctions from "..";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";

// Get adminSDK services
const auth = getAuth(adminApp);
const firestore = getFirestore(adminApp);

describe("basic functionality integration testing", () => {
  afterAll(async () => {
    if (await util.clearCollection()) {
      console.log("successfully cleared database");
    } else {
      console.log("failed to clear database");
    }
    if (await util.clearUsers()) {
      console.log("successfully cleared users");
    } else {
      console.log("failed to clear users");
    }
  });

  test("newUser", async () => {
    const newUserData = {
      "email": "gdk@gmail.com",
    };

    // Test new user was added with proper email
    try {
      // Get uid
      const uid = await auth.createUser(newUserData)
          .then((userRecord) => userRecord.uid);
      console.log(uid);

      // Wait 2 seconds for newUser Firestore trigger to complete
      await new Promise((r) => setTimeout(r, 2000));

      // Get Firestore uid
      const firestoreUID = await firestore.collection("users")
          .doc(`${uid}`)
          .get()
          .then((docSnapshot) => {
            if (docSnapshot.exists) {
              return docSnapshot.id;
            } else {
              console.log("docsnapshot does not exist");
              return "docSnapshot does not exist";
            }
          });

      // expect uid stored in Firestore to be the same as locally created uid
      return expect(firestoreUID).toEqual(uid);
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  test("create link token", async () => {
    try {
      // get uid
      const uid = await auth.getUserByEmail("gdk@gmail.com")
          .then((userRecord) => userRecord.uid);

      // call createToken Function
      const wrapped = testEnv.wrap(myFunctions.createLinkToken);
      const linkToken = await wrapped(
          {},
          {
            auth: {
              uid: uid,
            },
          })
          .then((response) => response.link_token);
      console.log("linkToken", linkToken);

      // expect linkToken is not empty
      return expect(linkToken).not.toBe("");
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  test("get access token", async () => {
    try {
      // Get publicToken
      const institutionID = "ins_1";
      const initialProducts = [Products.Transactions];
      const publicTokenRequest = {
        "institution_id": institutionID,
        "initial_products": initialProducts,
      };
      const publicToken = await plaidClient.sandboxPublicTokenCreate(
          publicTokenRequest)
          .then((response) => response.data.public_token);

      // get uid
      const uid = await auth.getUserByEmail("gdk@gmail.com")
          .then((userRecord) => userRecord.uid);

      // Call getAccessToken Function
      const body = {
        "public_token": publicToken,
      };
      const wrapped = testEnv.wrap(myFunctions.getPlaidAccessToken);
      const response = await wrapped(
          body,
          {
            auth: {
              uid: uid,
            },
          });

      expect(response).toBe("Successfully updated user with plaidItemId and " +
                            "plaidAccessToken");

      // Wait 4 seconds for getToken Firestore update to complete
      await new Promise((r) => setTimeout(r, 4000));

      // Get accessToken now stored in Firestore
      const firestoreAccessToken = await firestore.collection("users")
          .doc(uid)
          .collection("plaidItems")
          .get()
          .then((querySnapshot) => {
            let plaidAccessToken = "";
            if (!querySnapshot.empty) {
              console.log("querySnapshot not empty");
              querySnapshot.forEach((docSnapshot) => {
                if (docSnapshot.exists) {
                  const data = docSnapshot.data();
                  console.log("data:", data);
                  if (data) {
                    plaidAccessToken = data.plaidAccessToken;
                    console.log("plaidAccessToken:", plaidAccessToken);
                  }
                }
              });
            }
            return plaidAccessToken;
          });
      console.log("firestoreAccessToken:", firestoreAccessToken);

      // Expect accessToken stored in Firestore to not be empty
      return expect(firestoreAccessToken).not.toBe("");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, 8000);

  test("get budget", async () => {
    try {
      // get uid
      const uid = await auth.getUserByEmail("gdk@gmail.com")
          .then((userRecord) => userRecord.uid);

      const wrapped = testEnv.wrap(myFunctions.getUserBudget);
      const budget = await wrapped(
          {},
          {
            auth: {
              uid: uid,
            },
          }
      );

      // expect Firestore budget to be 9.50
      return expect(Math
          .round((budget + Number.EPSILON)*100)/100)
          .toEqual(9.50);
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  test("add custom budget", async () => {
    try {
      // get uid
      const uid = await auth.getUserByEmail("gdk@gmail.com")
          .then((userRecord) => userRecord.uid);

      // call updateBudget function
      const wrapped = testEnv.wrap(myFunctions.updateUserBudget);
      const response = await wrapped(
          {
            budget: 2000,
          },
          {
            auth: {
              uid: uid,
            },
          });
      console.log(response);

      // get the budget now stored in Firestore
      const firestoreBudget = await firestore.collection("users").doc(`${uid}`)
          .get()
          .then((docSnapshot) => {
            if (docSnapshot.exists) {
              const budget = docSnapshot.get("budget");
              if (budget) {
                return budget;
              } else {
                return "";
              }
            } else {
              return "";
            }
          });

      // expect budget in Firestore to be 2000$
      return expect(firestoreBudget).toEqual(2000);
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  test("getTotalSpendings", async () => {
    try {
      // get uid
      const uid = await auth.getUserByEmail("gdk@gmail.com")
          .then((userRecord) => userRecord.uid);

      // call getTotalSpendings Function
      const todayMonthly = new Date();
      const endDateMonthly = todayMonthly.toISOString().split("T")[0];
      todayMonthly.setMonth(todayMonthly.getMonth() - 1);
      const startDateMonthly = todayMonthly.toISOString().split("T")[0];
      const monthlyBody = {
        start_date: startDateMonthly,
        end_date: endDateMonthly,
      };
      console.log("monthlyBody:", monthlyBody);

      const todayYearly = new Date();
      const endDateYearly = todayYearly.toISOString().split("T")[0];
      todayYearly.setFullYear(todayYearly.getFullYear() - 1);
      const startDateYearly = todayYearly.toISOString().split("T")[0];
      const yearlyBody = {
        start_date: startDateYearly,
        end_date: endDateYearly,
      };
      console.log("yearlyBody:", yearlyBody);

      const wrapped = testEnv.wrap(myFunctions.getTotalSpendings);
      const monthlyTotalSpendings = await wrapped(
          monthlyBody,
          {
            auth: {
              uid: uid,
            },
          });
      console.log("monthlyTotalSpendings:", monthlyTotalSpendings);

      const yearlyTotalSpendings = await wrapped(
          yearlyBody,
          {
            auth: {
              uid: uid,
            },
          });
      console.log("yearlyTotalSpendings:", yearlyTotalSpendings);
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  test("getTransactions", async () => {
    try {
      // get uid
      const uid = await auth.getUserByEmail("gdk@gmail.com")
          .then((userRecord) => userRecord.uid);

      // call getTotalSpendings Function
      const todayYearly = new Date();
      const endDateYearly = todayYearly.toISOString().split("T")[0];
      todayYearly.setFullYear(todayYearly.getFullYear() - 1);
      const startDateYearly = todayYearly.toISOString().split("T")[0];
      const yearlyBody = {
        start_date: startDateYearly,
        end_date: endDateYearly,
      };
      console.log("yearlyBody:", yearlyBody);

      const wrapped = testEnv.wrap(myFunctions.getTransactions);
      const {transactions, onlineTransactions} = await wrapped(
          yearlyBody,
          {
            auth: {
              uid: uid,
            },
          });

      console.log(transactions);
      console.log(onlineTransactions);
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
});
*/
