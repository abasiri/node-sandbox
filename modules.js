function copy(from) {
  function to () {};
  to.prototype=from;
  return new to;
}
exports.http = require('fs').readFileSync(__dirname + '/box/http.js', 'ascii');

exports.net = function (context) {
  throw "The Net module is not supported at this time";
};

exports.child_process = function (context) {
  throw "Child process is not supported at this time";
};

exports.dgram = function (context) {
  throw "Dgram is not supported at this time";
};

exports.dns = function (context) {
  throw "DNS is not supported at this time";
};

exports.url = function (context) {
  return copy(require('url'));
};

exports.assert = function(context) {
  return copy(require('assert'));
}

exports.path = function (context) {
  return copy(require('path'));
};

exports.cheerio = function(context) {
  return require('./node_modules/cheerio/index');
}

exports.request = function(context) {
  return require('./node_modules/request/main');
}

exports.buffer = function (context) {
  return copy(require('buffer'));
};

exports.crypto = function (context) {
  return copy(require('crypto'));
};

exports.querystring = function (context) {
  return copy(require('querystring'));
};

var _http_client;
exports._http_client = function (context) {
  _http_client = _http_client || require('http')
  return {
    create: function (port, host) {
      return _http_client.createClient(80, host);
    }
  };
};
var util = require('util');
exports.util = exports.sys = function (context) {
  function nothing () {}
  return {
    print: nothing,
    puts: context.console.log,
    debug: context.console.log,
    error: context.console.log,
    inspect: function () {
      context.console.log(util.inspect.apply(this, arguments));
    },
    p: nothing,
    log: context.console.log,
    exec: nothing,
    pump: require('sys').pump
  };
};


exports.fs = function (context, config) {
  function noMod () {
    throw "The filesystem supports no modifications of the file system from the application";
  }
  function noSync () {
    throw "The file system does not supports synchronous calls";
  }
  return {
    unlink: noMod,
    unlinkSync: noSync,
    rename: noMod,
    renameSync: noSync,
    truncate: noMod,
    truncateSync: noSync,
    chmod: noMod,
    chmodSync: noSync,
    stat: function () {},
    lstat: function () {},
    fstat: function () {},
    statSync: noSync,
    lstatSync: noSync,
    fstatSync: noSync,
    link: noMod,
    linkSync: noSync,
    readFile: noMod,
  };
};
