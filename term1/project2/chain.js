const SHA256 = require('crypto-js/SHA256')
const Block = require('./block')
const Storage = require('./storage')

class Blockchain {
  constructor (store, logLevel) {
    this.chainStore = store
    this.logLevel = logLevel
    this.bestBlock = null // optimise away retrieval of best block, assuming i'm the only writer
  }

  async init () {
    if (this.getBlockHeight() === 0) {
      await this.addData('Genesis block')
    }
    return true
  }

  async addData (data) {
    return this.addBlock(new Block(data))
  }

  async addBlock (newBlock) {
    if (this.getBlockHeight() > 0) { // only ever false for the genesis block
      const bestBlock = await this.getBestBlock()
      newBlock.previousBlockHash = bestBlock.hash
    }
    newBlock.height = this.getBlockHeight()
    newBlock.time = new Date().getTime().toString().slice(0, -3)
    newBlock.hash = this.getHash(newBlock)
    await this.chainStore.store(JSON.stringify(newBlock))
    if (this.logLevel >= 1) console.log('added block at ' + newBlock.height)
    this.bestBlock = newBlock
    return this.getBlockHeight()
  }

  getHash (obj) {
    return SHA256(JSON.stringify(obj)).toString()
  }

  async getBestBlock () {
    return this.bestBlock
    // return this.getBlock(this.getBlockHeight() - 1)
  }

  // Get Block By Height
  async getBlock (height) {
    const json = await this.chainStore.get(height)
    if (this.logLevel >= 2) console.log('block data for ' + height + ': ' + json)
    return JSON.parse(json)
  }

  // Get block height, it is auxiliar method that return the height of the blockchain
  getBlockHeight () {
    /*
    since there is no consensus and this is a private chain, I assume
    I am the only writer to the chain and therefore the number of entries will
    not change behind my back.
    */
    return this.chainStore.numEntries
  }

  // Validate if Block is being tampered by Block Height
  async validateBlock (height) {
    var block = await this.getBlock(height)
    const originalHash = block.hash
    block.hash = ''
    return originalHash === this.getHash(block)
  }

  // Validate Blockchain
  async validateChain () {
    var promises = [] // may not be the best idea on a large chain
    for (let i = 0; i < this.getBlockHeight(); ++i) {
      promises.push(this.validateBlock(i))
    }
    var results = await Promise.all(promises)
    var valid = true
    for (let i = 0; i < results.length; ++i) {
      valid &= results[i]
      if (this.logLevel >= 1 && !results[i]) console.log('invalid block: ' + i)
    }
    return valid
  }

  dumpTo (handler) {
    this.chainStore.allEntries(handler)
  }

  // Utility Method to Tamper a Block for Test Validation
  // This method is for testing purpose
  async _modifyBlock (height, block) {
    let self = this
    return new Promise((resolve, reject) => {
      self.chainStore.addLevelDBData(height, JSON.stringify(block))
        .then((blockModified) => {
          resolve(blockModified)
        }).catch((err) => { console.log(err); reject(err) })
    })
  }
}

async function loadChainFrom (dataPath, logLevel) {
  var b = new Blockchain(await Storage.makeAtPath(dataPath, logLevel), logLevel)
  await b.init()
  return b
}

module.exports.loadChainFrom = loadChainFrom
