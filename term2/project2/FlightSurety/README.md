# FlightSuretyApp
## Test instructions
Start new terminals in the project directory and follow these steps:
0. Install dependencies
    * Run `npm install`
    * Run `npm install -g truffle`
1. Launch and configure Ganache UI
    *  Go to the settings by clicking the cog button
    * In the _Accounts & Keys_ section, enter
        * 500 as the default account balance
        * 50 as the total number of accounts to generate
        * `candy maple cake sugar pudding cream honey rich smooth crumble sweet treat` as the mnemonic
    * In the _Chain_ section enter
        * 9999999999 as the gas limit
        * 1000 as the gas price
    * In the _Server_ section enter
        * 7545 as the port
2. Deploy contract
    * Run `truffle console`
    * In truffle, enter `migrate --reset --network ganache`
4. Run servers
    * In new terminal enter `npm run server` and wait for oracles to register
    * In new terminal enter `npm run dapp`
7. In web browser, navigate to `localhost:8000`
8. Wait for init to finish
    * this will be indicated by the listing of available flights, airlines and passengers.
    * Should look like this:
    ![](dapp_loaded.jpg)

To request oracle responses, enter a flight number and click submit to Oracles.  
To purchase a policy, enter:
* airline address
* flight
* flight's departure time
* passenger address
* premium in ether

## Troubleshooting
### DApp
In case of issue with the dapp, please review the JS console and provide a screenshot of this in the review feedback.

## Rubric
### Students has implemented operational status control.
The following tests verify this functionality:
* (multiparty) has correct initial isOperational() value
* (multiparty) can block access to setOperatingStatus() for non-Contract Owner account
* (multiparty) can allow access to setOperatingStatus() for Contract Owner account
* (multiparty) can block access to functions using requireIsOperational when operating status is false

### Only existing airline may register a new airline until there are at least four airlines registered
This is verified by these tests:
* (airline) airline cannot register airlines if it is not funded
* (multiparty) Only existing airline may register a new airline until there are at least four airlines registered
Additionally, this functionality is invoked by the dapp during its initialisation in `contract.js`

### Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines
This is verify by this test:
* (multiparty) multiparty consent of 50% of registered airlines required to register new airline

### Airline can be registered, but does not participate in contract until it submits funding of 10 ether
Verified by:
* (airline) airline cannot register airlines if it is not funded

### Passengers can choose from a fixed list of flight numbers and departure that are defined in the Dapp client
The list of flights is shown in the dapp's _Flights_ section once initialisation is complete.

### Passengers may pay up to 1 ether for purchasing flight insurance.
Verified by unit test:
* (passenger) passenger must submit up to 1 ether to purchase policy / If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid

### Update flight status requests from client Dapp result in OracleRequest event emitted by Smart Contract that is captured by server (displays on console and handled in code)
Triggered from dapp with the _Submit to Oracle_ button.
Server console will show something like:
```
oracle 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544 for index 5 sending response: 50
oracle 0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e for index 5 sending response: 50
oracle 0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5 for index 5 sending response: 40
oracle 0xF014343BDFFbED8660A9d8721deC985126f189F3 for index 5 sending response: 0
oracle 0xa23eAEf02F9E0338EEcDa8Fdd0A73aDD781b2A86 for index 5 sending response: 50
oracle 0xcb0236B37Ff19001633E38808bd124b60B1fE1ba for index 5 sending response: 10
oracle 0x715e632C0FE0d07D02fC3d2Cf630d11e1A45C522 for index 5 sending response: 50
oracle 0x90FFD070a8333ACB4Ac1b8EBa59a77f9f1001819 for index 5 sending response: 30
oracle 0x068729ec4f46330d9Af83f2f5AF1B155d957BD42 for index 5 sending response: 20
```
