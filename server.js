'use strict';

const cluster = require('cluster');
const net = require('net');
const os = require('os');

/*
This program can be used to share a public port for multiple services (on private/different ports).
The private port will be selected based on the "signature" of the first packet received.
Whether it's HTTP, SSH, or etc.

                  ____ 127.0.0.1:22
                 |
0.0.0.0:2222 ____|____ 127.0.0.1:80
                 |
                 |____ 127.0.0.1:443
*/

// where this program will listen on
const listenHost = process.env.APP_HOST || '0.0.0.0'; // no need to change this
const listenPort = process.env.APP_PORT || 2222;

// target host
const host = process.env.APP_TARGET_HOST || 'localhost';

// target ports
const httpPort = process.env.APP_HTTP_PORT || 80;
const httpsPort = process.env.APP_HTTPS_PORT || 443;
const sshPort = process.env.APP_SSH_PORT || 22;

const workerNum = Math.min(process.env.APP_WORKER_NUM || 2, os.cpus().length);

const server = net.createServer({ noDelay: true }, socket => {
  console.log('Client connected to worker', process.pid);

  var client;

  socket.on('data', data => {
    if (client === undefined) {
      // means this is the first packet (data) received from the client
      // here we can detect the protocol and determine the appropriate port
      console.log(data.toString());

      var port = httpsPort; // default target port

      switch (true) {
        case data.toString().substring(0, data.indexOf('\r\n')).indexOf(' HTTP/') > 0:
          port = httpPort;
          break;
        case data.indexOf('SSH-') === 0:
          port = sshPort;
          break;
      }

      client = net.createConnection({ port: port, host: host, noDelay: true }, () => {
        console.log('*** Connected to', host, 'port', port);
      });

      // receive data from target then send it to client
      client.pipe(socket).on('finish', () => {
        client.end();
      });

      client.on('end', () => {
        console.log('*** Disconnected from', host, 'port', port);
      });
    }

    // receive data from client then send it to target
    client.write(data);
  });

  socket.on('end', () => {
    console.log('Client disconnected from worker', process.pid);
  });
});

if (workerNum > 1 && !cluster.isWorker) {
  console.log('Node Protocol Multiplexer (pid %d) is running. Starting %d workers...', process.pid, workerNum);

  for (let i = 0; i < workerNum; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log('Worker %d died (%s)', worker.process.pid, signal || code);

    if (code !== 0) {
      console.log('Starting a new worker...');
      cluster.fork();
    }
  });
} else {
  server.on('error', err => {
    throw err;
  });

  server.listen(listenPort, listenHost, () => {
    console.log('Node Protocol Multiplexer (pid %d) is started at %s port %d', process.pid, listenHost, listenPort);
  });
}
