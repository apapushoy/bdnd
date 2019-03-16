const TokenUdc = artifacts.require("TokenUdc")

module.exports = function (deployer) {
  deployer.deploy(TokenUdc, "UDC Token", "UDT", 10, 10000000)
}
