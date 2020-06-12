const Blockchain = require("./Blockchain")

class Node extends Blockchain {
    constructor(address) {
        super(address)
    }
}

Object.freeze(Node)

module.exports = Node