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
        transactionPool: Array.from(node.transactionPool),
        nodesInNetwork: Array.from(node.nodesInNetwork)
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
                    data: {nodeURL}
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
            data: availableNodes
        })

        res.json({ message: response.data })

    } catch (err) {

    }

})
// registers new network node in network with the available nodes in the network.
router.post("/node_in_network", (req, res) => {

    const nodeInNetwork = req.body

    if (node.nodeURL !== nodeInNetwork['nodeURL']) node.nodesInNetwork.add(nodeInNetwork['nodeURL'])
    
    res.end()
})

// registers available network nodes in the network with the new node in the network.
router.post("/available_nodes", (req, res) => {

    const availableNodesInNetwork = req.body
    for (let nodeURL of availableNodesInNetwork) {
        if (nodeURL !== node.nodeURL) node.nodesInNetwork.add(nodeURL)
    }
    res.send(`node at ${node.nodeURL} can now participate.`)
})
// creates transaction in the blockchain &
//  broadcastes it to nodes available in the network.
router.post("/transaction", async (req, res) => {
    const { sender, recipient, amount, msg } = newNodeInNetworkURL
    try {
        const transaction = await Node.transaction(sender, recipient, amount, msg)
        
    } catch (err) {

    }
})


module.exports = router;
