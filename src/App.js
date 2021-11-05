import "./App.css";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { db } from "./firebase-config";
import { collection, getDocs, addDoc } from "firebase/firestore";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const axios = require("axios");
const Tezos = new TezosToolkit("https://granadanet.api.tez.ie");
const wallet = new BeaconWallet({ name: "Beacon Docs Taquito" });
const endpoint = "http://127.0.0.1:2888/getmoney/";
let activeAccount, api;

Tezos.setWalletProvider(wallet);

function App() {
  const [status, setStatus] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [userAccount, setUserAccount] = useState(""); //current account being loaded
  const [walletData, setWalletData] = useState([]); //all wallet data
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [twitter, setTwitter] = useState("");
  const faucetCollectionRef = collection(db, "faucet");

  async function Connect() {
    try {
      console.log("Requesting permissions...");
      const permissions = await wallet.client.requestPermissions();
      console.log("Got permissions:", permissions.address);
      setUserAccount(permissions.address.toString());
      setStatus("Wallet connected:" + permissions.address);
      setIsLoggedIn(true);
    } catch (error) {
      console.log("Got error:", error);
    }
  }

  async function Disconnect() {
    try {
      await wallet.clearActiveAccount();
      setIsLoggedIn(false);
      setStatus("Connect your wallet to get started");
    } catch {
      console.log("No wallet connected");
    }
  }

  const formatDate = (unix_timestamp) => {
    let date = new Date(unix_timestamp * 1000).toString();
    // Hours part from the timestamp
    // let hours = date.getHours();
    // // Minutes part from the timestamp
    // let minutes = "0" + date.getMinutes();
    // // Seconds part from the timestamp
    // let seconds = "0" + date.getSeconds();

    // // Will display time in 10:30:23 format
    // let formattedTime =
    // 	hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);

    return date;
  };

  const addWallet = async () => {
    await addDoc(faucetCollectionRef, {
      address: userAccount,
      redeemed: true,
      timestamp: parseInt((new Date().getTime() / 1000).toFixed(0)),
      twitter: twitter,
    });
    getWallets();
  };

  async function Redeem(address) {
    if (walletAddresses.includes(userAccount)) {
      alert("Wallet already redeemed");
      setUploading(false);
      return;
    } else {
      setUploading(true);
      api = endpoint + address;
      console.log("making redeem api call...");
      try {
        const result = await axios.get(api);
        addWallet();
        alert(result.data);
      } catch (err) {
        alert(err);
        console.log(err);
      }
      setUploading(false);
    }
  }

  const getWallets = async () => {
    try {
      const data = await getDocs(faucetCollectionRef);
      setWalletData(data.docs.map((doc) => ({ ...doc.data() })));
      setWalletAddresses(data.docs.map((doc) => doc.get("address")));
    } catch (err) {
      alert(err);
    }
  };

  useEffect(() => {
    async function getActiveAccount() {
      activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        setIsLoggedIn(true);
        setStatus("Wallet connected: " + activeAccount.address);
        setUserAccount(activeAccount.address.toString());
      } else {
        setStatus("Connect your wallet to get started");
        setUserAccount("");
      }
      return activeAccount;
    }
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
        <p>Tezos Faucet for Artist</p>
        <div>
          {!isLoggedIn ? (
            <Button variant="contained" onClick={Connect}>
              Connect Wallet
            </Button>
          ) : (
            <div className="Button-container">
              <TextField
                id="outlined-basic"
                label="Socials"
                variant="outlined"
                color="secondary"
                onChange={(event) => {
                  setTwitter(event.target.value);
                }}
              />
              <div className="button">
                <Button variant="contained" onClick={() => Redeem(userAccount)}>
                  Redeem Faucet
                </Button>
              </div>
              <div className="button">
                <Button variant="contained" onClick={Disconnect}>
                  Disconnect Wallet
                </Button>
              </div>
            </div>
          )}
        </div>
        <div>
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
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
        <div>
          {isUploading ? (
            <div className="lds-facebook">
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : null}
        </div>
        <p>{status}</p>
      </header>
    </div>
  );
}

export default App;
