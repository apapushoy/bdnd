// Test if an ERC721 token can be minted for contract - SolnSquareVerifier
var Verifier = artifacts.require('SquareVerifier');
var SolnSquareVerifier = artifacts.require('SolnSquareVerifier');

const fs = require('fs');


contract('TestSolnSquareVerifier', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    beforeEach(async function () {
        this.verifier = await Verifier.new({from: account_one});
        this.contract = await SolnSquareVerifier.new(this.verifier.address, {from: account_one});
    })

    it('solution can be added', async function () {
        var a = [0, 1];
        var b = [[3,4],[5,6]];
        var c = [7,8];
        var inp = [9,10];
        var ret = await this.contract.addSolution(a, b, c, inp, {from: account_one})
        assert.equal('0x269470f39e5b2cf9ce5deaaab67f617c8df188be6ebe84f5989965ec70da2262',
         ret.logs[0].args.key.toString())
    });

    it('token can be minted', async function () {
        let raw = fs.readFileSync('../zokrates/code/square/proof.json')
        proof = JSON.parse(raw)

        var ret = await this.contract.addSolution(proof.proof.a, proof.proof.b, proof.proof.c,
             proof.inputs, {from: account_one})
        var key = ret.logs[0].args.key.toString()

        var ret2 = await this.contract.issueToken(key, {from: account_one})
        assert.equal(0, ret2.logs[0].args.tokenId)
    });

})
