// network routes used to communicate with nodes,
// avaliable on the blockchain network
const router = require("express").Router(),
    { nanoid } = require("nanoid"),
    nodeAddress = nanoid(),
    // node class
    Node = require("../files/Node"),
    // node instance
    node = new Node(nodeAddress),
    axios = require("axios"),
    { details } = require("../files/apiDetails");

// returns api details.
router.get("/", (req, res) => res.json(details));

// returns entire Node with its copy of the blockchain.
router.get("/node", (req, res) => {

    res.json({
        ...node,
        chain: Object.fromEntries(node.chain),
        transactionPool: [...node.transactionPool],
        nodesInNetwork: [...node.nodesInNetwork]
    })
})

// announce node to available nodes in the network.
router.post("/broadcast_node", async (req, res) => {
    const { nodeURL } = req.body
    const alertNodesInNetwork = []
    const nodeURLNotnode = nodeURL !== node.nodeURL
    const nodeNotInNetwork = node.nodesInNetwork.has(nodeURL)


    try {
        if (nodeURLNotnode && !nodeNotInNetwork) {

            for (let nodeNetworkURL of node.nodesInNetwork) {

                let opt = {
                    method: 'post',
                    url: `${nodeNetworkURL}/api/node_in_network`,
                    data: { nodeURL }
                }

                alertNodesInNetwork.push(axios(opt))
            }
            node.addNode(nodeURL)
        }
        // call all node URLs in the array
        Promise.all(alertNodesInNetwork)
        // list of nodes current node is connceted to in the network.
        const availableNodes = [...node.nodesInNetwork, node.nodeURL]

        const response = await axios({
            method: 'post',
            url: `${nodeURL}/api/available_nodes`,
            data: {
                chain: Object.fromEntries(node.chain),
                hashedChain: node.hashedChain,
                availableNodes,
                transactionPool: [...node.transactionPool]
            }
        })

        res.json({ message: response.data })

    } catch (err) {

    }

})
// registers new node in network with
//  the available nodes in the network.
router.post("/node_in_network", (req, res) => {

    const nodeInNetwork = req.body

    if (node.nodeURL !== nodeInNetwork['nodeURL']) {
        node.nodesInNetwork.add(nodeInNetwork['nodeURL'])
    }

    res.end()
})

// updates new nodes transaction pool.
// updates new nodes hasedChain.
// adds available nodes in the network
//  to the new nodes's 'nodesInNetwork' in the network.
router.post("/available_nodes", (req, res) => {

    const { availableNodes,
        hashedChain,
        transactionPool } = req.body

    node.hashedChain = hashedChain

    for (let transaction of transactionPool) {
        if (!node.transactionPool.has(transaction)) {
            node.addToTransactionPool(transaction)
        }
    }
    for (let nodeURL of availableNodes) {
        if (nodeURL !== node.nodeURL) {
            node.nodesInNetwork.add(nodeURL)
        }
    }
    res.send(`node at ${node.nodeURL} can now participate.`)
})
// creates transaction in the blockchain &
//  broadcastes it to nodes available in the network.
router.post("/transaction", async (req, res) => {
    const { sender, recipient, amount, msg } = req.body

    try {
        // create a transaction in the blockchain.
        const transaction = node.transaction(sender, recipient, amount, msg)

        // add transaction to transaction pool, 
        // of node which initialzed transaction.
        const message = node.addToTransactionPool(transaction)

        const updateTransactionPool = []

        node.nodesInNetwork.forEach(nodeURL => {
            let opt = {
                method: "post",
                url: `${nodeURL}/api/transaction_pool`,
                data: { transaction }
            }
            updateTransactionPool.push(axios(opt))
        })

        await Promise.all(updateTransactionPool)

        res.json({ message, transaction })
    } catch (err) {

    }
})
// adds a bordcasted trasaction to transaction pool 
// of each node available in the network.
router.post("/transaction_pool", (req, res) => {
    const { transaction } = req.body

    if (!node.transactionPool.has(transaction)) node.addToTransactionPool(transaction)

    res.end()
})


module.exports = router;
