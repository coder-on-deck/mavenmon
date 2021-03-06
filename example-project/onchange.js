var execSync = require('child_process').execSync

module.exports = function (data) {
  return new Promise(function (resolve, reject) {
    try {
      if (data.path.endsWith('.java')) {
        console.log('running mvn clean install')
        execSync('mvn clean install -DskipTests=true -nsu -pl ' + data.pom.project.artifactid, {stdio: [0, 1, 2]})
      } else {
        console.log('unhandled path [' + data.path + ']', data.type)
      }
    } catch (e) {
      reject(e)
      return
    } finally {
      console.log('finished process [' + data.path + ']', data.type)
    }
    resolve()
  })
}

