import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));

var accounts = null
var flightSuretyApp = null
var indices = {}

var codes = [0, 10, 20, 30, 40, 50]

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

web3.eth.getAccounts()
.then(acc => {
    accounts = acc
    web3.eth.defaultAccount = accounts[0];

    flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

    flightSuretyApp.methods.REGISTRATION_FEE()
    .call((error, fee) => {
        console.log('Fee: ' + fee)
        for(let i = 1; i < 31; i++) {
            flightSuretyApp.methods.registerOracle().send({ from: accounts[i], value: fee, gas: 2500000 })
               .then(receipt => {
                   flightSuretyApp.methods.getMyIndexes().call({from: accounts[i]})
                   .then(ixs => {
                       indices[accounts[i]] = ixs
                       console.log(`Oracle Registered: ${accounts[i]} -> ${ixs[0]}, ${ixs[1]}, ${ixs[2]}`);
                   })
                   .catch(e => console.log('error during index retrieval: ' + e))
               })
               .catch(e => console.log('error during oracle registration: ' + e))
        }
    })
    .catch(e => console.log('error getting fee: ' + e))


    flightSuretyApp.events.OracleRequest({
        fromBlock: 0
    }, function (error, event) {
        if (error) console.log(error)
        for (var account in indices) {
            var ix = indices[account]
            for (var i = 0; i < ix.length; i++) {
                if (ix[i] == event.returnValues.index) {
                    let codeIx = randomIntFromInterval(0, codes.length-1)
                    console.log(`oracle ${account} for index ${ix[i]} sending response: ${codes[codeIx]}`)
                    flightSuretyApp.methods.submitOracleResponse(
                        event.returnValues.index, event.returnValues.airline, event.returnValues.flight,
                        event.returnValues.timestamp, codes[codeIx]).send({from: account})
                }
            }
        }
    })
})
.catch(e => console.log('error getting accounts: ' + e))

const app = express();
app.get('/api', (req, res) => {
    // 1) Passenger can purchase insurance for flight
    // 2) Trigger contract to request flight status update
    res.send({
      message: 'An API for use with your Dapp!'
    })
})


export default app;
