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
    // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

    // They're very useful to setup the environment for tests, and to clean it
    // up after they run.

    // A common pattern is to declare some variables, and assign them in the
    // `before` and `beforeEach` callbacks.

    // zac contract
    let zacContract;
    // zac object
    let zac;
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

    const decimal = 2;
    const name = "ZA Coin";
    const symbol = "ZACH";
    const totalSupply = 1000000 * 10 ^ decimal;

    const issueAmount = 10000000;
    const coldToHot = 100000 * 10 ^ decimal;


    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    before(async function () {
        // Get the ContractFactory and Signers here.
        zacContract = await ethers.getContractFactory("ZAToken");
        [owner, issuer, cold, hot, user1, user2, user3] = await ethers.getSigners();

        // To deploy our contract, we just have to call zacContract.deploy() and await
        // for it to be deployed(), which happens onces its transaction has been
        // mined.
        zac = await zacContract.deploy(totalSupply, name, symbol, decimal);

        console.log("ZA token address: ", zac.address);
        console.log("-------------------------------------");
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
        it("Should set the right owner", async function () {
            // Expect receives a value, and wraps it in an Assertion object. These
            // objects have a lot of utility methods to assert values.

            // This test expects the owner variable stored in the contract to be equal
            // to our Signer's owner.
            expect(await zac.owner()).to.equal(owner.address);
        });

        it("Should set the right issuer", async function () {
            // Expect receives a value, and wraps it in an Assertion object. These
            // objects have a lot of utility methods to assert values.

            // This test expects the issuer variable stored in the contract to be equal
            // to our Signer's issuer.
            expect(await zac.issuer()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await zac.balanceOf(owner.address);
            expect(await zac.totalSupply()).to.equal(ownerBalance);
        });

        it("Change issuer's address by owner", async function () {
            // Expect receives a value, and wraps it in an Assertion object. These
            // objects have a lot of utility methods to assert values.
            await zac.transferIssuer(issuer.address);

            // This test expects the owner variable stored in the contract to be equal
            // to our Signer's owner.
            expect(await zac.issuer()).to.equal(issuer.address);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens from owner to cold", async function () {
            // Transfer tokens from owner to cold
            await zac.transfer(cold.address, totalSupply);
            expect(await zac.balanceOf(cold.address)).to.equal(totalSupply);
            expect(await zac.balanceOf(owner.address)).to.equal(0);
        });

        it("Issue and send to cold account", async function () {
            // amount to issue
            await zac.connect(issuer).issue(issueAmount);

            // verify issuer
            expect(await zac.balanceOf(issuer.address)).to.equal(issueAmount);

            // send to cold from issuer
            await zac.connect(issuer).transfer(cold.address, issueAmount);

            expect(await zac.balanceOf(cold.address)).to.equal(totalSupply + issueAmount);
            expect(await zac.balanceOf(issuer.address)).to.equal(0);
            expect(await zac.totalSupply()).to.equal(totalSupply + issueAmount);
        });

        it("Redeem from cold account", async function () {
            // send to issuer to redeem
            await zac.connect(cold).transfer(issuer.address, issueAmount);

            // verify issuer
            expect(await zac.balanceOf(issuer.address)).to.equal(issueAmount);
            expect(await zac.balanceOf(cold.address)).to.equal(totalSupply);

            // redeem
            await zac.connect(issuer).redeem(issueAmount);

            expect(await zac.balanceOf(issuer.address)).to.equal(0);
            expect(await zac.totalSupply()).to.equal(totalSupply);
        });

        it("Transfer from cold to hot", async function () {
            // Transfer tokens from owner to cold
            await zac.connect(cold).transfer(hot.address, coldToHot);
            expect(await zac.balanceOf(cold.address)).to.equal(totalSupply - coldToHot);
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

        it("Transfer between users", async function () {
            // Transfer tokens from owner to cold
            await zac.connect(user3).transfer(user1.address, user3ToUser1Amount);

            expect(await zac.balanceOf(user1.address)).to.equal(user1Amount + user3ToUser1Amount);
            expect(await zac.balanceOf(user3.address)).to.equal(user3Amount - user3ToUser1Amount);
        });

        it("Collect from user to hot", async function () {
            // Transfer tokens from owner to cold
            await zac.connect(user1).transfer(hot.address, user1Amount + user3ToUser1Amount);
            await zac.connect(user2).transfer(hot.address, user2Amount);
            await zac.connect(user3).transfer(hot.address, user3Amount - user3ToUser1Amount);

            expect(await zac.balanceOf(hot.address)).to.equal(coldToHot);
            expect(await zac.balanceOf(user1.address)).to.equal(0);
            expect(await zac.balanceOf(user2.address)).to.equal(0);
            expect(await zac.balanceOf(user3.address)).to.equal(0);
        });


        it("Should fail if sender doesn’t have enough tokens", async function () {
            const tokenOfUser1 = await zac.balanceOf(user1.address);
            const tokenOfUser2 = await zac.balanceOf(user2.address);

            // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
            // `require` will evaluate false and revert the transaction.
            await expect(
                zac.connect(user1).transfer(user2.address, 100 * 10 ^ decimal)
            ).to.be.reverted;

            // Owner balance shouldn't have changed.
            expect(await zac.balanceOf(user1.address)).to.equal( tokenOfUser1 );
            expect(await zac.balanceOf(user2.address)).to.equal( tokenOfUser2 );
        });
    });
});