// migrating the appropriate contracts
var FarmerRole = artifacts.require("./FarmerRole.sol");
var ShipperRole = artifacts.require("./ShipperRole.sol");
var SupermarketRole = artifacts.require("./SupermarketRole.sol");
var CustomerRole = artifacts.require("./CustomerRole.sol");
var SupplyChain = artifacts.require("./SupplyChain.sol");

module.exports = function(deployer) {
  deployer.deploy(FarmerRole);
  deployer.deploy(ShipperRole);
  deployer.deploy(SupermarketRole);
  deployer.deploy(CustomerRole);
  deployer.deploy(SupplyChain);
};
