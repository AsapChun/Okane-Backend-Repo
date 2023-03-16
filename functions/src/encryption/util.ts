import * as crypto from "crypto-js";

/*
    Financial Data Encryption
*/

export const encryptFinacialData = (data, FINANCIAL_DATA_KEY) => {
  const AESencrypted = crypto.AES.encrypt(JSON.stringify(data), FINANCIAL_DATA_KEY as string).toString();
  return AESencrypted;
};

export const decryptFinancialData = (data, FINANCIAL_DATA_KEY) => {
  const AESdecrypted = crypto.AES.decrypt(data, FINANCIAL_DATA_KEY as string).toString(crypto.enc.Utf8);
  return JSON.parse(AESdecrypted);
};

/*
    Transaction Data Encryption
*/

export const encryptTransactionData = (data, TRANSACTION_DATA_KEY) => {
  const AESencrypted = crypto.AES.encrypt(JSON.stringify(data), TRANSACTION_DATA_KEY as string).toString();
  return AESencrypted;
};

export const decryptTransactionData = (data, TRANSACTION_DATA_KEY) => {
  const AESdecrypted = crypto.AES.decrypt(data, TRANSACTION_DATA_KEY as string).toString(crypto.enc.Utf8);
  return JSON.parse(AESdecrypted);
};

/*
    Plaid Access Token Encryption
*/

export const encryptPlaidAccessToken = (accessToken : string, PLAID_ACCESS_TOKEN_KEY) => {
  const AESencrypted = crypto.AES.encrypt(accessToken, PLAID_ACCESS_TOKEN_KEY as string).toString();
  return AESencrypted;
};

export const decryptPlaidAccessToken = (encryptedAccessToken, PLAID_ACCESS_TOKEN_KEY) => {
  const AESdecrypted =
    crypto.AES.decrypt(encryptedAccessToken, PLAID_ACCESS_TOKEN_KEY as string).toString(crypto.enc.Utf8);
  return AESdecrypted;
};

