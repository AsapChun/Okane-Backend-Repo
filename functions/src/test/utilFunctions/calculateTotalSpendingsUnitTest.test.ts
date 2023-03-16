import {calculateTotalSpendings} from "../../plaid/util";
import {Transaction} from "plaid";

describe("Calculate total spending unit testing", () => {
  test("return error for empty transactions", async () => {
    const mockTransactionsList: Transaction[] = [];
    const mockCreditAccountIds: Set<unknown> = new Set<unknown>();
    const mockCheckingAccountIds: Set<unknown> = new Set<unknown>();
    const mockSavingAccountIds: Set<unknown> = new Set<unknown>();

    expect(() => {
      calculateTotalSpendings(
          mockTransactionsList,
          mockCreditAccountIds,
          mockCheckingAccountIds,
          mockSavingAccountIds,
      );
    }).toThrow(Error);
  });
});
