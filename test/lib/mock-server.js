const express = require('express');
let app = express();
app.use(express.static('test/fixtures'));

let devServer;

/**
 * A mock server that hosts files under "fixtures" folder.
 */
module.exports = {
  init(port) {
    devServer = app.listen(port);
  },
  destroy() {
    devServer.close();
  },

  /**
   * @param {string} path - to append to the baseurl
   * @return {string} the baseUrl:portNum+path
   */
  getUrl(path) {
    return `http://localhost:${devServer.address().port}${path}`;
  }
};