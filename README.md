## Javascript blockchain emulator.

This is a blockchain emulator, that applies the CAP (Consistency, Availability & Partition ) theorem,
build using Nodejs, React, Webpack and Electron.

# Scriptchain
consists of a network for communication among-st nodes in the network.

any node in the network can be online/offline as long as there is a required odd number of nodes needed,
the blockchain will remain unaffected.

nodes can add end-user transactions to the transaction pool, mine a block using PoW (Proof Of Work) and propose the latter
to all nodes in the network, nodes in network will not accept proposed block, if block is mined by an illicit node(s) in the network.

nodes can determine with chain is correct via a consensus method where nodes calculate how many nodes have the same
hasedchain version of the blockchain, if node participates in consensus operation any node holding a hashedchain rejected by the majority nodes,
such node(s) blockchain, last block mined, transactions in transaction pool and genesis block will be replaced with the correct ones.

any node that successfully mines a block and it is accepted is rewarded with some script coin, a transaction is added automatically to 
the transaction pool recipient being the successful node.
## Instructions

1 git clone https://github.com/Kebalepile/js_blockchain.git

2 cd into folder, run npm install

3 active a minimum number of odd nodes scripts, in package.json (needed for blockchain to work properly)

4 must have curl/postman for http requests such as post methods, when making transactions or registering new node into the network.

if you need a proper walk through, do not hesitate to contact me via [Telegram](https://t.me/Keba23) or  [Readit](https://www.reddit.com/user/keba23/)


## options

you run interact with this blockchain via the CLI (which is a bit advanced for some noob(s)) or use the [electron version](https://github.com/Kebalepile/scriptchain),
which is very friendly, has a beautiful dark mode UI/UX node,
just follow the 6 simple read me instructions as [scriptchain/readme.md](https://github.com/Kebalepile/scriptchain).
