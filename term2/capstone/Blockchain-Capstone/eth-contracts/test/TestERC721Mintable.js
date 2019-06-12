var CustomERC721Token = artifacts.require('CustomERC721Token');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    describe('match erc721 spec', function () {
        beforeEach(async function () {
            this.contract = await CustomERC721Token.new({from: account_one});
            await this.contract.mint(account_one, 1, {from: account_one});
            await this.contract.mint(account_one, 2, {from: account_one});
            await this.contract.mint(account_one, 3, {from: account_one});
            await this.contract.mint(account_two, 4, {from: account_one});
        })

        it('should return total supply', async function () {
            assert.equal(4, await this.contract.totalSupply());
        })

        it('should get token balance', async function () {
            assert.equal(3, await this.contract.balanceOf(account_one))
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            assert.equal(
                "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/4",
                await this.contract.tokenURI(4)
            )
        })

        it('should transfer token from one owner to another', async function () {
            assert.equal(account_two, await this.contract.ownerOf(4));
            await this.contract.transferFrom(account_two, account_one, 4, {from: account_two});
            assert.equal(account_one, await this.contract.ownerOf(4));
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () {
            this.contract = await CustomERC721Token.new({from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () {
            try {
                await this.contract.mint(account_one, 1, {from: account_two});
                assert.fail()
            } catch (e) {
            }
        })

        it('should return contract owner', async function () {
            assert.equal(account_one, await this.contract.getOwner())
        })

    });
})
