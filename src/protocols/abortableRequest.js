const
  http = require('http'),
  https = require('https');

const CHARSETS = [
  'ascii',
  'base64',
  'binary',
  'hex',
  'ucs2',
  'ucs-2',
  'utf16le',
  'utf-16le',
  'utf8',
  'utf-8',
  'latin1'
];

class AbortableRequest {
  constructor (timeout, protocol, options) {
    this._timeout = timeout;
    this._options = options;
    this._request = null;

    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });

    this._client = protocol === 'https' ? https : http;

    this._timer = null;
  }

  run () {
    this._request = this._client.request(this._options, message => {
      let buffer = new Buffer.alloc(0);

      message.on('data', chunk => {
        buffer = Buffer.concat([buffer, chunk]);
      });

      message.on('end',() => {
        if ( options.responseEncoding
          || !message.headers['content-type']
          || /^(text|application\/json)/.test(message.headers['content-type'])
        ) {
          let charset = 'utf-8';

          if (options.responseEncoding) {
            charset = options.responseEncoding;
          }
          else if (message.headers['content-type']) {
            const match = /;\s*charset=(.*)/.exec(message.headers['content-type']);
            if (match) {
              charset = match[1];
            }
          }

          charset = charset.toLowerCase().replace(/^iso-?8859(-1)?$/, 'latin1');

          if (CHARSETS.indexOf(charset) === -1) {
            // unsupported charset, fallback to utf-8
            charset = 'utf-8';
          }

          message.body = buffer.toString(charset);
        }
        else {
          // assume binary content
          message.body = buffer;
        }

        this.resolve(res);
      });

      message.on('error', error => this.reject(error));

      message.on('timeout', () => this.reject(this._request));
    });

    this._request.on('abort', error => this.reject(this._request));
    this._request.on('error', error => this.reject(error));
    this._request.write(this._options.body || '');
    this._request.end();

    this._timer = setTimeout(() => {
      this._request.abort();
    }, this._timeout);

    return this._promise;
  }

  reject (arg) {
    clearTimeout(this._timer);

    this._reject(arg);
  }

  resolve (arg) {
    clearTimeout(this._timer);

    this._resolve(arg);
  }
}

module.exports = AbortableRequest;