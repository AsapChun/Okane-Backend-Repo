import axios from "axios";
import {adminApp, projectId, firebaseAPIKey} from "./testconfig";
import {getAuth} from "firebase-admin/auth";

/**
 * Name: deleteCollection
 * Description: This function deletes the given collection and will
 *  be use to reset the emulator firestore state between tests.
 *
 * @return {boolean}
 */
export const clearCollection = async () => {
  const url = "http://localhost:8080/emulator/v1/projects/" +
              projectId +
              "/databases/(default)/documents";
  try {
    const httpstatus = await axios.delete(url)
        .then((response) => response.status);
    return httpstatus == 200;
  } catch (error) {
    return new Error(error);
  }
};

/**
 * Name: deleteUsers
 * Description: This function deletes all the authenticated users
 *  from the authentication emulator suite to reset the authentication
 *  state between tests.
 *
 * @return {boolean}
 */
export const clearUsers = async () => {
  const url = "http://localhost:9099/emulator/v1/projects/" +
              projectId +
              "/accounts";

  try {
    const httpstatus = await axios.delete(url)
        .then((response) => response.status);
    return httpstatus == 200;
  } catch (error) {
    return false;
  }
};

/**
 * Name: createIdToken
 * Description: This function deletes all the authenticated users
 *  from the authentication emulator suite to reset the authentication
 *  state between tests.
 *
 * @param {string} uid
 * @return {string}
 */
export const createIdToken = async (uid: string) => {
  try {
    const auth = getAuth(adminApp);
    // createCustomToken for given uid
    const customToken = await auth.createCustomToken(uid);

    // verify customToken to retrieve idToken
    const url = "http://localhost:9099/www.googleapis.com/identitytoolkit/v3/" +
                "relyingparty/verifyCustomToken?key=" +
                `${firebaseAPIKey}`;
    const body = {
      token: customToken,
      returnSecureToken: true,
    };

    const idToken = await axios.post(url, body)
        .then((response) => response.data.idToken);

    return idToken;
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
};
