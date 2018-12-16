const level = require('level')
class Storage {
  constructor (path, logLevel) {
    this.logLevel = logLevel
    this.db = level(path)
  }

  countNumEntries () {
    let k = 0
    return new Promise((resolve, reject) => {
      this.db.createKeyStream()
        .on('data', data => { ++k })
        .on('error', err => { reject(err) })
        .on('close', () => { resolve(k) })
    })
  }

  async store (data) {
    await this.storeWithKey(await this.countNumEntries(), data)
  }

  async storeWithKey (key, data) {
    if (this.logLevel >= 2) console.log('storing `' + key + '` -> `' + data + '`')
    await this.db.put(key, data)
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
  return new Storage(path, logLevel)
}
module.exports.makeAtPath = makeStorageAtPath
