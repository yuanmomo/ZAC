const { expect } = require("chai");

describe("ZA Token", function() {
  it("Should return delopy success", async function() {
    const hkzacContract = await hre.ethers.getContractFactory("HKZAC");
    const hkzac = await hkzacContract.deploy();
    await hkzac.deployed()

    console.log("ZA token deployed to:", hkzac.address);
  });
});