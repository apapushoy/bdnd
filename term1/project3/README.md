# RESTful private blockchain API
Provides ability to add/query data on a private blockchain.
## Endpoints
### GET /block
Given a parameter, which is a block number, returns the corresponding block in JSON format. Non-existent block numbers will be rejected and return an error message instead.
### POST /block
Given a JSON-encoded object containing a `body` property, adds a new block to the chain, whose body is the body of the input.
Request without body will be rejected.
## Deployment
### Frameworks
* node.js
* express.js
* level db
* crypto.js
* body-parser
