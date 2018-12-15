'use strict'

const pull = require('pull-stream')
const paramap = require('pull-paramap')
const hash = require('./hash')

const {
  errUnexpectedFile,
  errUnexpectedCID
} = require('./errors')

let node
let FilesAPI

module.exports = (localNode, remoteAPI) => {
  node = localNode
  FilesAPI = remoteAPI

  return pull(
    pull.asyncMap(create),
    pull.asyncMap(put),
    paramap(add, 25)
  )
}

function create (data, cb) {
  hash(data, (err, dagNode) => {
    if (err) cb(err)
    else cb(null, { dagNode: dagNode, data: data })
  })
}

function put (data, cb) {
  node.dag.put(data.dagNode, {
    format: 'dag-pb',
    hashAlg: 'sha2-256'
  }, (err, cid) => {
    const cidString = cid.toBaseEncodedString()
    const multihash = data.dagNode.toJSON().multihash

    if (err) {
      cb(err)
    } else if (cidString !== multihash) {
      cb(errUnexpectedCID(cidString, multihash))
    } else {
      cb(null, data.data)
    }
  })
}

function add (data, cb) {
  FilesAPI.add(data, function (err, files) {
    if (err || !files[0]) {
      cb(err)
    } else {
      FilesAPI.get(files[0].hash, function (err, file) {
        if (err) {
          cb(err)
        } else if (file[0].content.toString() !== data.toString()) {
          cb(errUnexpectedFile(
            data.toString('utf8', 0, 1000),
            file[0].content.toString('utf8', 0, 1000)
          ))
        } else {
          cb(null, files[0].hash)
        }
      })
    }
  })
}
