'use strict'

const pull = require('pull-stream')
const paramap = require('pull-paramap')
const read = require('pull-files').read
const uploadPullStream = require('./upload-pull-stream')
const IPFS = require('ipfs')
const FilesAPIModule = require('ipfs-api/src/files')
const APIConfig = require('./api-config')

const node = new IPFS()
const FilesAPI = FilesAPIModule(APIConfig)

node.on('ready', () => {
  upload(read('./files/**'))
})

function upload (source) {
  console.log('STARTING UPLOAD')
  pull(
    source,
    pull.map(data => data.data),
    uploadPullStream(node, FilesAPI),
    pull.collect(function (err, ary) {
      if (err) {
        console.log(err)
      } else {
        console.log(`\`\`\`\nALL MESSAGES RECEIVED`)
        pull(
          pull.values(ary),
          paramap(printMsg, 25),
          pull.collect(function (err, ary) {
            if (err) console.log(err)
            else console.log('```')
            process.exit()
          })
        )
      }
    })
  )
}

function printMsg(data, cb) {
  FilesAPI.get(data, function(err, files) {
    if (err) {
      cb(err)
    } else {
      let msg = files[0].content.toString('utf8', 0, 30)
      if (files[0].content.length > 30) msg += '...'
      process.stdout.write(msg + ': ' + data + '\n')
      cb(null, true)
    }
  })
}
