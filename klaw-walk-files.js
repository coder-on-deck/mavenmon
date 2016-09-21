//
// var excludeDirFilter = through2.obj(function (item, enc, next) {
//     // console.log('filtering',next)
//     if ( shouldWatchFolder(item.path) ) {
//         this.push(item)
//         next()
//     } else {
//         // next('not walking this')
//         next()
//     }
//     // console.log('not watching', item.path )
//     // next()
//     // next(null, item )
// })
//
// klaw(watchRoot)
//     .on('error', function(){})
//     .pipe(excludeDirFilter)
//     .on('error', function(){})
//     .on('data', function( item){
//         console.log('walk data', item.path )
//     })
//     .on('end', function () {
//         logger.info('walk finished')
//     })

//
// var excludeDirFilter = through2.obj(function (item, enc, next) {
//     if (!item.stats.isDirectory()) this.push(item)
//     next(null,null)
// })
//
// klaw(watchRoot)
//     .pipe(excludeDirFilter)
//     .on('data', function (item) {
//         console.log('walking',item.path)
//     })
//     .on('end', function () {
//
//     })
