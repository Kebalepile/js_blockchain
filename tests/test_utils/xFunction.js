// contains reusebale functions to make test process, less code intensive.

const { nanoid } = require("nanoid")


// creates a number of required transactions to specified blockchain
module.exports.makeTransactions = (blockchain, numberOfTransactions = 1) => {
    // holds transactions made
    let transactions = new Set(),
        i = 0
    while (i !== numberOfTransactions) {
        i++
        transactions.add(
            blockchain.transaction(
                // sender address
                nanoid(),
                // recipient address
                nanoid(),
                // amount
                i * 20,
                // [message]
                `payment number ${i} of ${i * 20} Bitecoin`
            )
        )
    }

    return transactions
}


module.exports.addToTransactionPool = (blockchain, transactions) => {

    for (var transaction of transactions) blockchain.addToTransactionPool(transaction)
}

module.exports.toArray = set => Array.from(set)
