'use strict'

const chai = require('chai')
const mocha = require('mocha')
// const describe = mocha.describe
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const pull = require('pull-stream')
const {read} = require('pull-files')
const uploadPullStream = require('./upload-pull-stream')
const IPFS = require('ipfs')
const FilesAPIModule = require('ipfs-api/src/files')
const APIConfig = require('./api-config')

const node = new IPFS()
const FilesAPI = FilesAPIModule(APIConfig)

describe('uploadPullStream', function () {
  this.timeout(10000)

  before(function (done) {
    node.on('ready', () => {
      done()
    })
  })

  it('writes array of cids', done => {
    pull(
      read(['./test-files/test0.txt', './test-files/test1.txt']),
      pull.map(data => data.data),
      uploadPullStream(node, FilesAPI),
      pull.collect(function (err, ary) {
        expect(err).not.to.exist()
        expect(ary).to.have.length(2)
        expect(ary).to.include.members([
          'QmPnDQwRTNxD5uaFxQmmJqzRKyqF9dTfNrHUnTCUunFhdp',
          'QmdprYUrpN52x4XCUCTTK9sLw4jZdiQDpsc3N2qPWS9AEM'
        ])
        done()
      })
    )
  })

  it('writes array with cid for message > 262144 bytes', done => {
    pull(
      read(['./test-files/300kb.txt']),
      pull.map(data => data.data),
      uploadPullStream(node, FilesAPI),
      pull.collect(function (err, ary) {
        expect(err).not.to.exist()
        expect(ary).to.have.length(1)
        expect(ary).to.include.members([
          'QmUSknXrtyMwj7iUeg6zdrao3UqAhE2ZdPfVxjeHWgcecS'
        ])
        done()
      })
    )
  })

  it('uploads content to FilesAPI', done => {
    const content = String(Math.random());

    pull(
      pull.values([Buffer.from(content)]),
      uploadPullStream(node, FilesAPI),
      pull.collect(function (err, ary) {
        expect(err).not.to.exist()
        expect(ary).to.have.length(1)

        FilesAPI.get(ary[0], function (err, file) {
          expect(err).not.to.exist()
          expect(file[0].content.toString()).to.equal(content);
          done()
        })
      })
    )
  })
})
