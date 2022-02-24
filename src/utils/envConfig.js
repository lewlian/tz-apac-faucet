const envConfig = {
  FIREBASE_API_KEY: process.env.REACT_APP_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: process.env.REACT_APP_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.REACT_APP_STORAGE_BUCKET || '',
  FIREBASE_SENDER_ID: process.env.REACT_APP_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.REACT_APP_APP_ID || '',
  REDEEM: process.env.REACT_APP_REDEEM || '',
  VERIFY_TWEET: process.env.REACT_APP_VERIFY_TWEET || '',
  AUTHENTICATE: process.env.REACT_APP_AUTHENTICATE || '',
  FAUCET_ADDRESS: process.env.REACT_APP_FAUCET_ADDRESS || '',
};

export default envConfig;
