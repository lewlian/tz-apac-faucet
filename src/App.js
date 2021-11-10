import "./App.css";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { db } from "./firebase-config";
import { collection, getDocs } from "firebase/firestore";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { config } from "dotenv";

config();

const axios = require("axios");
const Tezos = new TezosToolkit("https://granadanet.api.tez.ie");
const redeemEndpoint = process.env.REACT_APP_REDEEM;
const twitterEndpoint = process.env.REACT_APP_VERIFY_TWEET;
const faucetAddress = process.env.REACT_APP_FAUCET_ADDRESS;

function App() {
  const [walletStatus, setWalletStatus] = useState("");
  const [faucetStatus, setFaucetStatus] = useState(
    "Fetching faucet balance..."
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [userAccount, setUserAccount] = useState(""); //current account being loaded
  const [walletData, setWalletData] = useState([]); //all wallet data
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [twitter, setTwitter] = useState("");
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
      alert(err);
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
      alert("Please remember to input handle");
      return;
    } else if (walletAddresses.includes(userAccount)) {
      // Double checks if the wallet has already redeemed (they should not see the button anyway)
      alert("Wallet already redeemed");
      return;
    }
    console.log("verifying tweet...");
    const tweetVerified = await verifyTweet();
    if (!tweetVerified) {
      // Verifies latest tweet from user contains #Tezos
      alert("Please make sure your latest tweet include #Tezos");
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
          alert(result.data.error);
        } else {
          console.log(result.data);
          alert(result.data);
        }
      } catch (err) {
        console.log(err.response.data);
        alert(err.response.data);
      }
      setUploading(false);
      getWallets();
    }
  }
  // Format unixtime to Date for display on webpage
  function formatDate(unixtime) {
    var units = {
      year: 24 * 60 * 60 * 1000 * 365,
      month: (24 * 60 * 60 * 1000 * 365) / 12,
      day: 24 * 60 * 60 * 1000,
      hour: 60 * 60 * 1000,
      minute: 60 * 1000,
      second: 1000,
    };
    var rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    var d1 = new Date(unixtime * 1000);
    var getRelativeTime = (d1, d2 = new Date()) => {
      var elapsed = d1 - d2;

      // "Math.abs" accounts for both "past" & "future" scenarios
      for (var u in units)
        if (Math.abs(elapsed) > units[u] || u === "second")
          return rtf.format(Math.round(elapsed / units[u]), u);
    };
    return getRelativeTime(d1);
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
      alert(err);
    }
  };

  const getFaucetBalance = async () => {
    try {
      const balance = await Tezos.rpc.getBalance(faucetAddress);
      console.log("Faucet Balance: " + balance / 10 ** 6);
      setFaucetStatus("Faucet Balance: " + balance / 10 ** 6 + " tez");
    } catch (err) {
      alert(err);
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

  return (
    <div className="App">
      <header className="App-header">
        <img
          src="https://www.tzapac.com/static/logo-transparent-d9975a5b1a197a029cf7f577575959fe.png"
          className="App-logo"
          alt="logo"
        />
        <p>A faucet for Artists</p>
        <Box
          sx={{
            backgroundColor: "transparent",
            border: "2px dashed white",
            p: 2,
            m: 2,
          }}
        >
          <div className="App-instructions">
            <p align="left">
              1. Your latest tweet must contain #tezos
              <br></br>
              2. Enter your twitter handle without @<br></br>
              3. Click on Redeem Faucet
              <br></br>
              4. Receive your tez in a few minutes
              <br></br>
              Note: Each wallet and twitter can only redeem once!
            </p>
          </div>
        </Box>
        <div>
          {!isLoggedIn ? (
            <Button variant="contained" onClick={Connect}>
              Connect Wallet
            </Button>
          ) : walletAddresses.includes(userAccount) ? (
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
              <TextField
                label="Twitter Handle"
                variant="filled"
                onChange={(event) => {
                  setTwitter(event.target.value);
                }}
                style={{ backgroundColor: "white" }}
              />
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
        <div className="table-container">
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 800 }}
              size="small"
              aria-label="claim history"
            >
              <TableHead>
                <TableRow>
                  <TableCell>address</TableCell>
                  <TableCell align="right">twitter</TableCell>
                  <TableCell align="right">timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {walletData.map((wallet) => (
                  <TableRow
                    key={wallet.timestamp}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {wallet.address}
                    </TableCell>
                    <TableCell align="right">{wallet.twitter}</TableCell>
                    <TableCell align="right">
                      {formatDate(wallet.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className="App-status">
          <p>{faucetStatus}</p>
          <p>{walletStatus}</p>
        </div>
      </header>
    </div>
  );
}

export default App;
