require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
    const accounts = await ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            gas: "auto",
            gasPrice: "auto",
            gasMultiplier: 1,
            accounts: {
                mnemonic :"thrive phone sweet index food huge budget hint grunt room cycle dentist",
            }
        },
        infura: {
            url: "https://ropsten.infura.io/v3/6488b55446554d638cf6ebbc73185998",
            accounts: {
                mnemonic :"thrive phone sweet index food huge budget hint grunt room cycle dentist",
            }
        },
        rinkeby: {
            url: "https://eth-mainnet.alchemyapi.io/v2/123abc123abc123abc123abc123abcde",
            accounts: {
                mnemonic :"thrive phone sweet index food huge budget hint grunt room cycle dentist",
            }
        }
    },
    solidity: {
        version: "0.4.21",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000
            }
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    mocha: {
        timeout: 20000
    }
};

