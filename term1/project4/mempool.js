const bitcoinMessage = require('bitcoinjs-message')
const TimeoutRequestsWindowTime = 5 * 60 * 1000
class Mempool {
  constructor () {
    this.pool = []
    this.timeouts = []
    this.valid = []
  }
  addForValidation (body) {
    const existingRequest = this.getRequestByAddress(body.address)
    if (existingRequest != null) {
      this.updateValidationTimeLeft(existingRequest)
      return existingRequest
    }

    const ts = new Date().getTime().toString().slice(0, -3)
    const newRequest = { 'walletAddress': body.address, 'requestTimeStamp': ts, 'message': `${body.address}:${ts}:starRegistry`, 'validationWindow': TimeoutRequestsWindowTime / 1000 }
    this.pool.push(newRequest)
    let self = this
    this.timeouts[newRequest.walletAddress] = setTimeout(() => { self.removeValidationRequest(newRequest.walletAddress) }, TimeoutRequestsWindowTime)

    return newRequest
  }
  // getHash (obj) {
  //   return SHA256(JSON.stringify(obj)).toString()
  // }
  updateValidationTimeLeft (req) {
    const ts = new Date().getTime().toString().slice(0, -3)
    let timeElapse = ts - req.requestTimeStamp
    let timeLeft = (TimeoutRequestsWindowTime / 1000) - timeElapse
    req.validationWindow = timeLeft
  }
  getRequestByAddress (addr) {
    for (var i = 0; i < this.pool.length; ++i) {
      if (this.pool[i].walletAddress === addr) return this.pool[i]
    }
    return null
  }
  removeValidationRequest (address) {
    for (var i = 0; i < this.pool.length; ++i) {
      if (this.pool[i].walletAddress === address) {
        this.pool.splice(i, 1)
        console.log(`removed validation request for ${address}`)
      }
    }
  }
  validateRequestByWallet (req) {
    const existingRequest = this.getRequestByAddress(req.address)
    if (existingRequest == null) {
      return { 'error': 'request not in validation queue' }
    }
    this.updateValidationTimeLeft(existingRequest)
    if (existingRequest.validationWindow <= 0) {
      return { 'error': 'request expired. please resubmit for validation' }
    }
    if (bitcoinMessage.verify(existingRequest.message, req.address, req.signature)) {
      let reg = this.makeStarRegistration(existingRequest)
      this.valid.push(reg)
      this.removeValidationRequest(existingRequest.walletAddress)
      return reg
    } else {
      return { 'error': 'invalid signature' }
    }
  }
  makeStarRegistration (req) {
    var reg = {}
    reg.registerStar = true
    reg.status = {
      address: req.walletAddress,
      requestTimeStamp: req.requestTimeStamp,
      message: req.message,
      validationWindow: req.validationWindow,
      messageSignature: true
    }
    return reg
  }
  isValidRegistration (addr) {
    for (var i = 0; i < this.valid.length; ++i) {
      if (this.valid[i].status.address === addr && this.valid[i].status.messageSignature === true) return true
    }
    return false
  }
}
module.exports = Mempool
