var test = require('tap').test
var sort = require('..')
var concat = require('concat-stream')

test('sort modules topologically', function(t) {
  var stream = sort()
  stream.write({
    id: 'a.css',
    deps: {
      './b': 'b.css',
      './c': 'c.css',
    },
  })
  stream.write({
    id: 'b.css',
    deps: {
      './c': 'c.css',
    },
  })
  stream.write({
    id: 'c.css',
    deps: {},
  })
  stream.write({
    id: 'd.css',
    deps: {
      './e': 'e.css',
    },
  })
  stream.write({
    id: 'e.css',
    deps: {},
  })
  stream.end()

  stream.pipe(concat({ encoding: 'object' }, function (rows) {
    t.same(
      rows.map(function (row) {
        return row.id
      }),
      ['c.css', 'b.css', 'a.css', 'e.css', 'd.css']
    )
    t.end()
  }))
})

test('handle circular deps', function(t) {
  var stream = sort()
  stream.write({
    id: 'a.css',
    deps: {
      './b': 'b.css',
    },
  })
  stream.write({
    id: 'b.css',
    deps: {
      './a': 'a.css',
    },
  })
  stream.end()

  stream.pipe(concat({ encoding: 'object' }, function (rows) {
    t.same(
      rows.map(function (row) {
        return row.id
      }),
      ['b.css', 'a.css']
    )
    t.end()
  }))
})

test('handle missing deps', function(t) {
  var stream = sort()
  stream.write({
    id: 'a.css',
    deps: {
      './b': 'b.css',
    },
  })
  stream.write({
    id: 'b.css',
    deps: {
      './c': 'c.css',
    },
  })
  stream.end()

  stream.pipe(concat({ encoding: 'object' }, function (rows) {
    t.same(
      rows.map(function (row) {
        return row.id
      }),
      ['b.css', 'a.css']
    )
    t.end()
  }))
})

