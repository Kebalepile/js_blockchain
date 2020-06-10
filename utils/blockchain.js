const { nanoid } = require('nanoid'),
  sha256 = require('sha256')

// blockchain data structure
class Blockchain {
  constructor() {
    this.genesisBlock = this.mineBlock(100, '0', '0')

    this.lastBlock = this.genesisBlock

    this.chain = new Map()

    this.transactionPool = new Set()

    this.hashedChain = this.hashChain()

    this.nodeAddress = nanoid()

  }

  hashChain() {
    return sha256(this.chain)
  }
  // retrive data regarding x address
  addressData() {}

  transaction(sender, recipient, amount, message = null) {
    // initiates a transaction to be broadcasted before being
    // addes to transaction pool nor mined block
    let tnx = {
      id: nanoid(),
      sender,
      recipient,
      amount,
      message,
    }

    return tnx
  }
  addToTransactionPool(transaction) {
    this.transactionPool.add(transaction)
    return `transaction ${transaction.id}, maybe mine in any block post block number ${this.chain.size}, if transaction is valid.`
  }
  // retrive transaction by id if found
  getTransaction(id) {
    let transaction
    for (var block of this.chain.values()) {
      transaction = this.searchBlock(block, id)
      if (transaction.found) {
        transaction = transaction['tnx']
        break
      }
    }
    // test logic
    return transaction
      ? transaction
      : `Sorry transaction with ID ${id} not found.`
  }

  //search mined block for specific transaction
  searchBlock(block, id) {
    for (var tnx of block.values()) {
      if (tnx.id === id) return { tnx, found: true }
    }
  }
  //  retrive block by block hash
  getBlock(hash) {
    let blockFound
    for (var key of this.chain.keys()) {
      if (key === hash) {
        blockFound = this.chain.get(hash)
        break
      }
    }
    return blockFound ? blockFound : `Block with hash ${hash}, not found.`
  }
  // creates new block to be added to chain
  mineBlock(nonce, previousBlockHash, hash) {
    let block = {
      header: {
        id: nanoid(),
        nonce,
        hash,
        previousBlockHash,
        minedBy: this.nodeAddress,
        timeStamp: Date.now(),
      },
      transactions: this.transactionPool,
    }
    this.chain.add(hash, block)
    this.transactionPool = new Set()
    this.lastBlock = block
    return {
      block,
      msg: `block number ${this.size} mined.`,
      hash,
    }
  }
  // hashs specific block contents
  hashBlockData(previousBlockHash, blockdata, nonce) {
    let data = previousBlockHash + blockdata + nonce
    return sha256(data)
  }
  // Proof Of Work is the mining algorthm being utilized here.
  //  hash must start with '0000', before block can be mined.
  PoW(previousBlockHash, blockdata) {
    let nonce = 100,
      hash = this.hashBlockData(previousBlockHash, blockdata, nonce)

    while (hash.substring[(0, 4)] !== '0000') {
      nonce++
      hash = this.hashBlockData(previousBlockHash, blockdata, nonce)
    }

    return nonce
  }
}

// prevents further addition of any property to object
Object.freeze(Blockchain)

module.exports = Blockchain
