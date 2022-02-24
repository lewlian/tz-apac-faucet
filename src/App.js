import styles from './styles/Home.module.scss';
import TezosShortLogo from './assets/tz-logo-short.png';
import TezosLongLogo from './assets/tz-logo-long.png';
import DripStripLogo from './assets/driptez-stripe.png';
import TransferComponent from './components/Transfer';
import StripeVerticalLogo from './assets/driptez-box2.png';
import StripeHorizontalLogo from './assets/driptez-box1.png';
import { Toaster } from 'react-hot-toast';

const App = () => {
	return (
		<div className={styles.container}>
			<Toaster position="top-center" reverseOrder={false} />
			<section className={styles.main}>
				<div id="Header" className={styles.row_top}>
					<img src={TezosShortLogo} alt="tz-short-logo" className={styles.row_top_logo1} />
					<img src={DripStripLogo} alt="driptez-stripe" className={styles.row_top_logo2} />
				</div>
				<div id="Main" className={styles.content}>
					<div id="Title">
						<img src={StripeHorizontalLogo} alt="tz-short-logo" className={styles.title_stripe1} />
						<h1 className={styles.title}>
							A FAUCET <br />
							FOR <span className={styles.title_blue}>ARTISTS</span>
						</h1>
						<img src={StripeVerticalLogo} alt="tz-short-logo" className={styles.title_stripe2} />
						<div className={styles.credits}>
							<p>SPONSORED BY</p>
							<img src={TezosLongLogo} alt="tz-long-logo" />
						</div>
					</div>
					<div id="Transfer" className={styles.transfer}>
						<div className={styles.instructions}>
							<ul>
								<li>
									1. Join our{' '}
									<a href="https://t.me/TezosAsianArtist" target="_blank" className={styles.link}>
										telegram
									</a>{' '}
									to find out the secret code
								</li>
								<li>2. Your latest tweet must contain #tzapac</li>
								<li>3. Enter your twitter handle (without '@')</li>
								<li>4. Click on Redeem Faucet</li>
								<li>5. Wait for pop-up and receive tez in a few minutes</li>
								<li>Note: Each wallet and twitter can only redeem once!</li>
							</ul>
						</div>

						<TransferComponent />
					</div>
				</div>
			</section>
		</div>
	);
};

export default App;
