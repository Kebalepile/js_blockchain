const { nanoid } = require('nanoid'),
  sha256 = require('sha256')


// blockchain data structure.
class Blockchain {
  #genesisBlock
  constructor(address) {
    this.nodeAddress = address

    this.chain = new Map([['0000', {
      header: {
        index: 1,
        id: "0000",
        nonce: 0,
        hash: '0',
        previousBlockHash: '0',
        minedBy: '0',
        timeStamp: 1592144437358
      },
      transactions: []
    }]])
    this.hashedchain = this.hashChain()
    this.transactionPool = new Set()

    this.genesisBlock = this.chain.get('0000')
    // holds last block mined in the network.
    this.lastBlock = this.genesisBlock

  }
  getGenesisBlock() {
    return this.genesisBlock
  }
  // returns a hash version of the blockchain.
  hashChain() {

    try {
      let data

      for (var block of this.chain.entries()) data += block.toString()

      return sha256(data)
    } catch (err) {

    }
  }
  // NB Method not yet tested.
  // retrive data associated with given address.
  addressData(address) {
    let somethingFound = false,
      data = {
        coinsSpent: [],
        coinsRecieved: []
      }

    for (var block of this.chain.values()) {
      for (var transaction of block.transactions) {
        if (transaction.sender === address) {
          data['coinsSpent'].push(transaction)
          somethingFound = true
        } else if (transaction.recipient === address) {
          data['coinsRecieved'].push(transaction)
          somethingFound = true
        }
      }
    }

    switch (somethingFound) {
      case true:
        return data
      default:
        return {
          message: `${address} has no associated transactions to it.`
        }
    }
  }
  // creates a transaction in the blockchain.
  transaction(sender,
    recipient,
    amount,
    message = null) {
    // initiates a transaction to be broadcasted before being
    // addes to transaction pool nor mined block.
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
  // retrive transaction by ID.
  getTransaction(id) {

    let match
    for (let block of this.chain.values()) {
      for (let transaction of block.transactions) {
        if (transaction['id'] === id)
          match = { transaction, found: true }
        break
      }
    }
    // test logic.
    return match ? match['transaction'] : `Sorry transaction with ID ${id} not found.`
  }

  //  retrive block by block id.
  getBlock(id) {
    let blockFound
    for (var key of this.chain.keys()) {
      if (key === id) {
        blockFound = this.chain.get(id)
        break
      }
    }
    return blockFound ? blockFound : `Block with id ${id}, not found.`
  }
  // creates new block to be added to chain.
  mineBlock(nonce, previousBlockHash, hash) {
    let block = {
      header: {
        index: this.chain.size + 1,
        id: nanoid(),
        nonce,
        hash,
        previousBlockHash,
        minedBy: this.nodeAddress,
        timeStamp: Date.now(),
      },
      transactions: Array.from(this.transactionPool),
    }
    // access chain object like this so it does not throw a typeError.
    this.chain.set(block.header.id, block)
    this.transactionPool = new Set()
    this.lastBlock = block
    return block
  }
  // hashs specific block contents, deemed important hash creation.
  hashBlock(previousBlockHash,
    blockdata,
    nonce) {
    // must be a string!
    let data = previousBlockHash + JSON.stringify(blockdata) + nonce
    return sha256(data)
  }
  // Proof Of Work is the mining algorthm being utilized here,
  //  hash must start with '0000', before block can be mined.
  PoW(previousBlockHash, blockdata) {
    let nonce = 100,
      hash = this.hashBlock(previousBlockHash, blockdata, nonce)

    while (hash.substring(0, 4) !== '0000') {
      nonce++
      hash = this.hashBlock(previousBlockHash, blockdata, nonce)
      // console.log(hash)
    }

    return nonce
  }

}

// prevents further addition of any property to object.
Object.freeze(Blockchain)

module.exports = Blockchain
