const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("ZA Token", function () {
    it("Should return success", async function () {
        const [owner] = await ethers.getSigners();

        const zacContract = await ethers.getContractFactory("ZAToken");
        const zac = await zacContract.deploy(10000000000, "ZA Coin", "ZACH", 2);

        const ownerBalance = await zac.balanceOf(owner.address);
        expect(await zac.totalSupply()).to.equal(ownerBalance);

        console.log("ZA token deployed to:", zac.address);
    });
});