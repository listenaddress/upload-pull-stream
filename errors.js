'use strict'

exports.errUnexpectedCID = (cid, multihash) => {
  return new Error(`Dag CID didn't match multihash.\n` +
                   `CID: ${cid}\n` +
                   `Multihash: ${multihash}`);
}

exports.errUnexpectedFile = (input, output) => {
  return new Error(`Content retrieved doesn\'t match input.\n` +
                   `Input: ${input}\n` +
                   `Retrieved: ${output}`);
}
