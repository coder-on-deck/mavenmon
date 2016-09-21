var fs = require('fs')
var path = require('path')

module.exports = function shouldWatchFolder (filepath) {
  try {
    var result = false
    if (fs.existsSync(filepath)) {
      if (fs.lstatSync(filepath).isDirectory() &&
        path.basename(filepath) !== 'node_modules' &&
        path.basename(filepath) !== 'test-classes' &&
        filepath.indexOf('src/test/java') < 0 &&
        path.basename(filepath) !== 'dev' && (filepath === '.' || path.basename(filepath)[0] !== '.')) {
        result = true
      }

      if (filepath.endsWith('.java') || filepath.endsWith('.class') || filepath.endsWith('.jar')) {
        result = true
      }
    }
  } catch (e) {
    console.log('should i ignore error', e)
    result = false
  }
  // console.log('result for path', filepath, ' is ' , result )
  return result
}
