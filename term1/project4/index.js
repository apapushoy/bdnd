const express = require('express')
const bodyParser = require('body-parser')
const Chain = require('./chain')
const Mempool = require('./mempool')
const hex2ascii = require('hex2ascii')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const port = 8000

const mempool = new Mempool()

function updateBlockWithDecodedStory (block) {
  block.body.star.storyDecoded = hex2ascii(block.body.star.story)
}

async function getRegistrationByNumber (chain, height) {
  let block = await chain.getBlock(height)
  updateBlockWithDecodedStory(block)
  return block
}

const main = async () => {
  const logLevel = 1 // 0, 1, or 2
  const chain = await Chain.loadChainFrom('./chaindata', logLevel)
  console.log('chain initialised')

  app.post('/requestValidation', async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      res.send({ 'error': 'must provide body' })
    }
    res.send(mempool.addForValidation(req.body))
  })

  app.post('/message-signature/validate', async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      res.send({ 'error': 'must provide body' })
    }
    res.send(mempool.validateRequestByWallet(req.body))
  })

  function makeRegistration (req) {
    let star = req.body.star
    return {
      address: req.body.address,
      star: {
        ra: star.ra,
        dec: star.dec,
        story: Buffer.from(star.story).toString('hex')
      }
    }
  }

  app.post('/block', async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      res.send({ 'error': 'must provide body' })
    }
    if (Array.isArray(req.body.star)) res.send({ 'error': 'can only register a single star' })
    if (mempool.isValidRegistration(req.body.address)) {
      var regNum = null
      try {
        regNum = await chain.addData(makeRegistration(req))
        try {
          res.send(await getRegistrationByNumber(chain, regNum))
        } catch (e) {
          res.send({ 'error': `registered star with index ${regNum}, but failed to retrieve` })
        }
      } catch (e) {
        res.send({ 'error': 'failed to register due to internal error' })
        console.log('internal error', e)
      } finally {
        mempool.completeRegistration(req.body.address)
      }
    } else {
      res.send({ 'error': 'invalid registration. please validate first' })
    }
  })

  app.get('/stars/hash::hash', async (req, res) => {
    try {
      let block = await chain.getBlockByHash(req.params.hash)
      updateBlockWithDecodedStory(block)
      res.send(block)
    } catch (e) {
      res.send({ 'error': 'no such registration' })
    }
  })

  app.get('/stars/address::address', async (req, res) => {
    try {
      let blocks = await chain.getByWalletAddress(req.params.address)
      blocks.forEach(updateBlockWithDecodedStory)
      res.send(blocks)
    } catch (e) {
      res.send({ 'error': 'no registrations at this address' })
    }
  })

  app.get('/block/:blockNum', async (req, res) => {
    try {
      res.send(await getRegistrationByNumber(chain, req.params.blockNum))
    } catch (e) {
      res.send({ 'error': 'no registration found at this height: ' + req.params.blockNum })
    }
  })

  app.listen(port, () => console.log(`listening on port ${port}!`))
}
main()
