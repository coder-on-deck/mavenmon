var execSync = require('child_process').execSync

module.exports = function (data) {
  return new Promise(function (resolve, reject) {
    try {
      if (data.path.endsWith('.java')) {
        execSync('mvn clean install -DskipTests=true -nsu -pl ' + data.pom.project.artifactid, {stdio: [0, 1, 2]})
      } else {
        console.log('unhandled path [' + data.path + ']')
      }
    } catch (e) {
      reject(e)
      return
    } finally {
      console.log('finished process [' + data.path + ']')
    }

    resolve()
  })
}

// /** **************************** UPDATE ************************************* **/
//
// function autoUpdate (data) {
//   console.log('audo updating')
//   var FindFiles = require('node-find-files')
//
//   var filterFunc = null
//
//   if (data.pom.project.packaging === 'jar') {
//     // search for file with jar name
//     filterFunc = function (filepath) {
//       // console.log('path is', path)
//       return filepath.endsWith(path.basename(data.jarfile))
//     }
//   }
//
//   if (filterFunc !== null) {
//     console.log('auto updating from root', config.auto_update_root)
//     var finder = new FindFiles({
//       rootFolder: config.auto_update_root,
//       filterFunction: filterFunc
//     })
//
//     finder.on('match', function (filepath) {
//       console.log('automatically updating', filepath)
//       if (config.auto_update_enabled) {
//         fs.copySync(data.jarfile, filepath)
//         console.log('updated')
//       } else {
//         console.log('auto update is disabled. not doing anything. add auto_update_enabled true to turn on')
//       }
//     })
//
//     finder.startSearch()
//   }
// }
//
// function manualUpdate (data) {
//   var artifactFullName = data.pom.project.groupid + '::' + data.pom.project.artifactid
//   if (!config.update || !config.update.hasOwnProperty(artifactFullName)) {
//     logger.error('I do not know how to update [' + artifactFullName + ']. please add record to configuration')
//     console.log(data, config, !config.update.hasOwnProperty(artifactFullName))
//   }
//
//   var webappRoot = config.update[artifactFullName]
//
//   var artifact = null
//   if (data.pom.project.packaging === 'jar') {
//     // copy the jar file
//     logger.info('updating jar')
//     webappRoot = path.join(webappRoot, 'WEB-INF', 'lib')
//     artifact = data.jarfile
//   } else if (data.pom.project.packaging === 'war') {
//     logger.info('updating classes ' + data.classfile + ' ' + webappRoot)
//     webappRoot = path.join(webappRoot, 'WEB-INF')
//     artifact = path.join(data.dir, 'target', 'classes')  // null  // '' //data.classfile  // copy all classes? because we get notified about them all
//   } else {
//     throw new Error('unknown packaging' + data.pom.project.packaging)
//   }
//
//   var dist = webappRoot
//   if (artifact) {
//     dist = path.join(webappRoot, path.basename(artifact))
//   }
//   logger.info('copy', artifact, dist)
//   fs.copySync(artifact, dist)
//   return
// }
//
//
// function update (data) {
//   return new Promise(function (resolve) {
//     if (data.pom.project.packaging === 'jar' && config.auto_update_root) { // enable auto update only on jars for now.
//       autoUpdate(data)
//     } else {
//       manualUpdate(data)
//     }
//
//     resolve()
//   })
// }
//
// function compile (data) {
//   return new Promise(function (resolve) {
//     try {
//       console.log(data.pom.project.packaging)
//       logger.info('compiling ' + data.pom.project.packaging)
//       if (data.pom.project.packaging === 'jar') {
//         // must install so dependencies will see the change
//         execSync('mvn install -DskipTests=true -nsu', {stdio: [0, 1, 2], cwd: data.dir})
//       } else if (data.pom.project.packaging === 'war') {
//         execSync('mvn compile -DskipTests=true -nsu', {stdio: [0, 1, 2], cwd: data.dir})
//       }
//       resolve()
//     } catch (e) {
//       console.log('error in compile', e, data)
//       resolve()
//     }
//   })
// }
