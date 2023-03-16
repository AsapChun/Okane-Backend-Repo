import {plaidClient} from "../config/";
import {parseAccountIds, getIncome} from "../plaid/util";

// ****************************************************************************
// Budget Utility Functions
// ****************************************************************************
export const calculateBudget = async (
    accessToken: string,
    startDate: string,
    endDate: string) => {
  const transactionsRequest = {
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
  };

  try {
    const transactionsData = await plaidClient
        .transactionsGet(transactionsRequest)
        .then((response) => response.data);
    let transactions = transactionsData.transactions;
    let accounts = transactionsData.accounts;
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
        },
      };
      const paginatedTransactionsData = await plaidClient
          .transactionsGet(paginatedTransactionsRequest)
          .then((response) => response.data);
      transactions = transactions.concat(
          paginatedTransactionsData.transactions,
      );
      accounts = accounts.concat(
          paginatedTransactionsData.accounts,
      );
    }

    console.log("final transactions.length:", transactions.length);

    // parse accounts
    const {creditAccountIds, checkingsAccountIds, savingsAccountIds} =
        parseAccountIds(accounts);

    const {totalIncome, differenceInMonths} = getIncome(
        transactions,
        creditAccountIds,
        checkingsAccountIds,
        savingsAccountIds,
    );

    console.log("totalIncome:", totalIncome);

    // Divide totalIncome by relevant amount of months
    const budget = ((totalIncome) / differenceInMonths) * 0.8;
    return budget;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
