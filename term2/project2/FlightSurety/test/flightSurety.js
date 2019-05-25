
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  let fee = web3.utils.toWei('10', 'ether');

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);

    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address)
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try
      {
          await config.flightSuretyData.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) airline cannot register airlines if it is not funded', async () => {

    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isRegisteredAirline.call(newAirline);

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });




  it ('(multiparty) Only existing airline may register a new airline until there are at least four airlines registered', async () => {
      await config.flightSuretyApp.fund({from: accounts[1], value: fee })
      assert.equal(await config.flightSuretyData.isFundedAirline(accounts[1]), true, "airline 1 not funded");

      await config.flightSuretyApp.registerAirline(accounts[2], {from: accounts[1]})
      assert.equal(await config.flightSuretyData.isRegisteredAirline.call(accounts[2]), true, "registration 2 failed");

      await config.flightSuretyApp.registerAirline(accounts[3], {from: accounts[1]})
      assert.equal(await config.flightSuretyData.isRegisteredAirline.call(accounts[3]), true, "registration 3 failed");

      await config.flightSuretyApp.registerAirline(accounts[4], {from: accounts[1]})
      assert.equal(await config.flightSuretyData.isRegisteredAirline.call(accounts[4]), true, "registration 4 failed");

      await config.flightSuretyApp.registerAirline(accounts[5], {from: accounts[1]})
      assert.equal(await config.flightSuretyData.isRegisteredAirline.call(accounts[5]), false, "registration 5 failed");
  })

  it ('(multiparty) multiparty consent of 50% of registered airlines required to register new airline', async () => {
      assert.equal((await config.flightSuretyData.numRegisteredAirlines.call()).toString(), "4");
      // need 2 votes to register

      //fund airline 2 so it can vote
      await config.flightSuretyApp.fund({from: accounts[2], value: fee})
      assert.equal(await config.flightSuretyData.isFundedAirline(accounts[2]), true, "airline 2 not funded");

      // multiparty now active

      await config.flightSuretyApp.registerAirline(accounts[6], {from: accounts[1]})
      assert.equal(await config.flightSuretyData.isRegisteredAirline.call(accounts[6]), false, "registration 6 (vote 1) did not fail");

      await config.flightSuretyApp.registerAirline(accounts[6], {from: accounts[2]})
      assert.equal(await config.flightSuretyData.isRegisteredAirline.call(accounts[6]), true, "registration 6 (vote 2) did not fail");
  })

  it('(passenger) passenger must submit up to 1 ether to purchase policy / If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid',
  async () => {
      await config.flightSuretyApp.registerFlight("ABC123", 900, {from:accounts[1]})
      assert.equal(await config.flightSuretyData.isRegisteredFlight.call(accounts[1], "ABC123", 900), true,
        "flight not registered");

      try {
          await config.flightSuretyApp.buy(accounts[1], "ABC123", 900, {from: accounts[7], value: 0 });
          assert.equal(true, false, "did not fail with 0 premium");
      } catch (e) {
      }

      try {
          await config.flightSuretyApp.buy(accounts[1], "ABC123", 900, {from: accounts[7], value: web3.utils.toWei("1.1") });
          assert.equal(true, false, "did not fail with 1.1 ether premium");
      } catch (e) {
      }

      await config.flightSuretyApp.buy(accounts[1], "ABC123", 900, {from: accounts[7], value: web3.utils.toWei("0.7") });
      assert.equal(await config.flightSuretyData.getNumPoliciesHeld.call(accounts[7]), 1)
      var res = await config.flightSuretyData.getPolicy.call(accounts[7], 0)
      assert.equal(res[3], web3.utils.toWei("1.05")); // verify payout is 1.5x premium
  })


});
