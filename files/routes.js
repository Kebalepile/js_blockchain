// network routes used to communicate with nodes,
// avaliable on the blockchain network
const router = require("express").Router(),
    { nanoid } = require("nanoid"),
    nodeAddress = nanoid(),
    Node = require("../files/Node"),
    newNode = new Node(nodeAddress),
    fetch = require("axios"),
    { details } = require("../files/apiDetails");

// returns api details.
router.get("/", (req, res) => res.json(details));

router.get("/blockchain", (req, res) => res.send(newNode))

module.exports = router;
