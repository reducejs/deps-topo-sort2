var Transform = require('stream').Transform

module.exports = function () {
  var rowMap = Object.create(null)
  var stream = Transform({ objectMode: true })

  function write(row, _, next) {
    rowMap[row.id] = row
    next()
  }

  function end(next) {
    Object.keys(rowMap).forEach(visit)
    next()
  }

  function visit(id) {
    var row = rowMap[id]
    if (!row) {
      return
    }

    delete rowMap[id]

    var deps = Object.keys(row.deps || {})
    deps.map(function (dep) {
      return row.deps[dep]
    }).forEach(visit)
    stream.push(row)
  }

  stream._transform = write
  stream._flush = end
  return stream
}

