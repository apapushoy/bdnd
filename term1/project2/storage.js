const level = require('level')
class Storage {
  constructor (path) {
    this.db = level(path)
    this.numEntries = 0
    this.readyForWriting = false
    this.countNumEntries()
  }
  countNumEntries () {
    let self = this
    this.db.createKeyStream()
      .on('data', data => { ++self.numEntries })
      .on('error', err => { console.log(err) })
      .on('close', () => { self.readyForWriting = true })
  }
  async store (data) {
    if (!this.readyForWriting) {
      throw new Error('not ready for writing')
    }
    try {
      await this.db.put(this.numEntries, data)
      this.numEntries++
    } catch (e) {
      console.log('Failed to store', e)
    }
  }
  hasData () {
    return this.numEntries > 0
  }
  async get (key) {
    return this.db.get(key)
  }
}
module.exports.Storage = Storage
