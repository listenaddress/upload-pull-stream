const UnixFS = require('ipfs-unixfs')

const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')

const CHUNK_LENGTH = 262144

/*

The following code is adapted from https://github.com/ConsenSys/constellate/blob/master/src/ipfs/content-service.js

------------------------------- LICENSE -------------------------------

MIT License

Copyright (c) 2017 Zachary Balder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

module.exports = function (content, cb) {
  const numChunks = Math.ceil(content.length / CHUNK_LENGTH)
  if (numChunks === 1) {
    const file = new UnixFS('file', content)
    return DAGNode.create(content, (err, dagNode) => {
      if (err) {
        return cb(err)
      }
      cb(null, dagNode)
    })
  }
  const dagNodes = []
  const files = []
  const links = []
  let count = 0, chunk
  const fn = i => {
    DAGNode.create(files[i].marshal(), (err, dagNode) => {
      if (err) {
        return cb(err)
      }
      dagNodes[i] = dagNode
      if (++count === numChunks) {
        const file = new UnixFS('file')
        for (i = 0; i < numChunks; i++) {
          dagNode = dagNodes[i]
          file.addBlockSize(files[i].fileSize())
          links[i] = new DAGLink('', dagNode.size, dagNode.multihash)
        }
        DAGNode.create(file.marshal(), links, (err, dagNode) => {
          if (err) {
            return cb(err)
          }
          cb(null, dagNode)
        })
      }
    })
  }
  for (let i = 0; i < numChunks; i++) {
    chunk = content.slice(i*CHUNK_LENGTH, (i+1)*CHUNK_LENGTH)
    files[i] = new UnixFS('file', chunk)
    fn(i)
  }
}
