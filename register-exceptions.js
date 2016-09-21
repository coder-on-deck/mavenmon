process.on('unhandledRejection', (reason, p) => {
  console.log('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason)
  console.log(reason.stack)
  // application specific logging here
})

process.on('uncaughtException', (err) => {
  console.error(err.stack)
  console.log(`Caught exception: ${err}`)
})
