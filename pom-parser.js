var findup = require('findup')
var pomParser = require('pom-parser')
var path = require('path')
var logger = require('log4js').getLogger('pom-parser')

/**
 *
 * @param {string} filepath
 * @returns {QueueItem}
 */
module.exports = function (filepath) {
  return new Promise(function (resolve, reject) {
    var dir = findup.sync(filepath, 'pom.xml')
    // execSync('mvn -Doutput=.pom.effective help:effective-pom -nsu',{stdio: [0, 1, 2], cwd: dir})
    pomParser.parse({filePath: path.join(dir, '/pom.xml')}, function (err, pom) {
      if (err) {
        logger.error(err)
        reject(err)
      } else {
        // logger.info('read effective pom')
        // resolve artifacts path as well
        pom.pomObject.project.version = pom.pomObject.project.version || pom.pomObject.project.parent.version
        pom.pomObject.project.groupid = pom.pomObject.project.groupid || pom.pomObject.project.parent.groupid
        var jarfilename = pom.pomObject.project.artifactid + '-' + pom.pomObject.project.version + '.jar'
        pom.pomObject.project.packaging = pom.pomObject.project.packaging || 'jar'  // defaults to jar
        resolve({
          dir: dir,
          pom: pom.pomObject,
          jarfile: path.join(dir, 'target', jarfilename),
          classfile: filepath.replace('src/main/java/', 'target/').replace('.java', '.class')
        })
      }
      // fs.removeSync('.pom.effective')
    })
  })
}
