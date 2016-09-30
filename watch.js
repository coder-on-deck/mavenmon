#!/usr/bin/env node

/**
 *
 * Setup watched files.
 *
 * Invoke the watcher on each detected change.
 *
 */

/**
 * arguments from command line
 */
var argv = require('minimist')(process.argv.slice(2))

/**
 * a library to watch the files
 */
var chokidar = require('chokidar')

/**
 * path library
 */
var path = require('path')

/**
 * logger
 */
var logger = require('log4js').getLogger('mavemon')
logger.setLevel(argv.verbose ? 'ALL' : 'INFO')

/**
 * collection utility
 */
var _ = require('lodash')

/**
 * helps with parsing the pom. not to be confused with the pom-parser library.
 */
var mavenmonPomParser = require('./pom-parser')

/**
 *
 * @type {"fs"}
 */
var fs = require('fs')

/**
 * register global exceptions
 */
require('./register-exceptions')

/**
 * a function to decide if folder should be watched.
 */
var shouldWatchFolder = require(argv.filter || './should-watch-folder')

// read configuration
var config = {}
var configFile = path.join(process.cwd(), '.nodemon.json')
function reloadConfig () { //  support auto reload
  logger.debug('reloading configuration from', configFile)
  try {
    config = _.merge(config, require(configFile)) // merge to keep reference. use null so lodash will remove key
    logger.debug('config is', config)
  } catch (e) {
    logger.error('error reading configuration', e)
  }
}
chokidar.watch(configFile).on('all', reloadConfig) // reload on config change

if (fs.existsSync(configFile)) {
  reloadConfig()
}

// list watched files
var watchRoot = argv._[0] || path.resolve('.')  // by default use cwd
logger.debug('watching args', argv._)
var onchangeLocation = path.resolve(path.join(watchRoot, argv._[1] || './onchange.js'))
if (fs.existsSync(onchangeLocation)) {
  logger.debug('onchangeLocation', onchangeLocation)
} else {
  logger.info('using default onchange handler')
  onchangeLocation = './default-on-change.js'
}
var onchange = require(onchangeLocation)

var ready = false
var queue = {}

/**
 * @typedef {object} QueueItem
 * @property {string} dir
 * @property {object} pom. Contains project.version, project.parent.version etc.. like a pom.xml model. NOTE! keys are in lower-case
 * @property {string} jarfile - an estimation where the jarfile will be. (does not support custom maven configuration)
 * @property {string} classfile - estimation where the classfile will be. (does not support custom maven configuration)
 */
/**
 *
 * @param {QueueItem} data
 */
function executeQueueItem (data) {
  logger.debug('handling change on ', path)
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
  var promises = _.map(queue, item => executeQueueItem(item))
  Promise.all(promises, () => {
    if (beforeLength !== Object.keys(queue).length) {
      executeAllItems()
    }
  })
}

// on change, register the item on the queue and execute all items
function handleChange (type) {
  return function (path) {
    logger.info(type, path)
    mavenmonPomParser(path).then(function (data) {
      data.path = path
      data.type = type
      queue[data.dir] = data
      executeAllItems()
    })
  }
}

logger.debug('starting walk')

// One-liner for current directory, ignores .dotfiles
var watcher = chokidar.watch('.', {
  ignored: function (filepath) {
    // console.log('should watch', filepath, shouldWatchFolder(filepath))
    return !shouldWatchFolder(filepath)
  },
  usePolling: true // after a lot of investigating.. polling behaves nicer when using `mvn clean`
}).on('ready', function () {
  ready = true

  setTimeout(function () { // should happen on a different tick or otherwise we will get all the add events.
    logger.debug('adding on change handler')
  }, 0)
  setTimeout(function () {
    watcher.on('change', handleChange('change')).on('add', handleChange('add')).on('unlink', handleChange('unlink')) // 'change' when code changed. 'add' for .class files that were removed with 'clean' and added by 'install'
    logger.info('watching... you can start writing code')
  }, 1000)
})
logger.info('setting up watch for [' + watchRoot + ']  please wait..')
