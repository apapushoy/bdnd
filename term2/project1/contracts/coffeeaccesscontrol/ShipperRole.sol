pragma solidity ^0.5.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'ShipperRole' to manage this role - add, remove, check

contract ShipperRole {

    // Define 2 events, one for Adding, and other for Removing
    event ShipperAdded(address account);
    event ShipperRemoved(address account);

    // Define a struct 'shippers' by inheriting from 'Roles' library, struct Role
    Roles.Role private shippers_;

    // In the constructor make the address that deploys this contract the 1st shipper
    constructor() public {
        shippers_.add(msg.sender);
    }

    // Define a modifier that checks to see if msg.sender has the appropriate role
    modifier onlyShipper() {
        require(isShipper(msg.sender));
        _;
    }

    // Define a function 'isShipper' to check this role
    function isShipper(address account) public view returns (bool) {
        return shippers_.has(account);
    }

    // Define a function 'addShipper' that adds this role
    function addShipper(address account) public onlyShipper {
        _addShipper(account);
    }

    // Define a function 'renounceShipper' to renounce this role
    function renounceShipper() public {
        _removeShipper(msg.sender);
    }

    // Define an internal function '_addShipper' to add this role, called by 'addShipper'
    function _addShipper(address account) internal {
        shippers_.add(account);
        emit ShipperAdded(account);
    }

    // Define an internal function '_removeShipper' to remove this role, called by 'removeShipper'
    function _removeShipper(address account) internal {
        shippers_.remove(accounts);
        emit ShipperRemoved(account);
    }
}
