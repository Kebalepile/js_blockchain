let Blockchain = require("../../files/Blockchain"),
  should = require("chai").should(),
  { assert } = require("chai"),
  {
    makeTransactions,
    addToTransactionPool,
    toArray
  } = require("../test_utils/xFunction"),
  {nanoid} = nanoid;

// Run each context separately. else test(s) may clash & fail.
describe("Bitecoin Blockchain Tests.", function () {
  let Bitecoin;

  before(function () {
    // blockchian instance
    Bitecoin = new Blockchain(nanoid());
    
  });

  xcontext("Blockchain instance", function () {
    it("should return instance of Blockchain", function () {
      
      // console.log(Bitecoin)
      assert(Bitecoin instanceof Blockchain, true);
    });
  });
  xcontext("Genesis Block", function () {
    it("should return mined Genesis Block", function () {
      const GenesisBlock = Bitecoin.genesisBlock;
      // console.log(GenesisBlock)
      GenesisBlock.should.be.an("object");
    });
  });
  xcontext("Add Transaction(s) to Transaction(s) pool", function () {
    it("Bitecoin blockchain should have 6 pending transactions in transaction pool", function () {
      const transactions = makeTransactions(Bitecoin, 6);

      addToTransactionPool(Bitecoin, transactions);

      console.dir(transactions);

      assert.strictEqual(Bitecoin.transactionPool.size, 6);
    });
  });

  xcontext("Mine block with Proof of Work algorthm.", function () {
    it("Blockchain should mine a block.", function () {
       // increasing mocha timeout as PoW may take longer time
       this.timeout(10000);
      console.log("Node at address  is mining... be paitent.");

      let transactions = toArray(makeTransactions(Bitecoin))

      addToTransactionPool(Bitecoin, transactions);

      const previousBlockHash = Bitecoin.lastBlock.header.hash;

      // can contain anything important for creating a hash
      // for the block to be mined.
      // transaction is must be an array of objects for hashing purposes.
      const blockdata = {
        index: Bitecoin.lastBlock.header.index + 1,
        transactions,
      };
      const nonce = Bitecoin.PoW(previousBlockHash, blockdata);

      const hash = Bitecoin.hashBlock(previousBlockHash, blockdata, nonce);

      const minedBlock = Bitecoin.mineBlock(nonce, previousBlockHash, hash);

      minedBlock.should.be.an("object");
    });
  });
  xcontext("Get transaction from mined block by transaction id", function () {
    it("should return transaction from blockchain", function () {
       // increasing mocha timeout as PoW may take longer time
       this.timeout(10000);
      let transactions = toArray(makeTransactions(Bitecoin)),
        [transaction] = transactions;

      addToTransactionPool(Bitecoin, transactions);

      const previousBlockHash = Bitecoin.lastBlock.header.hash;

      const blockdata = {
        index: Bitecoin.lastBlock.header.index + 1,
        transactions,
      };
      const nonce = Bitecoin.PoW(previousBlockHash, blockdata);

      const hash = Bitecoin.hashBlock(previousBlockHash, blockdata, nonce);

      Bitecoin.mineBlock(nonce, previousBlockHash, hash);

      let transactionResponse = Bitecoin.getTransaction(transaction.id);

      console.log(transactionResponse);

      assert.strictEqual(transactionResponse.id, transaction.id);
    });
  });

  xcontext("Get block by ID from Bitecoin blockchain", () => {
    it("should return mined block from blockchain", function () {
      // increasing mocha timeout as PoW may take longer time
      this.timeout(10000);
      let transactions = toArray(makeTransactions(Bitecoin))

      addToTransactionPool(Bitecoin, transactions);

      const previousBlockHash = Bitecoin.lastBlock.header.hash;

      const blockdata = {
        index: Bitecoin.lastBlock.header.index + 1,
        transactions
      };
      const nonce = Bitecoin.PoW(previousBlockHash, blockdata);

      const hash = Bitecoin.hashBlock(previousBlockHash, blockdata, nonce);
      // returns a obj with msg & blockId of mined block
      const { blockId } = Bitecoin.mineBlock(nonce, previousBlockHash, hash);

      const block = Bitecoin.getBlock(blockId)
      console.log(block)
      assert.strictEqual(blockId, block.header.id)
    });
  });

  xcontext("X-address data", function () {
    it("should return transaction data linked to x address", function () {
      
     });
  });
});
