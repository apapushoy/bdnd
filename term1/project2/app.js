const Chain = require('./chain')

const main = async () => {
  const chain = await Chain.loadChainFrom('./chaindata', 1)
  await chain.addData('yes')
  await chain.addData('no')
  await chain.addData('maybe')
  console.log('chain validity: ' + await chain.validateChain())

  var b = await chain.getBlock(2)
  b.body = 'something else'
  await chain._modifyBlock(2, b)
  console.log('chain validity: ' + await chain.validateChain())
}
main()
