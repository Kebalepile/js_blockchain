module.exports.details =  {
    message: `Hi there, below are the api's available routes.`,
    routes: {
        details: {
            description: `Explains api routes.`,
            methods: `GET`,
            route: `http://localhost:${process.argv[2] || 3000}/api`
        },
        blockchain: {
            description: `Returns Blockchain.`,
            methods: `GET`,
            route: `http://localhost:${process.argv[2] || 3000}/api/blockchain`
        },
        transaction: {
            description: `Makes a transaction in the blockchain.`,
            methods: `POST`,
            route: `http://localhost:${process.argv[2] || 3000}/api/transaction`
        },
        address: {
            description: `Returns data relating to specified address parameter.`,
            methods: `GET`,
            route: `http://localhost:${process.argv[2] || 3000}/api/address?search=`
        },
        block: {
            description: `Returns a block from the blockchain of specified id.`,
            methods: `GET`,
            route: `http://localhost:${process.argv[2] || 3000}/api/block?id=`
        },
        mine: {
            description: `Mine initiates mining process (mine a new block to be added the blockchain)`,
            methods: `POST`,
            route: `http://localhost:${process.argv[2] || 3000}/api/mine`
        },
        consensus: {
            description: `Nodes available in the network determine which Blockchain is valid, then return valid Blockchain.`,
            methods: `GET`,
            route: `http://localhost:${process.argv[2] || 3000}/api/consensus`
        }
    }
}