import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http:', 'ws:')));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flights = [];
        this.numFlightsToRegister = 3
        this.initialize(config.appAddress, callback);
    }

    initialize(appAddr, callback) {
        let self = this
        this.web3.eth.getAccounts(async (error, accts) => {
            this.owner = accts[0];

            try {
                await self.flightSuretyData.methods.authorizeCaller(appAddr)
                .send({from:accts[0]})
                console.info('auth done')
            } catch (e) {
                console.info('app already authorised')
            }

            let counter = 1; // index 1 is pre-registered
            self.airlines.push(accts[counter++])
            self.fund(self.airlines[0], (e, p) => {
                if (e) {
                    self.logError('airline.fund', p.airline, e)
                    return
                } else
                    console.log('airline funded: ' + p.airline)

                while(this.airlines.length < 5) {
                    let acct = accts[counter++]
                    self.airlines.push(acct);

                    this.registerAirline(acct, (e, p) => {
                        if (e) {
                            self.logError('airline.register', p.airline, e)
                        } else
                            console.info('airline registered: ' + p.airline)

                        self.fund(p.airline, (e, p) => {
                            if (e) {
                                self.logError('airline.fund', p.airline, e)
                            }
                            else
                                console.info('airline funded: ' + p.airline)

                            var flightNum = 100
                            var airline = 0
                            while (self.flights.length < self.numFlightsToRegister) {
                                let flight = "AB"+flightNum++
                                let time = flightNum
                                let self = this
                                self.flights.push({airline: self.airlines[airline], flight: flight, time: time})

                                self.registerFlight(airline++, flight, time, (e, p) => {
                                    if (e) {
                                        this.logError('flight.register', p.airline, e)
                                    } else
                                        console.info(`flight registered: ${JSON.stringify(p)}`)

                                    while(self.passengers.length < 5) {
                                        self.passengers.push(accts[counter++]);
                                    }

                                })
                            }
                        })
                    })
                }

                var cbLoop = () => {
                    if (self.passengers.length < 5)
                        setTimeout(cbLoop, 500)
                    else {
                        callback()
                    }
                }

                cbLoop();

            })

        });
    }

    logError(op, airline, e) {
        console.warn('[' + op.toUpperCase() + '] ' + airline + ' -> ' +  e)
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        console.log('fetch flight status: ' + flight)

        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        }
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    registerAirline(airline, callback) {
        console.log('register airline: ' + airline)

        let self = this;
        let payload = {
            airline: airline,
        }

        self.flightSuretyApp.methods
            .registerAirline(payload.airline)
            .send({ from: self.airlines[0]}, (error, result) => {
                callback(error, payload);
            });
    }

    registerFlight(airlineIx, flight, time, callback) {
        let airline = this.airlines[airlineIx]
        console.log('register flight: ' + airline + ' ' + flight + ' ' + time)

        let payload = {
            airline: airline,
            flight: flight,
            time: time
        }
        this.flightSuretyApp.methods
            .registerFlight(payload.flight, payload.time)
            .send({ from: payload.airline}, (error, result) => {
                callback(error, payload);
            });
    }

    fund(addr, callback) {
        console.log('fund: ' + addr)
        let self = this;
        let payload = {
            airline: addr
        }
        self.flightSuretyApp.methods
            .fund()
            .send({ from: payload.airline, value: self.web3.utils.toWei("10", "ether") }, (error, result) => {
                callback(error, payload);
            });
    }

    buy(passengerAddr, airline, flight, time, premium, callback) {
        console.log(`buy: ${passengerAddr} ${airline} ${flight} ${time} ${premium}`)
        let payload = {
            airline: airline,
            passenger: passengerAddr,
            flight: flight,
            time: time,
            premium: premium
        }
        this.flightSuretyApp.methods.buy(airline, flight, time)
        .send({from: passengerAddr, value: this.web3.utils.toWei(premium, "ether"), gas: 9999999},
        (e, p)=>{callback(e, p)})
    }

    pay(passengerAddr, callback) {
        console.log(`pay: ${passengerAddr}`)
        let payload = {
            passenger: passengerAddr,
        }
        this.flightSuretyData.methods.pay().send({from: passengerAddr},
        (e, p)=>{callback(e, p)})
    }
}
