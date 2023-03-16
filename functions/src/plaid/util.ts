import {adminApp, plaidClient} from "../config/";
import {getFirestore} from "firebase-admin/firestore";
import {Transaction} from "plaid";
import {decryptFinancialData, decryptPlaidAccessToken,
  decryptTransactionData, encryptFinacialData, encryptTransactionData} from "../encryption/util";

/*
  Name: getPlaidAccessToken
  Description: This function gets the given user's Plaid
  accessToken from Firestore.
 */
export const getPlaidAccessToken = async (uid: string, PLAID_ACCESS_TOKEN_KEY):Promise<string[]> => {
  try {
    // Get Firestore service for adminSDK application
    const db = getFirestore(adminApp);

    const accessTokenList = await db.collection("users")
        .doc(uid)
        .collection("plaidItems")
        .get()
        .then((querySnapshot) => {
          const accessTokenList : string[] = [];
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const decryptedPlaidAccessToken = decryptPlaidAccessToken(data.plaidAccessToken, PLAID_ACCESS_TOKEN_KEY);
            accessTokenList.push(decryptedPlaidAccessToken);
          });
          return accessTokenList;
        });
    return new Promise((resolve) => {
      resolve(accessTokenList);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/*
  Name: getPlaidAccessTokenAndItemId
  Description: This function gets the given user's Plaid
  accessToken and associated ItemId from Firestore.
*/
export interface accessTokenAndItemId {
  plaidAccessToken: string,
  plaidItemId: string,
}
export const getPlaidAccessTokenAndItemId = async (uid: string, PLAID_ACCESS_TOKEN_KEY):Promise<accessTokenAndItemId[]> => {
  try {
    // Get Firestore service for adminSDK application
    const db = getFirestore(adminApp);

    const accessTokenList = await db.collection("users")
        .doc(uid)
        .collection("plaidItems")
        .get()
        .then((querySnapshot) => {
          const accessTokenAndItemIdList : accessTokenAndItemId[] = [];
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const decryptedPlaidAccessToken = decryptPlaidAccessToken(data.plaidAccessToken, PLAID_ACCESS_TOKEN_KEY);
            const accessTokenAndItemId : accessTokenAndItemId = {
              plaidAccessToken: decryptedPlaidAccessToken,
              plaidItemId: data.plaidItemId,
            };
            accessTokenAndItemIdList.push(accessTokenAndItemId);
          });
          return accessTokenList;
        });
    return new Promise((resolve) => {
      resolve(accessTokenList);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Name: getUidFromPlaidItemId
 * Description: This function gets user's uid, given an plaidItemID
 * from Firestore.
 *
 * @param {string} plaidItemId
 * @return {Promise<string>}
 */
export const getIDFromPlaidItemId = async (plaidItemId):Promise<string> => {
  try {
    // Get Firestore service for adminSDK application
    const db = getFirestore(adminApp);

    const {uid} = await db
        .collectionGroup("plaidItems")
        .where("plaidItemId", "==", plaidItemId)
        .get()
        .then((querySnapshot) => {
          let uid = "";
          querySnapshot.forEach((docSnapshot) => {
            const userDoc = docSnapshot.ref.parent.parent;
            if (userDoc) {
              uid = userDoc.id;
            }
          });
          return {uid};
        });
    return new Promise((resolve) => {
      resolve(uid);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Name: getTransactionsFirestore
 * Description: This function gets the user's transactions
 *  from Firestore.
 *
 * @param {string} uid
 * @return {Promise<string>}
 */

interface transactionObject{
  result: boolean,
  transaction?: parsedTransactions,
}

export const getTransactionsFirestore = async (uid: string, TRANSACTION_DATA_KEY):Promise<transactionObject> => {
  try {
    // Get Firestore service for adminSDK application
    const db = getFirestore(adminApp);

    const transactionResult = await db.collection("users")
        .doc(uid)
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.exists) {
            const docData = querySnapshot.data();
            if (docData) {
              const transactionsData = docData.transactionsData;
              if (transactionsData) {
                const decryptedTransactionData : parsedTransactions = decryptTransactionData(transactionsData, TRANSACTION_DATA_KEY);
                return {
                  result: true,
                  transaction: decryptedTransactionData,
                };
              } else {
                return {
                  result: false,
                };
              }
            }
          }
          return {
            result: false,
          };
        });
    return new Promise((resolve) => {
      resolve(transactionResult);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Name: getTransactionsFirestore
 * Description: This function gets the user's transactions
 *  from Firestore.
 *
 * @param {string} uid
 * @return {Promise<string>}
 */

 interface transactionObject{
  result: boolean,
  transaction?: parsedTransactions,
}

export const writeTransactionsFirestore = async (uid: string, transactionsData: parsedTransactions, TRANSACTION_DATA_KEY) => {
  try {
    const transactionBody = {
      transactionsData: encryptTransactionData(transactionsData, TRANSACTION_DATA_KEY),
    };

    // Get Firestore service for adminSDK application
    const db = getFirestore(adminApp);
    const writeTime = await db.collection("users")
        .doc(`${uid}`)
        .update(transactionBody)
        .then((writeObject) => {
          const writeTime = writeObject.writeTime;
          return writeTime;
        });
    console.log("Document updated at " +`${writeTime.toDate()}`);
    return new Promise((resolve) => {
      resolve("Successfully stored Transactions Data");
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/*
 * Name: getFinancialDataFirestore
 * Description: This function gets the user's financial data
 *  from Firestore.
 */

interface financialData{
  result: boolean,
  financialData?: any,
}

export const getFinancialDataFirestore = async (uid: string, FINANCIAL_DATA_KEY):Promise<financialData> => {
  try {
    // Get Firestore service for adminSDK application
    const db = getFirestore(adminApp);
    const financialDataResult = await db.collection("users")
        .doc(uid)
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.exists) {
            const docData = querySnapshot.data();
            if (docData) {
              const financialData = docData.financialData;
              if (financialData) {
                const decryptedFinancialData = decryptFinancialData(financialData, FINANCIAL_DATA_KEY);
                return {
                  result: true,
                  financialData: decryptedFinancialData,
                };
              } else {
                return {
                  result: false,
                };
              }
            }
          }
          return {
            result: false,
          };
        });
    return new Promise((resolve) => {
      resolve(financialDataResult);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/*
 * Name: writeFinancialDataFirestore
 * Description: This function writes the user's transactions
 *  to Firestore.
 */
export const writeFinancialDataFirestore = async (uid: string, financialData, FINANCIAL_DATA_KEY) => {
  try {
    const financialDataBody = {
      financialData: encryptFinacialData(financialData, FINANCIAL_DATA_KEY),
    };
    // Get Firestore service for adminSDK application
    const db = getFirestore(adminApp);
    const writeTime = await db.collection("users")
        .doc(`${uid}`)
        .update(financialDataBody)
        .then((writeObject) => {
          const writeTime = writeObject.writeTime;
          return writeTime;
        });
    console.log("Document updated at " +`${writeTime.toDate()}`);
    return new Promise((resolve) => {
      resolve("Successfully stored Financial Data");
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Name: getBankAccountIds
 * Description: This function parses the accountIds for a given
 *   Plaid user.
 *
 * @param {Record<string, unknown>[]} accounts
 * @return {object[]}
 */
export const parseAccountIds = (accounts: Record<string, unknown>[]) => {
  const creditAccountIds = new Set();
  const checkingsAccountIds = new Set();
  const savingsAccountIds = new Set();

  for (const account of accounts) {
    switch (String(account.subtype)) {
      case "credit card": {
        creditAccountIds.add(account.account_id);
        break;
      }
      case "checking": {
        checkingsAccountIds.add(account.account_id);
        break;
      }
      case "savings": {
        savingsAccountIds.add(account.account_id);
        break;
      }
      default: {
        break;
      }
    }
  }
  console.log("credit:", creditAccountIds);
  console.log("checkings", checkingsAccountIds);
  console.log("savings", savingsAccountIds);
  return {
    creditAccountIds,
    checkingsAccountIds,
    savingsAccountIds,
  };
};

export const updateTransactionsFirestore = async (
    uid: string, newTransactions: parsedTransactions, TRANSACTION_DATA_KEY)
    : Promise<parsedTransactions> => {
  try {
    const getTransactionsResponse = await getTransactionsFirestore(uid, TRANSACTION_DATA_KEY);
    if (getTransactionsResponse.result) {
      const currentTransactions : parsedTransactions = getTransactionsResponse.transaction!;
      for (const category of spendingCategories) {
        if (newTransactions[category].length != 0) {
          const newTransactionsList : parsedTransaction[] = newTransactions[category];
          for (const parsedTransaction of newTransactionsList) {
            const primaryCategory = parsedTransaction.personalFinanceCategory.primary;
            const detailedCategroy = parsedTransaction.personalFinanceCategory.detailed;
            currentTransactions[primaryCategory].push(parsedTransaction);
            if (detailedCategroy === "GENERAL_MERCHANDISE_ONLINE_MARKETPLACES") {
              currentTransactions[detailedCategroy].push(parsedTransaction);
            }
          }
        }
      }
      const updateMesage = await writeTransactionsFirestore(uid, currentTransactions, TRANSACTION_DATA_KEY);
      console.log(updateMesage);

      return new Promise((resolve) => {
        resolve(currentTransactions);
      });
    } else {
      throw new Error("UNABLE TO UPDATE TRANSACTIONS IN FIRESTORE");
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// TODO: Convert category transaction arrays to hashMap at some point
// This makes me want to barf but story has been created to address this attrocity
export const deleteTransactionsFirestore = async (
    parsedTransactions: parsedTransactions, removeTransactionsList: string[])
    : Promise<parsedTransactions> => {
  for (const removeTransactionId of removeTransactionsList) {
    for (const category of spendingCategories) {
      const categoryTransactions : parsedTransaction[] = parsedTransactions[category];
      for (let i = 0; i < categoryTransactions.length; i++) {
        const transactionId = categoryTransactions[i].transactionId;
        if ( transactionId === removeTransactionId) {
          categoryTransactions.splice(i, 1);
          i--;
          break;
        }
      }
      parsedTransactions[category] = categoryTransactions;
    }
  }
  const allCategoriesList : parsedTransaction[] = parsedTransactions.ALL_TRANSACTIONS;
  for (let i = 0; i < allCategoriesList.length; i++) {
    const transactionId = allCategoriesList[i].transactionId;
    if (removeTransactionsList.includes(transactionId)) {
      allCategoriesList.splice(i, 1);
      i--;
    }
  }
  parsedTransactions.ALL_TRANSACTIONS = allCategoriesList;

  return new Promise((resolve) => {
    resolve(parsedTransactions);
  });
};

/**
 * Name: calculateTotalSpendings
 * Description: This function calculates the totalSpendings
 *   given an array of transactions.
 *
 * @param {Transaction[]} transactions
 * @param {Set<unknown>} creditAccountIds
 * @param {Set<unknown>} checkingsAccountIds
 * @param {Set<unknown>} savingsAccountIds
 * @return {number}
 */
export const calculateTotalSpendings = (
    transactions: Transaction[],
    creditAccountIds: Set<unknown>,
    checkingsAccountIds: Set<unknown>,
    savingsAccountIds: Set<unknown>,
) => {
  if (transactions.length === 0) {
    throw new Error("Error: transaction list cannot have length of 0");
  }
  let totalSpendings = 0;

  for (const transaction of transactions) {
    if ((checkingsAccountIds.has(transaction.account_id) ||
        savingsAccountIds.has(transaction.account_id))) {
      if (transaction.amount < 0) {
        totalSpendings += transaction.amount * -1;
      }
    } else if (creditAccountIds.has(transaction.account_id)) {
      // Credit card payments
      totalSpendings += transaction.amount;
    }
  }
  console.log("totalSpendings:", totalSpendings);
  return totalSpendings;
};

export const getTransactionsHelper = async (
    accessToken: string,
    startDate: string,
    endDate: string,
    parsedTransactionInput: parsedTransactions) => {
  const transactionsRequest = {
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
    options: {
      offset: 0,
      include_personal_finance_category: true,
    },
  };

  try {
    const transactionsData = await plaidClient
        .transactionsGet(transactionsRequest)
        .then((response) => response.data);
    let transactions = transactionsData.transactions;

    const totalTransactions = transactionsData.total_transactions;
    console.log("transactions.length:", transactions.length);
    console.log("totalTransactions:", totalTransactions);

    // get all transactions and accounts
    while (transactions.length < totalTransactions) {
      const paginatedTransactionsRequest = {
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          offset: transactions.length,
          include_personal_finance_category: true,
        },
      };
      const paginatedTransactionsData = await plaidClient
          .transactionsGet(paginatedTransactionsRequest)
          .then((response) => response.data);
      transactions = transactions.concat(
          paginatedTransactionsData.transactions,
      );
    }

    return parseTransactionsHelper(transactions, parsedTransactionInput);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getIncome = (
    transactions: Transaction[],
    creditAccountIds: Set<unknown>,
    checkingsAccountIds: Set<unknown>,
    savingsAccountIds: Set<unknown>,
) => {
  let totalIncome = 0;
  const incomeTransactions: Transaction[] = [];

  if (transactions.length === 0) {
    throw new Error("Error: transaction list cannot have length of 0");
  }

  for (const transaction of transactions) {
    if ((checkingsAccountIds.has(transaction.account_id) ||
        savingsAccountIds.has(transaction.account_id))) {
      if (transaction.amount > 0) {
        totalIncome += transaction.amount;
        incomeTransactions.push(transaction);
      }
    }
  }

  let differenceInMonths : number;
  if (incomeTransactions.length == 1) {
    differenceInMonths = 1;
  } else {
    const length = incomeTransactions.length;
    console.log("getIncome - oldestTransactionDate:",
        incomeTransactions[length - 1].date);
    console.log("getIncome - latestTransactionDate:",
        incomeTransactions[0].date);

    const oldestTransactionTime = new Date(incomeTransactions[length - 1].date)
        .getTime();
    const latestTransactionTime = new Date(incomeTransactions[0].date)
        .getTime();
    console.log("getIncome - oldestTransactionTime:", oldestTransactionTime);
    console.log("getIncome - latestTransactionTime:", latestTransactionTime);

    const timeDifference = latestTransactionTime - oldestTransactionTime;
    console.log("getIncome - timeDifference:", timeDifference);
    differenceInMonths = Math.floor(
        timeDifference/1000/60/60/24/30
    );
    console.log("getIncome - differenceInMonths:", differenceInMonths);
  }

  return {
    totalIncome,
    differenceInMonths,
  };
};

// set parsedTransaction interface
export interface parsedTransaction {
  transactionId: string,
  amount: number;
  date: string;
  category: string[] | null;
  categoryId: string | null;
  name: string;
  merchantName: string | null | undefined;
  paymentChannel: string;
  personalFinanceCategory: {
    primary: string,
    detailed: string
  }
}
export interface parsedTransactions {
  "ALL_TRANSACTIONS": parsedTransaction[],
  "INCOME": parsedTransaction[],
  "TRANSFER_IN": parsedTransaction[],
  "TRANSFER_OUT": parsedTransaction[],
  "LOAN_PAYMENTS": parsedTransaction[],
  "BANK_FEES": parsedTransaction[],
  "ENTERTAINMENT": parsedTransaction[],
  "FOOD_AND_DRINK": parsedTransaction[],
  "GENERAL_MERCHANDISE": parsedTransaction[],
  "GENERAL_MERCHANDISE_ONLINE_MARKETPLACES": parsedTransaction[],
  "HOME_IMPROVEMENT": parsedTransaction[],
  "MEDICAL": parsedTransaction[],
  "PERSONAL_CARE": parsedTransaction[],
  "GENERAL_SERVICES": parsedTransaction[],
  "GOVERNMENT_AND_NON_PROFIT": parsedTransaction[],
  "TRANSPORTATION": parsedTransaction[],
  "TRAVEL": parsedTransaction[],
  "RENT_AND_UTILITIES": parsedTransaction[],
}

const parseTransactionsHelper = async (
    transactions: Transaction[],
    parsedTransactionInput: parsedTransactions,
) => {
  //  https://okaneglobal.slack.com/archives/C02Q5FNRGH3/p1646002000611009
  for (const transaction of transactions) {
    const currParsedTransaction = {
      transactionId: transaction.transaction_id,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category,
      categoryId: transaction.category_id,
      name: transaction.name,
      merchantName: transaction.merchant_name,
      paymentChannel: transaction.payment_channel,
      personalFinanceCategory: transaction.personal_finance_category,
    };
    parsedTransactionInput.ALL_TRANSACTIONS.push(currParsedTransaction);
    const category = currParsedTransaction.personalFinanceCategory.primary;
    const detailed = currParsedTransaction.personalFinanceCategory.detailed;
    parsedTransactionInput[category].push(currParsedTransaction);
    if (detailed === "GENERAL_MERCHANDISE_ONLINE_MARKETPLACES") {
      parsedTransactionInput.GENERAL_MERCHANDISE_ONLINE_MARKETPLACES.push(currParsedTransaction);
    }
  }
  return parsedTransactionInput;
};

interface spendingInfo {
  totalSpending: number,
  thirtyDaySpend: number,
  currentMonthSpend: number,
  previousMonthSpend: number,
}

interface incomeData {
  "INCOME": {
    totalIncome: number,
    pastMonthIncome: number,
  },
}

interface spendingData {
  "TOTAL_CATEGORIES_SPENDING": {
    spendingInfo: spendingInfo,
  },
  "LOAN_PAYMENTS": {
    spendingInfo: spendingInfo,
  },
  "BANK_FEES": {
    spendingInfo: spendingInfo,
  },
  "ENTERTAINMENT": {
    spendingInfo: spendingInfo,
  },
  "FOOD_AND_DRINK": {
    spendingInfo: spendingInfo,
  },
  "GENERAL_MERCHANDISE": {
    spendingInfo: spendingInfo,
  },
  "GENERAL_MERCHANDISE_ONLINE_MARKETPLACES": {
    spendingInfo: spendingInfo,
  },
  "HOME_IMPROVEMENT": {
    spendingInfo: spendingInfo,
  },
  "MEDICAL": {
    spendingInfo: spendingInfo,
  },
  "PERSONAL_CARE": {
    spendingInfo: spendingInfo,
  },
  "GENERAL_SERVICES": {
    spendingInfo: spendingInfo,
  },
  "GOVERNMENT_AND_NON_PROFIT":{
    spendingInfo: spendingInfo,
  },
  "TRANSPORTATION": {
    spendingInfo: spendingInfo,
  },
  "TRAVEL": {
    spendingInfo: spendingInfo,
  },
  "RENT_AND_UTILITIES": {
    spendingInfo: spendingInfo,
  },
}

/*
  Get past thirty days ex: 2/5/2022 - 3-5/2022
*/

const calculatePastThirtyDayDate = () => {
  const today = new Date();
  const oneMonthBeforeToday = new Date();
  oneMonthBeforeToday.setMonth(oneMonthBeforeToday.getMonth()-1);
  const date = {
    today: today,
    oneMonthBeforeToday: oneMonthBeforeToday,
  };
  return date;
};

/*
  Get month date ex: 11/1/2022 - 11/30/2022
*/

export const calculateMonthDate = (monthOffset: number) => {
  const today = new Date();
  // Change Month by monthOffset
  today.setMonth(today.getMonth()-monthOffset);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth()+1, 0);
  const date = {
    firstDayOfMonth: firstDayOfMonth,
    lastDayOfMonth: lastDayOfMonth,
  };
  return date;
};

export const calculateYearDate = () => {
  const today = new Date();
  const oneYearBeforeToday = new Date();
  oneYearBeforeToday.setFullYear(oneYearBeforeToday.getFullYear()-1);
  const endDate = today.toISOString().slice(0, 10);
  const startDate = oneYearBeforeToday.toISOString().slice(0, 10);
  const dateObject = {
    start_date: startDate,
    end_date: endDate,
  };
  return dateObject;
};

export const pastDayDate = () => {
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDay()-1);
  const endDate = today.toISOString().slice(0, 10);
  const startDate = yesterday.toISOString().slice(0, 10);
  const dateObject = {
    start_date: startDate,
    end_date: endDate,
  };
  return dateObject;
};

export const spendingCategories = ["LOAN_PAYMENTS", "BANK_FEES", "ENTERTAINMENT", "FOOD_AND_DRINK", "GENERAL_MERCHANDISE",
  "GENERAL_MERCHANDISE_ONLINE_MARKETPLACES", "HOME_IMPROVEMENT", "MEDICAL", "PERSONAL_CARE", "GENERAL_SERVICES",
  "GOVERNMENT_AND_NON_PROFIT", "TRANSPORTATION", "TRAVEL", "RENT_AND_UTILITIES"];


const getSpendingData = async (transactionsData: parsedTransactions) => {
  let allCategoriesSpend = 0; // total spend
  let allCategoryThirtyDaySpend = 0; // 30 day spend
  let allCategoryCurrentMonthSpend = 0; // Current months spend
  let allCategoryPreviousMonthSpend = 0; // Prior Month Spend
  const spendingData = {} as spendingData;
  const pastThirtyDayDate = calculatePastThirtyDayDate();
  const currentMonthDate = calculateMonthDate(0);
  const priorMonth = calculateMonthDate(1);
  // Spending Data
  for (const category of spendingCategories) {
    if (!transactionsData[category]) {
      continue;
    } else {
      spendingData[category] = {
        spendingInfo: {
          totalSpending: 0,
          thirtyDaySpend: 0,
          currentMonthSpend: 0,
          previousMonthSpend: 0,
        },
      };
      const categoryTransactions: parsedTransaction[] = transactionsData[category];
      for (const transaction of categoryTransactions) {
        const transactionDate = new Date(transaction.date);
        // Past 30 day spend
        if (pastThirtyDayDate.today >= transactionDate && pastThirtyDayDate.oneMonthBeforeToday <= transactionDate) {
          spendingData[category].spendingInfo.thirtyDaySpend += transaction.amount;
          allCategoryThirtyDaySpend += transaction.amount;
        }
        // Current Month Spend ex: 3/1/2022 - 3/31/2022
        if (currentMonthDate.firstDayOfMonth <= transactionDate && currentMonthDate.lastDayOfMonth >= transactionDate) {
          spendingData[category].spendingInfo.currentMonthSpend += transaction.amount;
          allCategoryCurrentMonthSpend += transaction.amount;
        }

        // Previous Month Spend ex: 2/1/2022 - 2/28/2022
        if (priorMonth.firstDayOfMonth <= transactionDate && priorMonth.lastDayOfMonth >= transactionDate) {
          spendingData[category].spendingInfo.previousMonthSpend += transaction.amount;
          allCategoryPreviousMonthSpend += transaction.amount;
        }

        // Total Spending Past Year
        spendingData[category].spendingInfo.totalSpending += transaction.amount;
        allCategoriesSpend += transaction.amount;
      }
    }
  }
  spendingData.TOTAL_CATEGORIES_SPENDING = {
    spendingInfo: {
      totalSpending: allCategoriesSpend,
      thirtyDaySpend: allCategoryThirtyDaySpend,
      currentMonthSpend: allCategoryCurrentMonthSpend,
      previousMonthSpend: allCategoryPreviousMonthSpend,
    },
  };
  return spendingData;
};

const getIncomeData = async (transactionsData: parsedTransactions) => {
  // Income Data
  const incomeData = {} as incomeData;
  const priorMonth = calculateMonthDate(1);
  if (transactionsData["INCOME"]) {
    incomeData["INCOME"] = {
      totalIncome: 0,
      pastMonthIncome: 0,
    };
    const incomeTransactions: parsedTransaction[] = transactionsData["INCOME"];
    let totalIncome = 0;
    let pastMonthIncome = 0;
    for (const transaction of incomeTransactions) {
      const transactionDate = new Date(transaction.date);
      if (priorMonth.firstDayOfMonth <= transactionDate && priorMonth.lastDayOfMonth >= transactionDate) {
        pastMonthIncome += transaction.amount;
      }
      totalIncome += transaction.amount;
    }
    incomeData.INCOME.totalIncome = totalIncome;
    incomeData.INCOME.pastMonthIncome = pastMonthIncome;
  }
  return incomeData;
};

export const getIncomeAndSpendingData = async (transactionsData: parsedTransactions) => {
  const spendingData : spendingData = await getSpendingData(transactionsData);
  const incomeData : incomeData = await getIncomeData(transactionsData);

  new Promise((resolve) => {
    resolve({
      spendingData,
      incomeData,
    });
  });
};
