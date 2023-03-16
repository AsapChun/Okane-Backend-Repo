This repository is coded using Node.js through Typescript.

Firebase Functions can be found in the functions/src directory.
Various Firebase services are initialized in functions/src/config.

ENSURE NODE AND NPM ARE UP TO DATE:
- Use NVM (https://github.com/nvm-sh/nvm) to ensure correct node and npm are being used
- Run nvm use 16 

IMPORTANT STEPS:
1) Go to the functions directory and in the command line type:
  npm install -g firebase-tools

2) Initialize Firebase SDK (all in functions directory)
  a) Run firebase login on command line
  b) Run firebase init (DO NOT OVERWRITE ANY OF THE FILES)

3) To initialize the Firebase AdminSDK, please create a firebase_adminsdk.json
file in the functions/ directory containing the API keys for Firebase Admin.
This can be downloaded directly form the console.
The admin applciation is then initialized in functions/src/config/firebase.ts.

4)  Please create a config.ts file in functions/src/config/ that contains
the exported constants plaidClientId and plaidSecret in order to initialize the
plaidClient in functions/src/config/firebase.ts. config.ts should also contain
an firebaseAPIKey which can be taken from the console.

NOTE: All scripts referenced below can be found in functions directory

TO TEST LOCALLY:
1) In one terminal window, run 'sudo ./startEmulators.sh' to run the emulators
2) In another terminal window, run 'sudo ./runTests.sh' to run the testsuite

ALL THINGS FUNCTIONS MANAGEMENT AND DEPLOYMENT: 
Go Here --> https://firebase.google.com/docs/functions/manage-functions

TO DEPLOY NEW FUNCTIONS TO FIREBASE: (IDEALLY USE COMMANDS BELOW)
(DO NOT USE SUDO to run these commands)
1) Run './predeploy.sh' to compile and build the Typescript app
2) Run 'firebase deploy --only functions' to deploy to Firebase

TO DEPLOY SPECIFIC FUNCTION/S TO FIREBASE: 
(DO NOT USE SUDO to run these commands)
1) Run './predeploy.sh' to compile and build the Typescript app
2) Run 'firebase deploy --only functions:{FUNCTION_NAME},functions:{FUNCTION_NAME}' to deploy to Firebase

TO DELETE FUNCTIONS: 
Go here --> https://firebase.google.com/docs/functions/manage-functions#delete_functions

The functions/src directory is organized as follows:
  config - contains code to initialize various applications and services.
  middleware - contains middleware code for Firebase Functions.
    For example, middleware that processes 
  plaid - contains Firebase Functions for Plaid-related functionalities.
    ex: Plaid Token Exchange
  user - contains Firebase Functions for user-related functionalities
    ex: User Authentication/Budget
  testsuite - contains testing framework that uses jest.
  index.ts - Central file where all FirebaseFunctions gather to be exported.

The test suite exists in the functions/test directory. The test suite is
powered by Jest and takes advantage of Firebase local emulators to save
development time as well as to prevent from using production services
(save money and potential errors).

For more information about setting up Firebase, please refer to Google's
Firebase getting started documentation.
https://firebase.google.com/docs/functions/get-started
