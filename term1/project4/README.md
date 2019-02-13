# RESTful star registry service implemented on a private blockchain
Provides ability to register and query star registrations via an API.
## Endpoints
### POST /requestValidation
This initiates the process to verify that you own the wallet address.
The given wallet `address` is entered into a validation process. This method returns a `message` that must be signed by the given address within 5 minutes. The remaining time (in seconds) is indicated by the returned validationWindow property. Subsequent requests will indicate the remaining time.
### POST /message-signature/validate
This concludes the process to verify that you own the wallet address.
You must provide the: `address` that was used to `message` provided by requestValidation method; the `signature`, which is the result of signing the message with that address.
### POST /block
Registers the star to the validated wallet address. The request is of form { address: xxxxx, star: { dec: xxx, ra: xxx, story: xxx } }
You (or anyone else on your behalf) can submit a single star per request.
### GET /block/<num>
Retrieve registration block by height.
### GET /stars/hash:<hash>
Retrieve registration block by its hash.
### GET /stars/address:<addr>
Retrieve stars registered to the specified address.
## Deployment
### Frameworks
* node.js
* express.js
* level db
* crypto.js
* body-parser
