let Blockchain = require("../../files/blockchain"),
  should = require("chai").should(),
  { assert } = require("chai"),
  {
    makeTransactions,
    addToTransactionPool,
    toArray
  } = require("../test_utils/xFunction");

// Run each context separately. else test(s) may clash & fail.
describe("Bitecoin Blockchain Tests.", () => {
  let Bitecoin;

  before(() => {
    // blockchian instance
    Bitecoin = new Blockchain();
  });

  xcontext("Blockchain instance", () => {
    it("should return instance of Blockchain", () => {
      // console.log(Bitecoin)
      assert(Bitecoin instanceof Blockchain, true);
    });
  });
  xcontext("Genesis Block", () => {
    it("should return mined Genesis Block", () => {
      const GenesisBlock = Bitecoin.genesisBlock;
      // console.log(GenesisBlock)
      GenesisBlock.should.be.an("object");
    });
  });
  xcontext("Add Transaction(s) to Transaction(s) pool", () => {
    it("Bitecoin blockchain should have 6 pending transactions in transaction pool", () => {
      const transactions = makeTransactions(Bitecoin, 6);

      addToTransactionPool(Bitecoin, transactions);

      console.dir(transactions);

      assert.strictEqual(Bitecoin.transactionPool.size, 6);
    });
  });

  xcontext("Mine block with Proof of Work algorthm.", () => {
    it("Blockchain should mine a block.", () => {
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
  context("Get transaction from mined block by transaction id", () => {
    it("should return transaction from blockchain", () => {
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

      const transactionResponse = Bitecoin.getTransaction(transaction.id);

      console.log(transactionResponse);

      assert.strictEqual(transactionResponse.id, transaction.id);
    });
  });

  xcontext("Get block by ID from Bitecoin blockchain", () => {
    it("should return mined block from blockchain", () => {
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

  xcontext("X-address data", () => {
    it("should return transaction data linked to x address", () => { });
  });
});
