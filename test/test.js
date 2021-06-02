const { expect } = require("chai");

describe("Anan", function() {
  it("Should return delopy success", async function() {
    const Anan = await ethers.getContractFactory("Anan");
    let minter = ethers.utils.getAddress("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")
    let burner = ethers.utils.getAddress("0x70997970c51812dc3a010c7d01b50e0d17dc79c8")
    const anan = await Anan.deploy(minter, burner);
    await anan.deployed()
  });
});