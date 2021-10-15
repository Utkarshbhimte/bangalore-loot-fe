import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";

// Constants
const TWITTER_HANDLE = "0xbhaisaab";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

const { ethereum } = window;

const App = () => {
  /*
   * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [boughtNFT, setBoughtNFT] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    /*
     * First make sure we have access to window.ethereum
     */
    const { ethereum } = window;

    if (!ethereum) {
      alert("Make sure you have metamask!");
      return;
    }

    console.log("We have the ethereum object", ethereum);

    /*
     * Check if we're authorized to access the user's wallet
     */
    const accounts = await ethereum.request({ method: "eth_accounts" });

    /*
     * User can have multiple authorized accounts, we grab the first one if its there!
     */
    if (!accounts.length) {
      console.log("No authorized account found");
      setCurrentAccount(null);
      return;
    }
    const account = accounts[0];
    console.log("Found an authorized account:", account);
    setCurrentAccount(account);
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      if (ethereum) {
        setLoading(true);

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        setLoading(false);

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          setLoading(false);
          setBoughtNFT(tokenId.toNumber());
          console.log(from, tokenId.toNumber());
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const checkETHNetwork = async () => {
    try {
      setLoading(true);
      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
    checkETHNetwork();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {!loading && (
            <>
              {!currentAccount ? (
                <button
                  onClick={connectWallet}
                  className="cta-button connect-wallet-button"
                >
                  Connect to Wallet
                </button>
              ) : (
                <button
                  onClick={askContractToMintNft}
                  className="cta-button connect-wallet-button"
                >
                  Mint NFT
                </button>
              )}

              {boughtNFT && (
                <div className="sub-text">
                  Hey there! We've minted your NFT. It may be blank right now.
                  It can take a max of 10 min to show up on OpenSea. Here's the
                  link:{" "}
                  <a
                    target="_blank"
                    href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${boughtNFT}`}
                  >
                    https://testnets.opensea.io/assets/{CONTRACT_ADDRESS}/
                    {boughtNFT}
                  </a>
                </div>
              )}
            </>
          )}

          {!!loading && (
            <div className="sub-text">The transaction is in progress</div>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
