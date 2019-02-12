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
const devBypassValidation = false

function updateBlockWithDecodedStory (block) {
  block.body.star.storyDecoded = hex2ascii(block.body.star.story)
}

const main = async () => {
  const logLevel = 1 // 0, 1, or 2
  const chain = await Chain.loadChainFrom('./chaindata', logLevel)
  console.log('chain initialised')

  app.post('/requestValidation', async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      res.send(JSON.stringify({ 'error': 'must provide body' }))
    }
    res.send(JSON.stringify(mempool.addForValidation(req.body)))
  })

  app.post('/message-signature/validate', async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      res.send(JSON.stringify({ 'error': 'must provide body' }))
    }
    res.send(JSON.stringify(mempool.validateRequestByWallet(req.body)))
  })

  app.post('/block', async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      res.send(JSON.stringify({ 'error': 'must provide body' }))
    }
    if (Array.isArray(req.body.star)) res.send(JSON.stringify({ 'error': 'can only register a single star' }))
    if (devBypassValidation || mempool.isValidRegistration(req.body.adress)) {
      let star = req.body.star
      let body = {
        address: req.body.address,
        star: {
          ra: star.ra,
          dec: star.dec,
          story: Buffer.from(star.story).toString('hex')
        }
      }
      let blockHeight = await chain.addData(body)
      let newBlock = await chain.getBlock(blockHeight)
      updateBlockWithDecodedStory(newBlock)
      res.send(JSON.stringify(newBlock))
    } else {
      res.send(JSON.stringify({ 'error': 'invalid registration. please register first' }))
    }
  })

  app.get('/stars/hash::hash', async (req, res) => {
    try {
      let block = await chain.getBlockByHash(req.params.hash)
      updateBlockWithDecodedStory(block)
      res.send(JSON.stringify(block))
    } catch (e) {
      res.send(JSON.stringify({ 'error': 'no such block' }))
    }
  })

  app.get('/stars/address::address', async (req, res) => {
    try {
      let blocks = await chain.getByWalletAddress(req.params.address)
      blocks.forEach(updateBlockWithDecodedStory)
      res.send(JSON.stringify(blocks))
    } catch (e) {
      res.send(JSON.stringify({ 'error': 'no blocks registered to this address' }))
    }
  })

  app.get('/block/:blockNum', async (req, res) => {
    try {
      let block = await chain.getBlock(req.params.blockNum)
      updateBlockWithDecodedStory(block)
      res.send(JSON.stringify(block))
    } catch (e) {
      res.send(JSON.stringify({ 'error': 'no block found at this height: ' + req.params.blockNum }))
    }
  })

  app.listen(port, () => console.log(`'listening on port ${port}!`))
}
main()
