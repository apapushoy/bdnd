pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract

    bool private operational = true;                                    // Blocks all state changes throughout the contract if fals

    uint private numRegistered = 0;

    struct Airline {
        bool isRegistered;
        bool isFunded;
    }

    mapping(address => Airline) private airlineInfo;

    mapping(address => address[]) private voted; // candidate -> voted

    struct Flight {
        address airline;
        string flight;
        uint time;
    }

    bytes32[] private insurableFlights = new bytes32[](0);

    address[] private authorisedCallers = new address[](0);

    uint private funds;

    struct Policy {
        address purchaser;
        uint payout;
        Flight flight;
    }

    mapping(bytes32 => Policy[]) private policies; // flight key -> policy
    mapping(address => Policy[]) private policiesHeldByPurchaser; // policyholder -> policy
    mapping(address => uint) private pendingPayouts;

    event AuthorisedCaller(address indexed addr);

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                    address firstAirline
                                )
                                public
    {
        contractOwner = msg.sender;
        airlineInfo[firstAirline].isRegistered = true;
        numRegistered = 1;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    function isAuthorisedCaller(address a) external view returns(bool) {
        return isExisting(authorisedCallers, a);
    }

    modifier isAuthorised(string memory fn) {
        require(isExisting(authorisedCallers, msg.sender), string(abi.encodePacked(fn, ":", "caller not authorised")));
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()
                            public
                            view
                            returns(bool)
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus
                            (
                                bool mode
                            )
                            external
                            requireContractOwner
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function isRegisteredAirline(address airline) external view returns (bool) {
        return airlineInfo[airline].isRegistered;
    }

    function isFundedAirline(address airline) external view returns (bool) {
        return airlineInfo[airline].isFunded;
    }

    function numRegisteredAirlines() external view returns (uint) {
        return numRegistered;
    }

    function registerFlight(address airline, string flight, uint time) external requireIsOperational
    isAuthorised("registerFlight")
    {
        insurableFlights.push(getFlightKey(airline, flight, time));
    }

    function isRegisteredFlight(address airline, string flight, uint time) external view returns(bool) {
        return isExisting(insurableFlights, getFlightKey(airline, flight, time));
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline
                            (
                                address airline
                            )
                            external
                            requireIsOperational
                            isAuthorised("registerAirline")
    {
        airlineInfo[airline] = Airline(true, false);
        numRegistered += 1;
    }

    function addVote(address airline, address voter) external requireIsOperational isAuthorised("addVote") {
        voted[airline].push(voter);
    }

    function hasVoted(address airline, address voter) external view returns(bool) {
        return isExisting(voted[airline], voter);
    }

    function numVotes(address airline) external view returns (uint votes) {
        return voted[airline].length;
    }

    function authorizeCaller(address appContract) public requireIsOperational requireContractOwner {
        require(!isExisting(authorisedCallers, appContract), "contract already authorised");
        authorisedCallers.push(appContract);
        emit AuthorisedCaller(appContract);
    }

    function setTestingMode(bool val) public view requireIsOperational requireContractOwner {

    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy
                            (
                                address airline,
                                string flight,
                                uint time,
                                uint payout,
                                address purchaser,
                                uint premium
                            )
                            external
                            payable
                            requireIsOperational
                            isAuthorised("buy")
    {
        Flight memory f = Flight(airline, flight, time);
        Policy memory p = Policy(purchaser, payout, f);
        policies[getFlightKey(f)].push(p);
        policiesHeldByPurchaser[purchaser].push(p);
        funds = funds.add(premium);
    }

    function getNumPoliciesHeld(address holder) external view returns(uint) {
        return policiesHeldByPurchaser[holder].length;
    }

    function getPolicy(address holder, uint index) external view
    returns(address airline, string flight, uint time, uint payout) {
        Policy memory p = policiesHeldByPurchaser[holder][index];
        airline = p.flight.airline;
        flight = p.flight.flight;
        time = p.flight.time;
        payout = p.payout;
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    address airline,
                                    string flight,
                                    uint time
                                )
                                external
                                requireIsOperational
                                isAuthorised("credit")

    {
        bytes32 key = getFlightKey(airline, flight, time);
        Policy[] memory toPayout = policies[key];

        for (uint i = 0; i < toPayout.length; i++) {
            address holder = toPayout[i].purchaser;
            if (holder == address(0))
                continue;
            uint payout = toPayout[i].payout;
            if (payout > funds)
                break;
            pendingPayouts[holder] = pendingPayouts[holder].add(payout);
            delete toPayout[i];
            funds = funds.sub(payout);
        }
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            requireIsOperational
    {
        uint amount = pendingPayouts[msg.sender];
        require(amount > 0, "nothing to payout");
        pendingPayouts[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund
                            (
                                address airline,
                                uint fee
                            )
                            external
                            payable
                            isAuthorised("fund")
                            // requireIsOperational
    {
        airlineInfo[airline].isFunded = true;
        funds = funds.add(fee);
    }

    function getFlightKey(Flight memory f) internal pure returns(bytes32) {
        return getFlightKey(f.airline, f.flight, f.time);
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        internal
                        pure
                        returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    function isExisting(address[] memory list, address item) internal pure returns (bool) {
        bool ok = false;
        for (uint i = 0; i < list.length; i++) {
            if (list[i] == item) {
                ok = true;
                break;
            }
        }
        return ok;
    }

    function isExisting(bytes32[] memory list, bytes32 item) internal pure returns (bool) {
        bool ok = false;
        for (uint i = 0; i < list.length; i++) {
            if (list[i] == item) {
                ok = true;
                break;
            }
        }
        return ok;
    }


    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
                            external
                            payable
    {
        // fund(msg.sender, msg.value);
    }


}
