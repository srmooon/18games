const { https } = require('firebase-functions');
const { default: next } = require('next');

const nextjsServer = next({
  dev: false,
  conf: {
    distDir: '.next',
  },
});
const nextjsHandle = nextjsServer.getRequestHandler();

exports.nextServer = https.onRequest((req, res) => {
  return nextjsServer.prepare()
    .then(() => nextjsHandle(req, res))
    .catch(error => {
      console.error(error);
      res.status(500).end('Internal Server Error');
    });
});
