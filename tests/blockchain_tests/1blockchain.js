const { assert } = require('chai')

let Blockchain = require('../../utils/blockchain'),
  should = require('chai').should(),
  xssert = require('chai').assert,
  { nanoid } = require('nanoid')

describe('Bitecoin Blockchain Tests.', () => {
  let Bitecoin

  before(() => {
    // blockchian instance
    Bitecoin = new Blockchain()
  })

  xcontext('Blockchain instance', () => {
    it('should return instance of Blockchain', () => {
      // console.log(Bitecoin)
      xssert(Bitecoin instanceof Blockchain, true)
    })
  })
  xcontext('Genesis Block', () => {
    it('should return mined Genesis Block', () => {
      let GenesisBlock = Bitecoin.genesisBlock
      // console.log(GenesisBlock)
      GenesisBlock.should.be.an('object')
    })
  })
  xcontext('Add Transaction(s) to Transaction(s) pool', () => {
    it('Bitecoin blockchain should have 6 pending transactions in transaction pool', () => {
      let i = 0,
        makeTransaction = (i) => {
          let amount = i * 20,
            transaction = Bitecoin.transaction(
              nanoid(),
              nanoid(),
              amount,
              `payment number ${i} of ${amount} Bitecoin.`,
            )
          console.log(`transaction number ${i} made.`)
          console.table(transaction)
          let res = Bitecoin.addToTransactionPool(transaction)
          console.log(res)
        }
      while (i !== 6) {
        i++
        makeTransaction(i)
      }

      xssert.equal(Bitecoin.transactionPool.size, 6)
    })
  })
  xcontext('Mine block', () => {
    it('Blockchain should mine a block', () => {})
  })
  xcontext('Get transaction from mined block by transaction id', () => {
    it('should return transaction from blockchain', () => {})
  })

  xcontext('Get block by ID from Bitecoin blockchain', () => {
    it('should return mined block from blockchain', () => {})
  })

  xcontext('X-address data', () => {
    it('should return transaction data linked to x address', () => {})
  })
})
