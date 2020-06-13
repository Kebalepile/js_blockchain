// network routes used to communicate with nodes,
// avaliable on the blockchain network
const router = require("express").Router(),
    { nanoid } = require("nanoid"),
    nodeAddress = nanoid(),
    Node = require("../files/Node"),
    Bitecoin = new Node(nodeAddress),
    axios = require("axios"),
    { details } = require("../files/apiDetails");

// returns api details.
router.get("/", (req, res) => res.json(details));

// returns entire Node blockchain.
router.get("/blockchain", (req, res) => {

    res.send({
        ...Bitecoin,
        chain: Object.fromEntries(Bitecoin.chain),
        transactionPool: Array.from(Bitecoin.transactionPool),
        nodesInNetwork: Array.from(Bitecoin.nodesInNetwork)
    })
})

// announce node to available nodes in the network.
router.post("/broadcast_node", async (req, res) => {
    let { nodeURL } = req.body
    let requestPromise = []
    let nodeURLNotCurrentNode = nodeURL !== Bitecoin.nodeURL
    let nodeNotInNetwork = Bitecoin.nodesInNetwork.has(nodeURL)


    try {
        if (nodeURLNotCurrentNode && !nodeNotInNetwork) {

            for (let nodeNetworkURL of Bitecoin.nodesInNetwork) {
                let opt = {
                    method: 'post',
                    url: `${nodeNetworkURL}/api/node_in_network`,
                    body: nodeURL
                }

                requestPromise.push(axios(opt))
            }
            // add new node to nodesInNetwork set.
            Bitecoin.nodeURL.add(nodeURL)
        }

        //  add array of Booleans
        let resData = await Promise.all(requestPromise)
        console.log(resData)
        let expected = Bitecoin.nodesInNetwork.size === resData.length
        let accepted = 0
        let rejected = 0

        if (expected) {
            resData.forEach(bool => bool ? accepted++ : rejected++)
        }

        switch (accepted > rejected) {
            case true:
                let availableNodes = Array.from(Bitecoin.nodesInNetwork)

                axios({
                    method: 'post',
                    url: `${nodeURL}/api/available_nodes`,
                    body: availableNodes
                })

                res.json({ msg: `node at ${nodeURL} can now participate.` })
                break
            default:
                Bitecoin.nodesInNetwork.delete(nodeURL)
                res.json({ msg: `node at ${nodeURL} rejected.` })
        }

    } catch (err) {

    }

})
// registers new network node in network with the available nodes in the network.
router.post("/node_in_network", (req, res) => {
    console.log(req)
    let newNodeInNetworkURL = req.body

    if (Bitecoin.nodeURL !== newNodeInNetworkURL) Bitecoin.nodesInNetwork.add(newNodeInNetworkURL)

    switch (Bitecoin.nodesInNetwork.has(newNodeInNetworkURL)) {
        case true:
            res.send(true)
            break
        default:
            res.send(false)
            break
    }
})

// registers available network nodes in the network with the new node in the network.
router.post("/available_nodes", (req, res) => {
    let availableNodesInNetwork = req.body
    for (let nodeURL of availableNodesInNetwork) {
        if (nodeURL !== Bitecoin.nodeURL) Bitecoin.nodesInNetwork.add(nodeURL)
    }
    res.end()
})
// creates transaction in the blockchain &
//  broadcastes it to nodes available in the network.
router.post("/transaction", async (req, res) => {
    let { sender, recipient, amount, msg } = newNodeInNetworkURL
    try {
        let transaction = await Node.transaction(sender, recipient, amount, msg)

    } catch (err) {

    }
})


module.exports = router;
