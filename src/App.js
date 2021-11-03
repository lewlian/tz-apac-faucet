import "./App.css";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { useEffect, useState } from "react";
const axios = require("axios");
const Tezos = new TezosToolkit("https://granadanet.api.tez.ie");
const wallet = new BeaconWallet({ name: "Beacon Docs Taquito" });
const endpoint = "http://127.0.0.1:2888/getmoney/";
let activeAccount, api;

Tezos.setWalletProvider(wallet);

function App() {
	const [status, setStatus] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isFetching, setFetching] = useState(false);
	const [userAccount, setUserAccount] = useState("");

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

	async function Redeem(address) {
		setFetching(true);
		api = endpoint + address;
		console.log("making redeem api call...");
		try {
			const result = await axios.get(api);
			console.log(result.data);
		} catch (err) {
			console.log(err);
		}
		setFetching(false);
	}

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
						<button onClick={Connect}> Connect Wallet </button>
					) : (
						<div>
							<button onClick={Disconnect}> Disconnect Wallet </button>
							<button onClick={() => Redeem(userAccount)}>Redeem Faucet</button>
						</div>
					)}
				</div>
				<div>{isFetching ? <p> Redeeming from faucet...</p> : null}</div>
				<p>{status}</p>
			</header>
		</div>
	);
}

export default App;
