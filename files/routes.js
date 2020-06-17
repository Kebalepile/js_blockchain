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

// returns GUI, to interact with the blockchain.
router.get("/blockchain_explorer", (req, res) => {
    res.send("blockchain explorer.")
})
// returns api details.
router.get("/", (req, res) => res.json(details));

// returns entire Node with its copy of the blockchain.
router.get("/node", (req, res) => {

    res.json({
        ...node,
        chain: Object.fromEntries(node.chain),
        transactionPool: [...node.transactionPool],
        nodesInNetwork: [...node.nodesInNetwork],
        hashedchain: node.hashChain()
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

// NB router not yet tested.
router.get("/address", (req, res) => {
    const { q } = req.query
    const data = node.addressData(q)
    res.json(data)
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
// adds a broadcasted trasaction to transaction pool 
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
                data: { block, hashedchain: this.hashedchain }
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
    const { block, hashedchain } = req.body
    const isPreviousBlockIndex = (block.header['index'] - 1) === node.lastBlock.header['index']
    const isPreviousBlockHash = block.header['previousBlockHash'] === node.lastBlock.header['hash']

    switch (isPreviousBlockIndex && isPreviousBlockHash) {
        case true:
            node.chain.set(block.header['id'], block)
            node.hashedchain = hashedchain
            node.lastBlock = block
            node.transactionPool = new Set()
            res.json({ bool: true })
            break
        default:
            res.json({ bool: false })
            break
    }
})
// NB router not yet tested.
// returns a block from the blockchain.
router.get("/block", (req, res) => {
    const { id } = req.query
    const block = node.getBlock(id)
    res.json({ block })
})

// nodes in network validate which chain is the correct one.
router.get("/consensus", async (req, res) => {
    const getNodes = []

    let longestChainAccepted = 0
    let longestChainRejected = 0
    let longestChain = null
    let longestChainLength = node.chain.size //returns map length
    let transactionPool = null

    // find longest chain.
    const xNodesBlockchain = xNode => {
        if (Object.entries(xNode.chain).length > longestChainLength) {
            longestChain = xNode
            console.log(Object.entries(xNode.chain).length)
            longestChainLength = Object.entries(xNode.chain).length
            transactionPool = xNode.transactionPool
        }
    }

    // determine if longest chain is correct chain,
    // by comparing its hashed blockchian with that of other nodes in the network.
    const isCorrectChain = longestChain => {
        return function (xNode) {
            switch (xNode.hashedchain === longestChain.hashedchain) {
                case true:
                    longestChainAccepted++
                    break
                case false:
                    longestChainRejected++
                    break
            }
        }
    }

    const loopNodes = (arr, fn) => {
        for (var node of arr) fn(node)
    }

    try {
        for (let nodeURL of node.nodesInNetwork) {
            let opt = {
                method: 'get',
                url: `${nodeURL}/api/node`
            }
            getNodes.push(axios(opt))

        }

        let Nodes = await Promise.all(getNodes)

        Nodes = await Nodes.reduce((accumulator, current) => {

            accumulator.push(current.data)

            return accumulator
        }, [])

        if (Nodes.length > 0) loopNodes(Nodes, xNodesBlockchain)

        if (longestChain) {
            let consensus = isCorrectChain(longestChain)
            loopNodes(Nodes, consensus)
        }
        // const DontReplaceNodeBlockchain = !longestChain || longestChainAccepted < longestChainRejected
        const ReplaceNodeBlockchain = longestChain && longestChainAccepted > longestChainRejected

        if (ReplaceNodeBlockchain) {
            // turn chain Object to Map.
            node.chain = new Map(Object.entries(longestChain.chain))
            // update nodes trasactionPool.
            transactionPool.forEach(transaction => {
                if (!node.transactionPool.has(transaction)) node.transactionPool.add(transaction)
            })
            // update nodes "nodesInNetwork" Set.
            longestChain.nodesInNetwork.forEach(nodeURL => {
                if (nodeURL !== node.nodeURL && !node.nodesInNetwork.has(nodeURL)) {
                    node.nodesInNetwork.add(nodeURL)
                }
            })
            // update nodes last mined blockchain.
            node.lastBlock = longestChain.lastBlock
            res.json({
                msg: "node's blockchain replaced."
            })
        } else {
            res.json({
                msg: "node's blockchain not replaced."
            })
        }

    }
    catch (err) { }
})

module.exports = router;
