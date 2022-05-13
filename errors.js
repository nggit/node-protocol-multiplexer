'use strict';

const util = require('util');

function getMessage(code) {
  return {
    EADDRINUSE: util.format('Address already in use (%s)', code),
    EAI_AGAIN: util.format('Temporary failure in name resolution (%s)', code),
    ECONNREFUSED: util.format('Connection refused by remote host (%s)', code)
  }[code] || util.format('An error occurred (%s)', code);
}

module.exports = {
  getMessage
};
