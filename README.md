## Main files

### index.js

Pipes files from files directory into uploadPullStream and prints success/error message.

### upload-pull-stream.js

Returns a pull-stream that takes messages from a source, uploads them to IPFS, and writes an array of CIDs if it is successful. 

## Pull-streams

I chose pull-streams for few reasons. First, streams allow us to handle arbitrarily large event streams by handling back pressure for us. And I chose pull-streams over native Node streams because pull-streams allow us to pipe together functions while handling errors in one place, as opposed to handling errors at each pipe. Lastly, IPFS also uses pull-streams heavily (see this issue for more details on their decision to use them: https://github.com/ipfs/js-ipfs/issues/362).
