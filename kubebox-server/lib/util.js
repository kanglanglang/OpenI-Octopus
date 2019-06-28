'use strict';

const os = require('os');
const { StringDecoder } = require('string_decoder');

Object.defineProperties(Array.prototype, {
  flatMap: {
    value: function (f) {
      return Array.prototype.concat.apply([], this.map(f));
    },
    writeable  : false,
    enumerable : false,
  }
});

Object.defineProperties(Array.prototype, {
  delta: {
    value: function () {
      return this.reduce((r, v, i, a) => {
        if (i < a.length - 1)
          r.push(a[i + 1] - a[i]);
        return r;
      }, []);
    },
    writeable  : false,
    enumerable : false,
  }
});

module.exports.isEmpty = str => !str || str === '';

module.exports.isNotEmpty = str => str && str.length > 0;

module.exports.formatDuration = function (duration) {
  if (duration.years() > 0)
    return duration.format('y[y] M[M]');
  else if (duration.months() > 0)
    return duration.format('M[M] d[d]');
  else if (duration.days() > 0)
    return duration.format('d[d] h[h]');
  else if (duration.hours() > 0)
    return duration.format('h[h] m[m]');
  else if (duration.minutes() > 0)
    return duration.format('m[m] s[s]');
  else
    return duration.format('s[s]');
}

module.exports.humanBytes = function (bytes, SI = false) {
  const threshold = SI ? 1000 : 1024;
  if (Math.abs(bytes) < threshold) {
    return `${bytes} B`;
  }
  const units = SI
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  do {
    bytes /= threshold;
    ++u;
  } while (Math.abs(bytes) >= threshold && u < units.length - 1);
  return `${bytes.toFixed(1)} ${units[u]}`;
};

module.exports.isLocalStorageAvailable = function () {
  if (os.platform() !== 'browser') {
    return false;
  }
  try {
    var storage = window['localStorage'],
        x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0;
  }
}

const DIRECTION_TYPE = {
  DIRECTION_TYPE_DATA:0,
  DIRECTION_TYPE_OPERATION:1,
  DIRECTION_TYPE_MESSAGE:254,
}

module.exports.serializeMessage = function(data){
  return serialize(data,DIRECTION_TYPE.DIRECTION_TYPE_MESSAGE);
}

module.exports.serializeData = function(data){
  return serialize(data,DIRECTION_TYPE.DIRECTION_TYPE_DATA);
}

module.exports.serializeOperation = function(data){
  return serialize(data,DIRECTION_TYPE.DIRECTION_TYPE_OPERATION);
}

module.exports.deserialize = function(data){
  return deserialize(data)
}

Object.assign(module.exports,{DIRECTION_TYPE})

function deserialize(data){
  let cmd = data.readUInt8(0);
  data = data.slice(1);

  const decoder = new StringDecoder('utf8');
  const d = decoder.end(data);
  return {cmd,data:d}
}

function serialize(data,type){
  const buffer = Buffer.from(data, 'utf-8');
  const message = Buffer.allocUnsafe(buffer.length + 1);
  message.writeUInt8(type, 0);
  buffer.copy(message, 1);
  return message;
}
