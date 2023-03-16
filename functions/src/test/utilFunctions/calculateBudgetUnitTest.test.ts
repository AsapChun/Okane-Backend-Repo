import {calculateTotalSpendings, getIncome} from "../../plaid/util";
import {
  PaymentMeta,
  Transaction,
  Location,
  TransactionPaymentChannelEnum,
} from "plaid";


describe("Calculate correct budget", () => {
  const mockTransactions : Transaction[] = [];
  const mockCreditAccountIds: Set<unknown> = new Set<unknown>();
  const mockCheckingAccountIds: Set<unknown> = new Set<unknown>();
  const mockSavingAccountIds: Set<unknown> = new Set<unknown>();
  let expectedSpending = 0;
  let expectedIncome = 0;

  /**
   * Name: genRand
   *
   * @param {number} min
   * @param {number} max
   * @param {number} decimalPlaces
   * @return {number}
   */
  function genRand(min, max, decimalPlaces) {
    const rand = Math.random() < 0.5 ?
      ((1-Math.random()) * (max-min) + min) :
      // could be min or max or anything in between
      (Math.random() * (max-min) + min);
    const power = Math.pow(10, decimalPlaces);
    return Math.floor(rand*power) / power;
  }

  /**
   * Name: genDateString
   *
   * @param {Date} mockDate
   * @return {string}
   */
  function genDateString(mockDate) {
    return ((mockDate.getMonth() > 8) ? (mockDate.getMonth() + 1) :
      ("0" + (mockDate.getMonth() + 1))) + "/" +
      ((mockDate.getDate() > 9) ? (mockDate.getDate()) :
      ("0" + mockDate.getDate())) +
      "/" + mockDate.getFullYear();
  }

  /**
   * Name: genAccountId
   *
   * @return {number}
   */
  function genAccountId() {
    return (Math.floor(100000 + Math.random() * 900000)).toString();
  }

  beforeAll(() => {
    // generate transaction list
    let mockDateString = "01/29/2022";

    for (let i = 0; i < 365; i++) {
      const previousDate = new Date(mockDateString);
      // seconds * minutes * hours * milliseconds = 1 day

      const mockDate = previousDate;
      mockDate.setDate(mockDate.getDate() - 1);
      mockDateString = genDateString(mockDate);
      for (let j = 0; j < 3; j++) {
        const mockLocation: Location = {
          address: null,
          city: null,
          region: null,
          postal_code: null,
          country: null,
          lat: null,
          lon: null,
          store_number: null,
        };
        const mockPaymentMeta: PaymentMeta = {
          reference_number: null,
          ppd_id: null,
          payee: null,
          by_order_of: null,
          payer: null,
          payment_method: null,
          payment_processor: null,
          reason: null,
        };

        const mockTransaction: Transaction = {
          account_id: genAccountId(),
          account_owner: "yak",
          amount: genRand(-1000, 1000, 2),
          authorized_date: mockDateString,
          date: mockDateString,
          pending_transaction_id: null,
          category_id: null,
          category: null,
          location: mockLocation,
          payment_meta: mockPaymentMeta,
          name: "",
          iso_currency_code: null,
          unofficial_currency_code: null,
          pending: false,
          transaction_id: "",
          payment_channel: TransactionPaymentChannelEnum.Online,
          authorized_datetime: null,
          datetime: null,
          transaction_code: null,
        };

        const transactionAmount = mockTransaction.amount;
        if (mockTransaction.amount < 0) {
          expectedSpending += transactionAmount;
        } else {
          expectedIncome += transactionAmount;
        }

        mockTransactions.push(mockTransaction);
        if ((j == (0 || 2))) {
          mockCheckingAccountIds.add(mockTransaction.account_id);
        } else {
          mockSavingAccountIds.add(mockTransaction.account_id);
        }
      }
    }
  });

  test("calculate budget with mocked transaction data", () => {
    // expected total spending
    expect(-1 * calculateTotalSpendings(
        mockTransactions,
        mockCreditAccountIds,
        mockCheckingAccountIds,
        mockSavingAccountIds)).toEqual(expectedSpending);

    // expected Income
    const {totalIncome, differenceInMonths} = getIncome(
        mockTransactions,
        mockCreditAccountIds,
        mockCheckingAccountIds,
        mockSavingAccountIds);
    expect(totalIncome).toEqual(expectedIncome);

    // expected Months
    expect(Math.round(differenceInMonths)).toEqual(12);

    // expected total budget
    expect(((totalIncome) / Math.round(differenceInMonths)) * 0.8)
        .toEqual(expectedIncome/12 * 0.8);

    // NOTE: remaining budget is calculated on the client side (Extension)
  });
});
