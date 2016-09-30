mavenmon
=========

like nodemon but for maven projects


# Installation
 
```
npm install -g mavenmon
```

# Usage

Go to your maven project root and run 
```
mavenmon 
```

This will automatically start watching your project with the default settings

You can also override some functionalities by defining different logic in the command line 

```
mavemon some_dir onchange_handler.js --filter file_filter.js
```

 - **some_dir** - defines which dir to watch
 - **onchange_handler.js** - define a different behavior when file changes. See spec below. 
 - **file_filter.js** - defines which files should be watched and which should not. See spec below. 
 
 
# On change handler
 
For example
 
 
```
/**
   A change handler that assumes this is a multi module project and runs maven build on relevant artifact when code changes. 
   Otherwise ignores.
**/
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
```

As you can see `onchange_handler.js` must expost a function that receives as a parameter the modified data. Specifically these fields
 
 - **dir** - [string] - the pom directory
 - **pom** - [object] - an object in the pom.xml structure. all the keys are lowercase (`artifactid` and not `artifactId`)
 - **jarfile** - [string] - a guess where the jar file will be. 
 - **classfile** - [string] - a guess where the class file will be. 


# File filter

For example
```
var fs = require('fs')
var path = require('path')

/**

    A file filter that focuses on java files under src, on compiled classes from src and jar files.

**/

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
    } else {
      return true // if does not exist, watch it! otherwise will be ignored if readded. fixes issue where file is deleted.
    }
  } catch (e) {
    console.log('should i ignore error', e)
    result = false
  }
  return result
}
```

The file filter should expose a function that returns true if should be ignored. 

**NOTE** - if file does not exist, you might still want to watch it in case it returns. If you return `false`, then mavenmon will not detect it if it comes back. 

