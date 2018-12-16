const level = require('level')
class Storage {
  constructor (path, logLevel) {
    this.logLevel = logLevel
    this.db = level(path)
    this.numEntries = 0
    this.readyForWriting = false
  }

  async init () {
    this.readyForWriting = await this.countNumEntries()
    return this.readyForWriting
  }

  countNumEntries () {
    let self = this
    return new Promise((resolve, reject) => {
      this.db.createKeyStream()
        .on('data', data => { ++self.numEntries })
        .on('error', err => { reject(err) })
        .on('close', () => { resolve(true) })
    })
  }

  async store (data) {
    if (!this.readyForWriting) {
      throw new Error('not ready for writing')
    }
    await this.storeWithKey(this.numEntries, data)
  }

  async storeWithKey (key, data) {
    if (this.logLevel >= 2) console.log('storing `' + key + '` -> `' + data + '`')
    await this.db.put(key, data)
    ++this.numEntries
  }

  async get (key) {
    if (this.logLevel >= 2) console.log('getting `' + key + '`')
    return this.db.get(key)
  }

  allEntries (onData) {
    this.db.createValueStream().on('data', onData)
  }

  // udacity api
  async addDataToLevelDB (data) {
    this.store(data)
  }
  async addLevelDBData (key, data) {
    this.storeWithKey(key, data)
  }
  async getLevelDBData (key) {
    return this.get(key)
  }
}
async function makeStorageAtPath (path, logLevel) {
  var s = new Storage(path, logLevel)
  await s.init()
  return s
}
module.exports.makeAtPath = makeStorageAtPath
