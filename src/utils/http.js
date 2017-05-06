'use strict';
const http = require('http');
const https = require('https');
const url = require('url');
const parseUrl = url.parse;

/**
 * A general purpose utility class for making http requests. It leverages promises and checks status code for either
 * rejecting or resolving the promise. It also fulfills boilerplate code for concatenating the bytes into a buffer, string,
 * and json.
 */
class Http {

  /**
   * @see Http.fetch
   */
  static get(url, options) {
    return Http.fetch(url, Object.assign({}, options, {method:'GET'}));
  }

  /**
   * @see Http.fetch
   */
  static post(url, options) {
    return Http.fetch(url, Object.assign({}, options, {method:'POST'}));
  }

  /**
   * @see Http.fetch
   */
  static put(url, options) {
    return Http.fetch(url, Object.assign({}, options, {method:'PUT'}));
  }

  /**
   * @see Http.fetch
   */
  static del(url, options) {
    return Http.fetch(url, Object.assign({}, options, {method:'DELETE'}));
  }

  /**
   * @param url {string}       - the url to fetch
   * @param options {object}   - an options object that is used to passed to the node request library
   *                             read the docs here https://nodejs.org/api/http.html#http_http_request_options_callback
   * @return {Promise} a promise that resolves with a response object. read docs here https://nodejs.org/api/http.html#http_class_http_incomingmessage
   * */
  static fetch(url, options) {
    return new Promise((resolve, reject) => {
      options = Object.assign({}, parseUrl(url), options);

      let request = (options.protocol === 'https:') ? https.request : http.request;

      request(options, (response) => {

        response.on('data', function (chunk) {
          response.chunks = response.chunks || [];
          response.chunks.push(chunk);
        });

        response.on('end', () => {
          let bytes = Buffer.concat(response.chunks);

          response.json = () => {
            try {
              return JSON.parse(bytes.toString());
            } catch (e) {
              return undefined;
            }
          };

          response.string = () => {
            return bytes.toString();
          };

          if (response.statusCode >= 200 && response.statusCode <= 299) {
            resolve(response);
          } else {
            reject(response);
          }
        });
      })
        .end();

    });
  }
}

module.exports = Http;