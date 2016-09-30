// var _ = require('lodash')
// var fs = require('fs')
// var path = require('path')
// var shouldWatchFolder = require('./should-watch-folder')
//
// // holds folders we are interested in, but haven't walked yet.
// var walkItems = []
// var watchedFiles = []
//
// module.exports = function itemsWalker (root) {
//   if (!root) {
//     throw new Error('root is missing. please provide root to watch')
//   }
//   walkItems.push(path.resolve(root))
//   while (walkItems.length > 0) {
//     var walkingItems = _.clone(walkItems)
//     walkItems = []
//     _.each(walkingItems, function (item) {
//       var files = _.filter(_.map(fs.readdirSync(item), function (f) {
//         return path.join(item, f)
//       }), shouldWatchFolder)
//       var folders = _.filter(files, function (file) {
//         return fs.lstatSync(file).isDirectory()
//       })
//       files = _.map(_.filter(files, function (file) {
//         return !fs.lstatSync(file).isDirectory()
//       }), function (f) {
//         return path.dirname(f)
//       })
//
//       walkItems = walkItems.concat(folders)
//       watchedFiles = watchedFiles.concat(files)
//     })    // console.log('finished interation, walkItems is', walkItems)
//   }
//   return watchedFiles
// }
