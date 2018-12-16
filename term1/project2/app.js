const Chain = require('./chain')

const main = async () => {
  const logLevel = 1 // 0, 1, or 2
  const chain = await Chain.loadChainFrom('./chaindata', logLevel)
  for (var i = 0; i < 10; ++i) {
    await chain.addData('Test block ' + i)
  }
  console.log('chain validity: ' + await chain.validateChain())

  var b = await chain.getBlock(5)
  b.body = 'something else'
  await chain._modifyBlock(5, b)
  console.log('chain validity: ' + await chain.validateChain())
}
main()
