import {adminApp} from "../config/";
import {getAuth} from "firebase-admin/auth";

/**
 * name: validateUserVerified
 * description: validate that user has verified their email
 *
 * @param {string} uid
 * @return {boolean}
 */
export const validateUserVerified = async (uid: string) => {
  try {
    const auth = getAuth(adminApp);
    const verified = await auth.getUser(uid).then((user) => {
      return user.emailVerified;
    });

    if (verified) {
      return verified;
    } else {
      throw new Error("User has not verified email");
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
