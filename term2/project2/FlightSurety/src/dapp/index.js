
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);

            display('Airlines', 'Airline list', contract.airlines.map(addr => {
                return {label: "Airline", value: addr}
            }))

            display('Flights', 'Insurance can be taken out for these flights. Format: <airline> -> <flight id> at <time>', contract.flights.map(flight => {
                return { label: "Flight", value: (flight.airline + ' -> ' + flight.flight + ' at ' + flight.time) }
            }))

            display('Passengers', 'Passenger list', contract.passengers.map(addr => {
                return {label: "Passenger", value: addr}
            }))
        });


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        DOM.elid('purchase-policy').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            if (flight == '')
            {
                alert('flight required')
                return
            }
            let time = DOM.elid('departure-time').value
            if (time == '')
            {
                alert('time required')
                return
            }
            let airlineAddr = DOM.elid('airline').value
            if (airlineAddr == '')
            {
                alert('airline required')
                return
            }
            let passengerAddr = DOM.elid('passenger').value
            if (passengerAddr == '')
            {
                alert('passenger required')
                return
            }
            let prem = DOM.elid('premium').value
            if (prem == '')
            {
                alert('premium required')
                return
            }
            // Write transaction
            contract.buy(passengerAddr, airlineAddr, flight, time, prem, (error, result) => {
                display('Purchase', 'Policy', [{value: "", error: error}])
            });
        })

        DOM.elid('withdraw-payout').addEventListener('click', () => {
            let pass = DOM.elid('passenger').value;
            if (pass == '')
            {
                alert('must specify passenger')
                return
            }
            // Write transaction
            contract.pay(pass, (error, result) => {
                display('Payout', 'Withdraw payout', [ { label: '', error: error, value: 'Paid out'} ]);
            });
        })

        DOM.elid('test-purchase').addEventListener('click', () => {
            contract.buy('0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5', '0xf17f52151EbEF6C7334FAD080c5704D77216b732', 'AB100', 101, '1', (error, result) => {
                display('Purchase', 'Policy', [{value: "", error: error}])
            });
        })
    });


})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}
