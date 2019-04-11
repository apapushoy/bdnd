pragma solidity ^0.5.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'CustomerRole' to manage this role - add, remove, check

contract CustomerRole {

    // Define 2 events, one for Adding, and other for Removing
    event CustomerAdded(address account);
    event CustomerRemoved(address account);

    // Define a struct 'customers' by inheriting from 'Roles' library, struct Role
    Roles.Role private customers_;

    // In the constructor make the address that deploys this contract the 1st customer
    constructor() public {
        _addCustomer(msg.sender);
    }

    // Define a modifier that checks to see if msg.sender has the appropriate role
    modifier onlyCustomer() {
        require(isCustomer(msg.sender));
        _;
    }

    // Define a function 'isCustomer' to check this role
    function isCustomer(address account) public view returns (bool) {
        return Roles.has(customers_, account);
    }

    // Define a function 'addCustomer' that adds this role
    function addCustomer(address account) public onlyCustomer {
        _addCustomer(account);
    }

    // Define a function 'renounceCustomer' to renounce this role
    function renounceCustomer() public {
        _removeCustomer(msg.sender);
    }

    // Define an internal function '_addCustomer' to add this role, called by 'addCustomer'
    function _addCustomer(address account) internal {
        Roles.add(customers_, account);
        emit CustomerAdded(account);
    }

    // Define an internal function '_removeCustomer' to remove this role, called by 'removeCustomer'
    function _removeCustomer(address account) internal {
        Roles.remove(customers_, account);
        emit CustomerRemoved(account);
    }
}
