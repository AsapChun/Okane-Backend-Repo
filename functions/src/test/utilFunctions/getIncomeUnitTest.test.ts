import {getIncome} from "../../plaid/util";
import {
  Transaction,
  TransactionPaymentChannelEnum,
  Location,
  PaymentMeta,
} from "plaid";

describe("Get income unit testing", () => {
  let mockTransactionsList: Transaction[];
  let mockCreditAccountIds: Set<unknown>;
  let mockCheckingAccountIds: Set<unknown>;
  let mockSavingAccountIds: Set<unknown>;
  let mockLocation: Location;
  let mockPaymentMeta: PaymentMeta;
  let mockTransaction: Transaction;

  beforeEach(() =>{
    mockTransactionsList = [];
    mockCreditAccountIds = new Set<unknown>();
    mockCheckingAccountIds = new Set<unknown>();
    mockSavingAccountIds = new Set<unknown>();
    mockLocation = {
      address: null,
      city: null,
      region: null,
      postal_code: null,
      country: null,
      lat: null,
      lon: null,
      store_number: null,
    };

    mockPaymentMeta = {
      reference_number: null,
      ppd_id: null,
      payee: null,
      by_order_of: null,
      payer: null,
      payment_method: null,
      payment_processor: null,
      reason: null,
    };

    mockTransaction = {
      account_id: "52262626",
      account_owner: "yak",
      amount: 100,
      authorized_date: "12-12-2021",
      date: "12-12-2021",
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
  });

  test("return error for empty transactions input", async () => {
    expect(() => {
      getIncome(
          mockTransactionsList,
          mockCreditAccountIds,
          mockCheckingAccountIds,
          mockSavingAccountIds,
      );
    }).toThrow(Error);
  });

  test("single transaction in transaction list", async () => {
    mockTransactionsList.push(mockTransaction);
    mockCheckingAccountIds.add(mockTransaction.account_id);
    const {totalIncome, differenceInMonths} = getIncome(
        mockTransactionsList,
        mockCreditAccountIds,
        mockCheckingAccountIds,
        mockSavingAccountIds,
    );
    expect(totalIncome).toEqual(100);
    expect(differenceInMonths).toEqual(1);
  });

  test("get income from 3 month period", async () => {
    mockTransactionsList.push(mockTransaction);

    const mockTransaction3Months : Transaction = Object.create(mockTransaction);
    mockTransaction3Months.date = "9-12-2021";
    mockTransaction3Months.account_id = "69696969";
    mockTransactionsList.push(mockTransaction3Months);
    mockSavingAccountIds.add(mockTransaction3Months.account_id);
    mockCheckingAccountIds.add(mockTransaction.account_id);

    const {totalIncome, differenceInMonths} = getIncome(
        mockTransactionsList,
        mockCreditAccountIds,
        mockCheckingAccountIds,
        mockSavingAccountIds,
    );
    expect(totalIncome).toEqual(200);
    expect(differenceInMonths).toEqual(3);
  });

  test("get income from 6 month period", async () => {
    mockTransactionsList.push(mockTransaction);

    const mockTransaction6Months : Transaction = Object.create(mockTransaction);
    mockTransaction6Months.date = "6-12-2021";
    mockTransaction6Months.account_id = "69696969";
    mockTransactionsList.push(mockTransaction6Months);
    mockSavingAccountIds.add(mockTransaction6Months.account_id);
    mockCheckingAccountIds.add(mockTransaction.account_id);


    const {totalIncome, differenceInMonths} = getIncome(
        mockTransactionsList,
        mockCreditAccountIds,
        mockCheckingAccountIds,
        mockSavingAccountIds
    );
    expect(totalIncome).toEqual(200);
    expect(Math.round(differenceInMonths)).toEqual(6);
  });

  test("get income from 9 month period", async () => {
    mockTransactionsList.push(mockTransaction);

    const mockTransaction9Months : Transaction = Object.create(mockTransaction);
    mockTransaction9Months.date = "3-12-2021";
    mockTransaction9Months.account_id = "69696969";
    mockTransactionsList.push(mockTransaction9Months);
    mockSavingAccountIds.add(mockTransaction9Months.account_id);
    mockCheckingAccountIds.add(mockTransaction.account_id);


    const {totalIncome, differenceInMonths} = getIncome(
        mockTransactionsList,
        mockCreditAccountIds,
        mockCheckingAccountIds,
        mockSavingAccountIds,
    );
    expect(totalIncome).toEqual(200);
    expect(Math.round(differenceInMonths)).toEqual(9);
  });

  test("get income from 12 month period", async () => {
    mockTransactionsList.push(mockTransaction);

    const mockTransaction6Months : Transaction = Object.create(mockTransaction);
    mockTransaction6Months.date = "12-12-2020";
    mockTransaction6Months.account_id = "69696969";
    mockTransactionsList.push(mockTransaction6Months);
    mockSavingAccountIds.add(mockTransaction6Months.account_id);
    mockCheckingAccountIds.add(mockTransaction.account_id);

    const {totalIncome, differenceInMonths} = getIncome(
        mockTransactionsList,
        mockCreditAccountIds,
        mockCheckingAccountIds,
        mockSavingAccountIds,
    );
    expect(totalIncome).toEqual(200);
    expect(differenceInMonths).toEqual(12);
  });
});
