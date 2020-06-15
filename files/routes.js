// network routes used to communicate with nodes,
// avaliable on the blockchain network
const router = require("express").Router(),
    { nanoid } = require("nanoid"),
    nodeAddress = nanoid(),
    // node class
    NodeClass = require("../files/Node"),
    // node instance
    node = new NodeClass(nodeAddress),
    axios = require("axios"),
    { details } = require("../files/apiDetails");

// returns api details.
router.get("/", (req, res) => res.json(details));

// returns entire Node with its copy of the blockchain.
router.get("/node", (req, res) => {
    // node.hashChain()
    // .then(hash => {
    //     console.log(hash)
    // })
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

                availableNodes
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
    const nodeNotAlreadyInNodesInNetwork = !node.nodesInNetwork.has(nodeInNetwork)
    const isNotCurrentNodeURL = node.nodeURL !== nodeInNetwork['nodeURL']

    if (isNotCurrentNodeURL && nodeNotAlreadyInNodesInNetwork) {
        node.nodesInNetwork.add(nodeInNetwork['nodeURL'])
    }

    res.end()
})

// updates new nodes transaction pool.
// updates new nodes hasedChain.
// adds available nodes in the network
//  to the new nodes's 'nodesInNetwork' in the network.
router.post("/available_nodes", (req, res) => {

    const { availableNodes } = req.body

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


// node mines a block then broadcasts it
// to nodes available in the network.
router.get("/mine", async (req, res) => {
    const transactionPool = node.transactionPool
    const previousBlockHash = node.lastBlock.header['hash']

    const blockdata = {
        index: node.lastBlock.header['index'] + 1,
        transactions: [...node.transactionPool]
    }

    const nonce = node.PoW(previousBlockHash, blockdata)

    const hash = node.hashBlock(previousBlockHash, blockdata, nonce)

    const block = node.mineBlock(nonce, previousBlockHash, hash)

    const blockProposition = []
    try {
        node.nodesInNetwork.forEach(nodeURL => {
            let opt = {
                method: 'post',
                url: `${nodeURL}/api/block_proposition`,
                data: { block }
            }

            blockProposition.push(axios(opt))
        })

        let responses = await Promise.all(blockProposition)

        responses = await responses.reduce((accumulator, current) => {
            if (current['data']['bool']) {
                accumulator['accept']++
            } else {
                accumulator['reject']++
            }
            return accumulator
        }, { accept: 0, reject: 0 })

        const { accept, reject } = await responses

        switch (accept > reject) {
            case true:
                axios({
                    method: 'post',
                    url: `${node.nodeURL}/api/transaction`,
                    data: {
                        sender: "00",
                        recipient: node.nodeAddress,
                        msg: `mine reward for ${node.nodeAddress}, 
                   for mining block ${block.header.id}`
                    }
                })
                res.json({ msg: "proposed block successfully accepted." })
                break
            default:
                node.chain.delete(block.header.id)
                node.transactionPool = transactionPool
                res.json({ msg: "proposed block rejected." })
                break
        }
    } catch (err) {

    }

})

// verifies proposed block 
router.post("/block_proposition", (req, res) => {
    const { block } = req.body
    const isPreviousBlockIndex = (block.header['index'] - 1) === node.lastBlock.header['index']
    const isPreviousBlockHash = block.header['previousBlockHash'] === node.lastBlock.header['hash']

    switch (isPreviousBlockIndex && isPreviousBlockHash) {
        case true:
            node.chain.set(block.header['id'], block)
            node.lastBlock = block
            node.transactionPool = new Set()
            res.json({ bool: true })
            break
        default:
            res.json({ bool: false })
            break
    }
})

// nodes in network validate which chain is the correct one.
router.get("/consensus", (req, res) => {

})

module.exports = router;
