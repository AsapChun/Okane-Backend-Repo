import {decryptFinancialData,
  decryptPlaidAccessToken,
  decryptTransactionData, encryptFinacialData,
  encryptPlaidAccessToken, encryptTransactionData} from "../../encryption/util";

describe("Testing Encryption and Decryption", () => {
  test("test Financial and Transaction data should equal the decrpted Data", async () => {
    const data = {
      test1: "test1",
      test2: "test2",
      test3: "test1",
      test4: "test2",
      test5: "test1",
      test6: "test2",
      test7: "test1",
      test8: "test2",
      test9: "test1",
      test10: "test2",
      test11: "test1",
      test12: "test2",
      test13: "test1",
      test14: "test2",
      test15: "test1",
      test16: "test2",
      test17: {
        test: ["fasjdfajdsfas"],
        sncsa: ["fasdfsafsajdfkasfl", "fasdfjaowiefowemi"],
        dsaffsa: {
          dfasfasa: "fasdfadsfkadsklfjadslkjfiaowjofjoiasdoifiojwojeofijwaoijefoiweajoj",
        },
      },
    };
    const dummyFinancialKey = "JoeBidenTouchesKids";
    const dummyTransactionKey = "KamalaHarrisSucks";

    const encryptFinancialData = encryptFinacialData(data, dummyFinancialKey);
    const decryptFinancailData = decryptFinancialData(encryptFinancialData, dummyFinancialKey);
    const encrptedTransactionData = encryptTransactionData(data, dummyTransactionKey);
    console.log("encrptedTransactionData", encrptedTransactionData);
    const decryptedTransactionData = decryptTransactionData(encrptedTransactionData, dummyTransactionKey);
    console.log("accessTokenList", decryptedTransactionData);
    expect(decryptFinancailData).toEqual(data);
    expect(decryptedTransactionData).toEqual(data);
  });
  test("test Plaid Access Token encryption should equal the decrpted Data", async () => {
    const token = "139e2d53-788e-45a8-a384-a821231a1680";
    const dummyAccessTokenKey = "SoManyHobos";

    const encryptedPlaidAccessToken = encryptPlaidAccessToken(token, dummyAccessTokenKey);
    const decrptedPlaidAccessToken = decryptPlaidAccessToken(encryptedPlaidAccessToken, dummyAccessTokenKey);
    console.log("token", decrptedPlaidAccessToken);
    expect(decrptedPlaidAccessToken).toEqual(token);
  });
});
