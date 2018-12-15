const SHA256 = require('crypto-js/SHA256')
const Block = require('./block').Block

class Blockchain {
  constructor () {
    this.chain = []
    this.addBlock(new Block('Genesis block'))
  }
  addBlock (newBlock) {
    if (this.chain.length > 0) {
      newBlock.previousBlockHash = this.chain[this.chain.length - 1].hash
    }
    newBlock.height = this.chain.length
    newBlock.time = new Date().getTime().toString().slice(0, -3)

    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()
    this.chain.push(newBlock)
  }
}
module.exports.Blockchain = Blockchain
