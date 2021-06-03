const { expect } = require("chai");

describe("ZA Token", function() {
  it("Should return delopy success", async function() {
    // We get the contract to deploy
    const hkzacContract = await hre.ethers.getContractFactory("ZAToken");
    const hkzac = await hkzacContract.connect().deploy(10000000000,"ZA Coin","HKDZ",2);

    await hkzac.deployed()

    assert.isNotEmpty(hkzac.address);

    console.log("ZA token deployed to:", );
  });
});