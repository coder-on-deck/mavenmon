#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2))
var chokidar = require('chokidar')

var mavenmonPomParser = require('./pom-parser')
var path = require('path')
var logger = require('log4js').getLogger('watch-maven-project')
var _ = require('lodash')
var config = {}
require('./register-exceptions')
var shouldWatchFolder = require('./should-watch-folder')

var configFile = path.join(process.cwd(), '.nodemon.json')
function reloadConfig () {
  console.log('reloading configuration from', configFile)
  try {
    config = require(configFile)
    console.log('config is', config)
  } catch (e) {
    console.log(e)
  }
}

chokidar.watch(configFile).on('all', reloadConfig)

// reloadConfig()

var watchRoot = argv._[0] || path.resolve('.')  // by default use cwd
console.log(argv._)
var onchangeLocation = path.resolve(path.join(watchRoot, argv._[1] || './onchange.js'))
console.log('onchangeLocation', onchangeLocation)
var onchange = require(onchangeLocation)

var ready = false
var queue = {}
function executeQueueItem (data) {
  // console.log('handling change on ', path)
  if (!ready) {
    return
  }
  var promise = onchange(data)
  if (!promise || !promise.then) {
    throw new Error('onchange must return a promise')
  }

  promise.then(function () {
    delete queue[data.dir]
  }, function () {
  })
}

function executeAllItems () {
  var beforeLength = Object.keys(queue).length
  var promises = _.map(queue, function (item, key) {
    return executeQueueItem(item)
  })
  Promise.all(promises, () => {
    if (beforeLength !== Object.keys(queue).length) {
      executeAllItems()
    }
  })
}

function handleChange (path) {
  mavenmonPomParser(path).then(function (data) {
    data.path = path
    queue[data.dir] = data
    executeAllItems()
  })
}

function echoEvent (event, filepath) {
  // if ( event !== 'addDir' && event !== 'add') { // too verbose
  //     console.log('event is :: ', event, filepath)
  // }
}

logger.info('starting walk')
var watchedFiles = require('./get-watched-files')(watchRoot)
logger.info('watching', watchedFiles.length, 'files')

// One-liner for current directory, ignores .dotfiles
var watcher = chokidar.watch('someimagineryfile', {
  ignored: function (filepath) {
    return !shouldWatchFolder(filepath)
  }
}).on('ready', function () {
  setTimeout(function () { // should happen on a different tick or otherwise we will get all the add events.
    logger.info('adding on change handler')
    ready = true
    watcher.on('change', handleChange) // .on('add',handleChange)
  }, 0)
  setTimeout(function () {
    logger.info('watching... you can start writing code')
  }, 1000)
})

watcher.on('all', echoEvent)
watcher.add(watchedFiles)
logger.info('setting up watch for [' + watchRoot + ']  please wait..')
