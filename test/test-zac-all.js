// We import Chai to use its asserting functions here.
const {expect} = require("chai");
const {ethers} = require("hardhat");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Token contract", function () {
    // Mocha has four functions that let you hook into the the test runner's
    // lifecycle. These are: `before`, `beforeEach`, `after`, `afterEach`.

    // They're very useful to setup the environment for tests, and to clean it
    // up after they run.

    // A common pattern is to declare some variables, and assign them in the
    // `before` and `beforeEach` callbacks.

    //------------------------- contract var -------------------------
    // zac contract
    let zacContract;
    // zac object
    let zac;

    //------------------------- account for test -------------------------
    // The deployer deploy the contract, and transfer the role to another after
    // deploying.
    let deployer;

    // owner who deploys contract
    let owner;
    // issuer to issue and redeem zac
    let issuer;

    // cold wallet
    let cold;
    // host wallet
    let hot;

    // user
    let user1;
    let user2;
    let user3;

    //------------------------- constant config of contract -------------------------
    let tokenName = "ZAToken";
    // constant for ERC20 token
    const decimal = 2;
    const name = "ZA Coin";
    const symbol = "ZACH";
    const initialSupply = 0;
    const totalSupply = 1000000 * 10 ^ decimal;

    //------------------------- constant for test -------------------------
    const coldToHot = 100000 * 10 ^ decimal;
    const redeemAmount = 400000 * 10 ^ decimal;


    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    before(async function () {
        // Get the ContractFactory and Signers here.
        zacContract = await ethers.getContractFactory(tokenName);
        [deployer, owner, issuer, cold, hot, user1, user2, user3] = await ethers.getSigners();

        // To deploy our contract, we just have to call zacContract.deploy() and await
        // for it to be deployed(), which happens once its transaction has been mined.
        zac = await zacContract.deploy(initialSupply, name, symbol, decimal);

        console.log("ZA token address: ", zac.address);
        console.log("-------------------------------------");
        console.log("deployer: ", deployer.address);
        console.log("owner: ", owner.address);
        console.log("issuer: ", issuer.address);
        console.log("-------------------------------------");
        console.log("cold: ", cold.address);
        console.log("hot: ", hot.address);
        console.log("-------------------------------------");
        console.log("user1: ", user1.address);
        console.log("user2: ", user2.address);
        console.log("user3: ", user3.address);
    });

    // You can nest describe calls to create subsections.
    describe("Deployment", function () {
        // `it` is another Mocha function. This is the one you use to define your
        // tests. It receives the test name, and a callback function.

        // If the callback function is async, Mocha will `await` it.
        it("Default owner and issuer is the [deployer]", async function () {
            // This test expects the owner and issuer variable stored in the contract to be equal to our Signer's deployer.
            expect(await zac.owner()).to.equal(deployer.address);
            expect(await zac.issuer()).to.equal(deployer.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await zac.balanceOf(owner.address);
            expect(await zac.totalSupply()).to.equal(ownerBalance);
            expect(await zac.totalSupply()).to.equal(initialSupply);
        });

        it("Change owner and issuer to another", async function () {
            // Expect receives a value, and wraps it in an Assertion object. These
            // objects have a lot of utility methods to assert values.

            await zac.transferOwnership(owner.address);
            await zac.transferIssuer(issuer.address);

            // This test expects the owner variable stored in the contract to be equal
            // to our Signer's owner.
            expect(await zac.issuer()).to.equal(issuer.address);
            expect(await zac.owner()).to.equal(owner.address);
        });

        it("Deployer call function failed after transferring role to another", async function () {
            // deployer call function failed after transferring role to another
            await expect(zac.connect(deployer).transferOwnership(deployer.address)).to.be.reverted;
            await expect(zac.connect(deployer).transferIssuer(deployer.address)).to.be.reverted;
        });
    });

    describe("Issue tokens after contract deployed", function () {
        it("Total supply should be zero", async function () {
            expect(await zac.totalSupply()).to.equal(initialSupply);
        });

        it("Deployer issue failed", async function () {
            // deployer call function failed after transferring role to another
            await expect(zac.connect(deployer).issue(totalSupply)).to.be.reverted;
        });

        it("Issue and send to cold account", async function () {
            // amount of total supply to issue
            await zac.connect(issuer).issue(totalSupply);

            // verify issuer's balance
            expect(await zac.balanceOf(issuer.address)).to.equal(totalSupply);

            // send to cold from issuer
            await zac.connect(issuer).transfer(cold.address, totalSupply);

            expect(await zac.balanceOf(cold.address)).to.equal(totalSupply);
            expect(await zac.balanceOf(issuer.address)).to.equal(0);
            expect(await zac.totalSupply()).to.equal(totalSupply);
        });
    });

    describe("Redeem tokens", function () {
        it("Transfer tokens from cold to issuer", async function () {
            // Transfer tokens from owner to cold
            await zac.connect(cold).transfer(issuer.address, redeemAmount);

            expect(await zac.balanceOf(cold.address)).to.equal(totalSupply - redeemAmount);
            expect(await zac.balanceOf(issuer.address)).to.equal(redeemAmount);
            expect(await zac.balanceOf(owner.address)).to.equal(0);
        });

        it("Redeem", async function () {
            // redeem
            await zac.connect(issuer).redeem(redeemAmount);

            expect(await zac.balanceOf(issuer.address)).to.equal(0);
            expect(await zac.balanceOf(cold.address)).to.equal(totalSupply - redeemAmount);
            expect(await zac.totalSupply()).to.equal(totalSupply - redeemAmount);
        });
    });


    describe("Transactions", function () {
        it("Transfer from cold to hot", async function () {
            // Transfer tokens from cold to hot
            await zac.connect(cold).transfer(hot.address, coldToHot);
            expect(await zac.balanceOf(cold.address)).to.equal(totalSupply - redeemAmount - coldToHot);
            expect(await zac.balanceOf(hot.address)).to.equal(coldToHot);
        });

        const user1Amount = 100 * 10 ^ decimal;
        const user2Amount = 200 * 10 ^ decimal;
        const user3Amount = 300 * 10 ^ decimal;

        it("Transfer from hot to user", async function () {
            // Transfer tokens from owner to cold
            await zac.connect(hot).transfer(user1.address, user1Amount);
            await zac.connect(hot).transfer(user2.address, user2Amount);
            await zac.connect(hot).transfer(user3.address, user3Amount);

            expect(await zac.balanceOf(hot.address)).to.equal(coldToHot - (user1Amount + user2Amount + user3Amount));
            expect(await zac.balanceOf(user1.address)).to.equal(user1Amount);
            expect(await zac.balanceOf(user2.address)).to.equal(user2Amount);
            expect(await zac.balanceOf(user3.address)).to.equal(user3Amount);
        });

        const user3ToUser1Amount = 100 * 10 ^ decimal;

        it("Transfer between users: from user3 to user1", async function () {
            // Transfer tokens from owner to cold
            await zac.connect(user3).transfer(user1.address, user3ToUser1Amount);

            expect(await zac.balanceOf(user1.address)).to.equal(user1Amount + user3ToUser1Amount);
            expect(await zac.balanceOf(user3.address)).to.equal(user3Amount - user3ToUser1Amount);
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            const tokenOfUser1 = await zac.balanceOf(user1.address);
            const tokenOfUser2 = await zac.balanceOf(user2.address);

            expect(await zac.balanceOf(user1.address)).to.equal(tokenOfUser1);

            // Try to send more tokens from user1 to user2 when user1's balance is not enough.
            await expect(
                zac.connect(user1).transfer(user2.address, tokenOfUser1 + 1 * 10 ^ decimal)
            ).to.be.reverted;

            // user1 and user2's balance shouldn't have changed.
            expect(await zac.balanceOf(user1.address)).to.equal(tokenOfUser1);
            expect(await zac.balanceOf(user2.address)).to.equal(tokenOfUser2);
        });

        describe("Pause test", function () {
            it("Only owner can call paused function", async function () {
                // Transfer tokens from owner to cold
                await expect(zac.connect(deployer).pause()).to.be.reverted;

                await zac.connect(owner).pause()

                expect(await zac.paused()).to.equal(true);
            });

            it("Transfer failed when contract is paused", async function () {
                // Transfer tokens failed
                await expect(
                    zac.connect(user1).transfer(user2.address, 1 * 10 ^ decimal)
                ).to.be.reverted;
            });

            it("Only owner can call unpause function", async function () {
                // Transfer tokens from owner to cold
                await expect(zac.connect(deployer).unpause()).to.be.reverted;

                await zac.connect(owner).unpause()

                expect(await zac.paused()).to.equal(false);
            });
        });

        it("Collect from users to hot", async function () {
            // Transfer tokens from owner to cold
            await zac.connect(user1).transfer(hot.address, user1Amount + user3ToUser1Amount);
            await zac.connect(user2).transfer(hot.address, user2Amount);
            await zac.connect(user3).transfer(hot.address, user3Amount - user3ToUser1Amount);

            expect(await zac.balanceOf(hot.address)).to.equal(coldToHot);
            expect(await zac.balanceOf(user1.address)).to.equal(0);
            expect(await zac.balanceOf(user2.address)).to.equal(0);
            expect(await zac.balanceOf(user3.address)).to.equal(0);
        });
    });

});