import "./App.css";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { db } from "./firebase-config";
import { collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import { config } from "dotenv";
import BasicTable from "./components/MTable";
import MTextField from "./components/MTextField";
import toast, { Toaster } from "react-hot-toast";
import LoadingButton from "@mui/lab/LoadingButton";

config();

const axios = require("axios");
const Tezos = new TezosToolkit("https://granadanet.api.tez.ie");
const redeemEndpoint = process.env.REACT_APP_REDEEM;
const twitterEndpoint = process.env.REACT_APP_VERIFY_TWEET;
const faucetAddress = process.env.REACT_APP_FAUCET_ADDRESS;
const authenticateEndpoint = process.env.REACT_APP_AUTHENTICATE;

function App() {
  const [walletStatus, setWalletStatus] = useState("");
  const [faucetStatus, setFaucetStatus] = useState(
    "Fetching faucet balance..."
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [userAccount, setUserAccount] = useState(""); //current account being loaded
  const [walletData, setWalletData] = useState([]); //all wallet data
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [twitter, setTwitter] = useState("");
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const faucetCollectionRef = collection(db, "dev-faucet");
  const wallet = new BeaconWallet({ name: "TZ Apac Faucet" });
  Tezos.setWalletProvider(wallet);

  const verifyTweet = async () => {
    let username = twitter;
    try {
      const resp = await axios.get(twitterEndpoint + username);
      console.log(resp.data);
      return resp.data;
    } catch (err) {
      toast.error(err);
    }
  };
  // Connect Beacon Wallet
  async function Connect() {
    try {
      console.log("Requesting permissions...");
      const permissions = await wallet.client.requestPermissions();
      console.log("Got permissions:", permissions.address);
      setUserAccount(permissions.address.toString());
      setWalletStatus("Wallet connected:" + permissions.address);
      setIsLoggedIn(true);
    } catch (error) {
      console.log("Got error:", error);
      toast.error(error);
    }
  }
  // Disconnect Beacon Wallet
  async function Disconnect() {
    try {
      await wallet.clearActiveAccount();
      setIsLoggedIn(false);
      setWalletStatus("Connect your wallet to get started");
    } catch {
      console.log("No wallet connected");
    }
  }

  async function Redeem(address) {
    // First checks if the twitter username is filled
    console.log(walletAddresses);
    if (twitter.trim() === "") {
      toast.error("Please remember to input handle");
      return;
    } else if (walletAddresses.includes(userAccount)) {
      // Double checks if the wallet has already redeemed (they should not see the button anyway)
      toast.error("Wallet already redeemed");
      return;
    }
    console.log("verifying tweet...");
    const tweetVerified = await verifyTweet();
    if (!tweetVerified) {
      // Verifies latest tweet from user contains #Tezos
      toast.error("Please make sure your latest tweet include #tzapac");
      console.log("Tweet verification failed");
      setUploading(false);
      return;
    } else {
      console.log("Tweet verification successful");
      setUploading(true);
      let api = redeemEndpoint + address + "/" + twitter; // formulate redeemEndpoint for faucet redemption
      console.log("Launching API call from frontend");
      try {
        const result = await axios.get(api);
        console.log(result.status);
        if (result.data.error) {
          console.log(result.data.error);
          toast.error(result.data.error);
        } else {
          console.log(result.data);
          setRedeemed(true);
          toast.success(result.data);
        }
      } catch (err) {
        console.log(err.response.data);
        toast.error(err.response.data);
      }
      setUploading(false);
      getWallets();
    }
  }

  // Submits the secret code to the backend for authentication (endpoint/authenticate/:secret)
  async function tryAuthenticate() {
    setIsAuthenticating(true);
    const authenticateApi = authenticateEndpoint + secret;
    console.log("Starting authentication at: ", authenticateApi);
    try {
      const result = await axios.get(authenticateApi);
      console.log("authentication result: ", result.data);
      if (result) {
        setAuthenticated(true);
        toast.success("Successfully authenticated");
      } else {
        toast.error("Something went wrong with authenticating secret");
      }
      setIsAuthenticating(false);
    } catch (err) {
      console.log(err.response.data);
      toast.error(err.response.data);
      setIsAuthenticating(false);
    }
  }

  // Fetches all wallets from firestore database, wallet exists = claimed
  const getWallets = async () => {
    try {
      const data = await getDocs(faucetCollectionRef);
      let tempWalletData = [];
      tempWalletData = data.docs.map((doc) => ({ ...doc.data() }));
      const sortedWalletData = tempWalletData.sort(function (a, b) {
        return b.timestamp - a.timestamp;
      });
      setWalletData(sortedWalletData);
      setWalletAddresses(data.docs.map((doc) => doc.get("address")));
    } catch (err) {
      toast.error(err);
    }
  };

  // Fetches the faucet balance to be displayed on the website
  const getFaucetBalance = async () => {
    try {
      const balance = await Tezos.rpc.getBalance(faucetAddress);
      console.log("Faucet Balance: " + balance / 10 ** 6);
      setFaucetStatus("Faucet Balance: " + balance / 10 ** 6 + " tez");
    } catch (err) {
      toast.error(err);
    }
  };

  useEffect(() => {
    async function getActiveAccount() {
      let activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        setIsLoggedIn(true);
        setWalletStatus("Wallet connected: " + activeAccount.address);
        setUserAccount(activeAccount.address.toString());
      } else {
        setWalletStatus("Connect your wallet to get started");
        setUserAccount("");
      }
      return activeAccount;
    }
    getFaucetBalance();
    getWallets();
    getActiveAccount();
  }, []);

  // Handles twitter input changes
  const twitterChangeHandler = (twitterName) => {
    setTwitter(twitterName);
  };

  // Handles secret input changes
  const secretChangeHandler = (secret) => {
    setSecret(secret);
  };

  return (
    <div className="App">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Start of background image and animation */}
      <div className="landscape">
        <div className="mountain"></div>
        <div className="mountain mountain-2"></div>
        <div className="mountain mountain-3"></div>
        <div className="sun-container sun-container-1"></div>
        <div className="sun-container">
          <div className="sun"></div>
        </div>
        <div className="cloud"></div>
        <div className="cloud cloud-1"></div>
        <div className="sun-container sun-container-reflection">
          <div className="sun"></div>
        </div>
        <div className="light"></div>
        <div className="light light-1"></div>
        <div className="light light-2"></div>
        <div className="light light-3"></div>
        <div className="light light-4"></div>
        <div className="light light-5"></div>
        <div className="light light-6"></div>
        <div className="light light-7"></div>
        <div className="water"></div>
        <div className="splash"></div>
        <div className="splash delay-1"></div>
        <div className="splash delay-2"></div>
        <div className="splash splash-4 delay-2"></div>
        <div className="splash splash-4 delay-3"></div>
        <div className="splash splash-4 delay-4"></div>
        <div className="splash splash-stone delay-3"></div>
        <div className="splash splash-stone splash-4"></div>
        <div className="splash splash-stone splash-5"></div>
        <div className="lotus lotus-1"></div>
        <div className="lotus lotus-2"></div>
        <div className="lotus lotus-3"></div>
        <div className="front">
          <div className="stone"></div>
          <div className="grass"></div>
          <div className="grass grass-1"></div>
          <div className="grass grass-2"></div>
          <div className="reed"></div>
          <div className="reed reed-1"></div>
        </div>
      </div>
      {/* End of background animation */}
      <header className="App-header">
        <div className="App-header-flex">
          {/* Start of Logo and Slogan */}
          <img
            src="https://www.tzapac.com/static/logo-transparent-d9975a5b1a197a029cf7f577575959fe.png"
            className="App-logo"
            alt="logo"
          />
          <p>A faucet for Artists</p>
          <Box
            mb={1}
            sx={{
              backgroundColor: "transparent",
              border: "2px solid black",
            }}
          >
            {/* End of Logo and Slogan */}
            {/* Start of instructions */}
            <div className="App-instructions">
              <p align="left">
                1. Join our
                <a href="https://t.me/TezosAsianArtist" target="_blank">
                  &nbsp;telegram&nbsp;
                </a>
                to find out the secret code
                <br></br>
                2. Your latest tweet must contain #tzapac
                <br></br>
                3. Enter your twitter handle without @<br></br>
                3. Click on Redeem Faucet
                <br></br>
                4. Receive your tez in a few minutes
                <br></br>
                Note: Each wallet and twitter can only redeem once!
              </p>
            </div>
            {/* End of instructions */}
          </Box>
          <div>
            {!authenticated ? (
              <div className="Button-container">
                <MTextField
                  type="secret"
                  textFieldValue={secret}
                  handleChange={secretChangeHandler}
                ></MTextField>
                <div className="button">
                  {isAuthenticating ? (
                    <LoadingButton loading variant="outlined">
                      Loading
                    </LoadingButton>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => tryAuthenticate()}
                    >
                      authenticate
                    </Button>
                  )}
                </div>
              </div>
            ) : !isLoggedIn ? (
              <Button variant="contained" onClick={Connect}>
                Connect Wallet
              </Button>
            ) : redeemed || walletAddresses.includes(userAccount) ? (
              <div>
                <p> You have already redeemed</p>
                <div className="button">
                  <Button variant="contained" onClick={Disconnect}>
                    Disconnect Wallet
                  </Button>
                </div>
              </div>
            ) : (
              <div className="Button-container">
                <MTextField
                  type="twitter"
                  textFieldValue={twitter}
                  handleChange={twitterChangeHandler}
                ></MTextField>
                <div>
                  {isUploading ? (
                    <div className="lds-facebook">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  ) : (
                    <div className="button">
                      <Button
                        variant="contained"
                        onClick={() => Redeem(userAccount)}
                      >
                        Redeem Faucet
                      </Button>
                    </div>
                  )}
                </div>
                <div className="button">
                  <Button variant="contained" onClick={Disconnect}>
                    Disconnect Wallet
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Redemption table data + faucet statuses */}
          <BasicTable data={walletData} />
          <div className="App-status">
            <p>{faucetStatus}</p>
            <p>{walletStatus}</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
