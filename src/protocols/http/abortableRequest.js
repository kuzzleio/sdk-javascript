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
  constructor (protocol, timeout, options) {
    this._protocol = protocol;
    this._timeout = timeout;
    this._options = options;
    this._request = null;

    this._options.timeout = this._timeout;

    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });

    this._timer = null;
  }

  run () {
    if (typeof XMLHttpRequest === 'undefined') {
      // NodeJS implementation, using http(s).request

      if (this._options.path[0] !== '/') {
        this._options.path = `/${this._options.path}`;
      }

      this._options.headers = this._options.headers || {};
      this._options.headers['Content-Length'] = Buffer.byteLength(
        this._options.body || '');

      this._nodeRequest();
    }
    else {
      this._browserRequest();
    }

    // Set request abortion timeout if it is specified
    if (this._timeout > 0) {
      this._timer = setTimeout(() => {
        this._request.abort();
      }, this._timeout);
    }

    return this._promise;
  }

  /**
   * Browser implementation using XMLHttpRequest
   */
  _browserRequest () {
    const
      { host, port, path, body, headers, method } = this._options,
      url = `${this._protocol}://${host}:${port}${path}`;

    this._request = new XMLHttpRequest();

    this._request.timeout = this._timeout;

    this._request.onreadystatechange = () => {
      if (this._request.readyState === 4 && this._request.status === 0) {
        this.reject(new Error('Cannot connect to host. Is the host online?'));
      }
    };

    this._request.open(method, url);

    for (const [header, value] of Object.entries(headers || {})) {
      this._request.setRequestHeader(header, value);
    }

    this._request.onload = () => this.resolve(this._request.responseText);

    this._request.send(body);
  }

  /**
   * Node.js implementation using http(s) module
   */
  _nodeRequest () {
    const client = this._nodeClient();

    this._request = client.request(this._options, message => {
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

        this.resolve(message);
      });

      message.on('error', error => this.reject(error));

      message.on('timeout', error => this.reject(error));
    });

    this._request.on('abort', error => this.reject(error));
    this._request.on('error', error => this.reject(error));
    this._request.write(this._options.body || '');
    this._request.end();
  }

  _nodeClient () {
    return this._protocol === 'https'
      ? require('https')
      : require('http');
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