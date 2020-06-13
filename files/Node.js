const Blockchain = require("./Blockchain")
// console.log(process.argv)
class Node extends Blockchain {
    constructor(address, port= process.argv[2] || 3000) {
        super(address)
        this.nodeURL = `http://localhost:${port}`
        this.nodesInNetwork = new Set()
    }
}

Object.freeze(Node)

module.exports = Node