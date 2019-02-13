const bitcoinMessage = require('bitcoinjs-message')
const TimeoutRequestsWindowTime = 5 * 60 * 1000
class Mempool {
  constructor () {
    this.pool = {}
    this.timeouts = {}
    this.valid = {}
  }
  addForValidation (body) {
    const existingRequest = this.getRequestByAddress(body.address)
    if (existingRequest != null) {
      this.updateValidationTimeLeft(existingRequest)
      return existingRequest
    }

    const ts = new Date().getTime().toString().slice(0, -3)
    const newRequest = { 'walletAddress': body.address, 'requestTimeStamp': ts, 'message': `${body.address}:${ts}:starRegistry`, 'validationWindow': TimeoutRequestsWindowTime / 1000 }
    this.pool[body.address] = newRequest
    let self = this
    this.timeouts[newRequest.walletAddress] = setTimeout(() => { self.removeValidationRequest(newRequest.walletAddress) }, TimeoutRequestsWindowTime)

    return newRequest
  }
  updateValidationTimeLeft (req) {
    const ts = new Date().getTime().toString().slice(0, -3)
    let timeElapse = ts - req.requestTimeStamp
    let timeLeft = (TimeoutRequestsWindowTime / 1000) - timeElapse
    req.validationWindow = timeLeft
  }
  getRequestByAddress (addr) {
    var req = this.pool[addr]
    if (req === undefined) return null
    return req
  }
  removeValidationRequest (address) {
    delete this.timeouts[address]
    delete this.pool[address]
    console.log(`removed validation request for ${address}`)
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
      let reg = this.makeStarValidation(existingRequest)
      this.valid[existingRequest.walletAddress] = reg
      this.removeValidationRequest(existingRequest.walletAddress)
      return reg
    } else {
      return { 'error': 'invalid signature' }
    }
  }
  makeStarValidation (req) {
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
    var valid = this.valid[addr]
    if (valid === undefined) return false
    return valid.status.messageSignature === true
  }
  completeRegistration (addr) {
    delete this.valid[addr]
  }
}
module.exports = Mempool
