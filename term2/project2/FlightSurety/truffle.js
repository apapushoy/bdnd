var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
var ganache_mnem = "alone silk illness expose wine tobacco canyon theory attract scorpion vocal melt";

module.exports = {
    networks: {
        ganache: {
            provider: function() {
                return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
            },
            network_id: '*',
            gas: 9999999999,
            gasPrice: 1000,
            accounts: 50
        },

        develop: {
            accounts: 50
        }

        // ganache: {
        //     provider: function() {
        //         return new HDWalletProvider(ganache_mnem, "http://127.0.0.1:7545/", 0, 30);
        //     },
        //     network_id: '*',
        //     host: "localhost",
        //     port: 7545,
        //     gas: 999999999
        // },

    },
    compilers: {
        solc: {
            version: "^0.4.24"
        }
    }
};
