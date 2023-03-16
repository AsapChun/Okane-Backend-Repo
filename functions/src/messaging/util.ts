import {adminApp} from "../config/";
import {getFirestore} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";

export const sendMessage = async (
    uid: string,
    data: {[key: string]: string}) => {
  try {
    // Get Firestore service for adminSDK application
    const db = getFirestore(adminApp);

    // Get user's associated FCM Registration Token from Firestore
    const fcmToken = await db.collection("users")
        .doc(uid)
        .collection("FCMTokens")
        .get()
        .then((querySnapshot) => {
          let fcmToken = "";

          querySnapshot.forEach((docSnapshot) => {
            fcmToken = docSnapshot.id;
          });

          return fcmToken;
        });

    console.log("FCM Registration Token:", fcmToken);

    // Get Messaging service for adminSDK application
    const msg = getMessaging(adminApp);

    // Send message to client
    const message = {
      token: fcmToken,
      data: data,
    };

    const response = await msg.send(message)
        .then((response) => {
          return response;
        });
    console.log("Successfully sent message:", response);

    // Return true
    return new Promise((resolve) => {
      resolve(true);
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
