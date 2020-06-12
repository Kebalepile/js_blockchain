// network api, connects nodes.

const api = require("express")(),
    bodyParser = require("body-parser"),
    routes = require("./files/routes"),
    port = process.argv[2] || 3000

api.use(bodyParser.json())
api.use(bodyParser.urlencoded({ extended: false }))

api.use('/api', routes)
// fallback for any path that returns a 404
api.all(/(^\/.{0,})/, (req, res) => res.redirect(301, '/api'))

api.listen(port, () => console.log(`listening on http://localhost:${port}`))

