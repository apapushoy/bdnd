# Udacity Blockchain Capstone

# Contract details
* Contract address: 0xed1E39bE64786be0a208829bFBfb2466A68D32d5 (Rinkeby)
* Contract ABI: see Blockchain-Capstone/eth-contracts/abi.json
* Storefront: https://rinkeby.opensea.io/assets/unidentified-contract-v72

# Test instructions
1. `cd` into `Blockchain-Capstone`
1. Run `npm install`
1. Install truffle if not already installed with `npm install -g truffle`

## Unit tests
1. `cd` into `eth-contracts`
1. Run `truffle dev`
1. In truffle, run `test`

## Deployment
1. `cd` into `eth-contracts`
1. In truffle-config.js, configure network `from` address, infura key, and mnemonic
1. Run `truffle dev`
1. In truffle, run `migrate --network rinkeby`

## Minting
1. Run the docker container with zokrates
1. `cd` into `~/code/square`
1. Generate 10 proofs by running `~/zokrates generate-proof` 10 times, renaming the outputs as proofX.json
1. To mint the tokens, from `Blockchain-Capstone`, run `node add_and_mint.js`

# OpenSea transactions
* Original token owner: `0x8A9973B666B2249D241933D81dEAbEF8E5449BE0`
* New token owner: `0x7c1DfaD62799A6856C4A22806b3361fAA8aceBaB`
