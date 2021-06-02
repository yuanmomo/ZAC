// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    await hre.run('compile');

    // We get the contract to deploy
    const hkzac = await hre.ethers.getContractFactory("HKZAC");
    // let minter = ethers.utils.getAddress("0x2871e89Cb92d2b6F3D6c78861e0951Ab5ED73Fc4")
    // let burner = ethers.utils.getAddress("0xff637e695029bD4100DA2f8F1c4005B204705a00")
    const anan = await hkzac.deploy(minter, burner);
    await anan.deployed()

    console.log("Anan deployed to:", anan.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });