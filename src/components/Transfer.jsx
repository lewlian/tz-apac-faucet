import { useState, useEffect } from 'react';
import styles from '../styles/Transfer.module.scss';
import Table from './Table';
import { TezosToolkit } from '@taquito/taquito';
import { db } from '../utils/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import envConfig from '../utils/envConfig';
import { connectWallet, disconnectWallet, getActiveAccount, checkIfWalletConnected } from '../utils/wallet';

const axios = require('axios');
const Tezos = new TezosToolkit('https://mainnet.api.tez.ie');
const redeemEndpoint = envConfig.REDEEM;
const twitterEndpoint = envConfig.VERIFY_TWEET;
const faucetAddress = envConfig.FAUCET_ADDRESS;
const authenticateEndpoint = envConfig.AUTHENTICATE;

const Transfer = () => {
	const [wallet, setWallet] = useState(null);
	const [faucetStatus, setFaucetStatus] = useState('Fetching faucet balance...');
	const [isUploading, setUploading] = useState(false);
	const [redeemed, setRedeemed] = useState(false);
	const [walletData, setWalletData] = useState([]); //all wallet data
	const [walletAddresses, setWalletAddresses] = useState([]);
	const [twitter, setTwitter] = useState('');
	const [secret, setSecret] = useState('');
	const [authenticated, setAuthenticated] = useState(false);
	const [isAuthenticating, setIsAuthenticating] = useState(false);
	const faucetCollectionRef = collection(db, 'mainnet');

	const handleConnectWallet = async () => {
		const { wallet } = await connectWallet();
		console.log(wallet);
		setWallet(wallet);
	};

	const handleDisconnectWallet = async () => {
		const { wallet } = await disconnectWallet();
		setWallet(wallet);
	};

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

	async function Redeem(address) {
		// First checks if the twitter username is filled
		console.log(walletAddresses);
		if (twitter.trim() === '') {
			toast.error('Please remember to input handle');
			return;
		} else if (walletAddresses.includes(wallet)) {
			// Double checks if the wallet has already redeemed (they should not see the button anyway)
			toast.error('Wallet already redeemed');
			return;
		}
		console.log('verifying tweet...');
		const tweetVerified = await verifyTweet();
		if (!tweetVerified) {
			// Verifies latest tweet from user contains #Tezos
			toast.error('Please make sure your latest tweet include #tzapac');
			console.log('Tweet verification failed');
			setUploading(false);
			return;
		} else {
			console.log('Tweet verification successful');
			setUploading(true);
			let api = redeemEndpoint + address + '/' + twitter; // formulate redeemEndpoint for faucet redemption
			console.log('Launching API call from frontend');
			try {
				const result = await axios.get(api);
				console.log(result.status);
				if (result.data.error) {
					console.log(result.data.error);
					toast.error(result.data.error);
				} else {
					console.log(result.data);
					setRedeemed(true);
					window.confirm(result.data);
					window.location.reload();
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
		if (secret === '') {
			toast.error('Please enter the secret');
			setIsAuthenticating(false);
			return;
		}
		const authenticateApi = authenticateEndpoint + secret;
		console.log('Starting authentication at: ', authenticateApi);
		try {
			const result = await axios.get(authenticateApi);
			if (result) {
				setAuthenticated(true);
				toast.success('Successfully authenticated');
			} else {
				toast.error('Something went wrong with authenticating secret');
			}
			setIsAuthenticating(false);
		} catch (err) {
			toast.error(err.response.data);
			console.log(err.response.data);
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
			setWalletAddresses(data.docs.map((doc) => doc.get('address')));
		} catch (err) {
			toast.error(err);
		}
	};

	// Fetches the faucet balance to be displayed on the website
	const getFaucetBalance = async () => {
		try {
			const balance = await Tezos.rpc.getBalance(faucetAddress);
			setFaucetStatus('Faucet Balance: ' + balance / 10 ** 6 + ' tez');
		} catch (err) {
			toast.error(err);
		}
	};

	useEffect(() => {
		const getActive = async () => {
			const account = await getActiveAccount();
			if (account) {
				setWallet(account.address);
			}
		};
		getFaucetBalance();
		getWallets();
		getActive();
	}, []);

	return (
		<div className={styles.container}>
			<div id="Action" className={styles.main}>
				{!authenticated ? (
					<div className={styles.form}>
						<input onChange={(e) => setSecret(e.target.value)} className={styles.form_input} />
						{isAuthenticating ? (
							<button type="button" className={`${styles.button} ${styles.button_disabled}`} disabled={true}>
								<svg className={styles.button_loading} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
									<circle className={styles.opacity_25} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className={styles.opacity_75} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Authenticating
							</button>
						) : (
							<button type="button" onClick={() => tryAuthenticate()} className={styles.button}>
								Authenticate
							</button>
						)}
					</div>
				) : !wallet ? (
					<button type="button" onClick={() => handleConnectWallet()} className={styles.button}>
						Connect Wallet
					</button>
				) : redeemed || walletAddresses.includes(wallet) ? (
					<>
						<p> You have already redeemed</p>
						<button type="button" onClick={() => handleDisconnectWallet()} className={styles.button}>
							Disconnect Wallet
						</button>
						<p>💳 {wallet ? 'Connected Wallet: ' + wallet.slice(0, 4) + '...' + wallet.slice(wallet.length - 4, wallet.length) : 'You are not connected!'}</p>
					</>
				) : (
					<>
						<input onChange={(e) => setTwitter(e.target.value)} className={styles.form_input} />
						<>
							{isUploading ? (
								<button type="button" className={`${styles.button} ${styles.button_disabled}`} disabled={true}>
									<svg className={styles.button_loading} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
										<circle className={styles.opacity_25} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className={styles.opacity_75} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Redeeming
								</button>
							) : (
								<button type="button" onClick={() => Redeem(wallet)} className={styles.button}>
									Redeem Faucet
								</button>
							)}
						</>
						<button type="button" onClick={handleDisconnectWallet} className={styles.button}>
							Disconnect Wallet
						</button>
					</>
				)}
			</div>

			<Table data={walletData} />
			<p>{faucetStatus}</p>
		</div>
	);
};

export default Transfer;
