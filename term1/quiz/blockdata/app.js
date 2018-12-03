const explorer = require('blockexplorer')

async function getBlockAsync (index) {
  const hashstr = await explorer.blockIndex(index)
  const hash = JSON.parse(hashstr).blockHash
  console.log(hash)
  return explorer.block(hash)
}

function getBlock (index) {
  return getBlockAsync(index).then(v => console.log(JSON.parse(v)))
}

(function theLoop (i) {
  setTimeout(() => {
    getBlock(i)
    ++i
    if (i < 3) theLoop(i)
  },
  3600)
})(0)
