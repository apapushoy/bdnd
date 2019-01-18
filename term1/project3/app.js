const express = require('express')
const bodyParser = require('body-parser')
const Chain = require('./chain')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const port = 8000

const main = async () => {
  const logLevel = 1 // 0, 1, or 2
  const chain = await Chain.loadChainFrom('./chaindata', logLevel)
  console.log('chain initialised')

  app.get('/block/:blockNum', async (req, res) => {
    try {
      let block = await chain.getBlock(req.params.blockNum)
      res.send(JSON.stringify(block))
    } catch (e) {
      res.send(JSON.stringify({ 'error': 'no such block' }))
    }
  })

  app.post('/block', async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      res.send(JSON.stringify({ 'error': 'must provide body' }))
    }
    let body = req.body.body
    let blockNum = await chain.addData(body)
    let block = await chain.getBlock(blockNum)
    res.send(JSON.stringify(block))
  })

  app.listen(port, () => console.log(`'listening on port ${port}!`))
}
main()
