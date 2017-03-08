const express = require('express');
let app = express();
app.use(express.static('test/fixtures'));

let devServer;


module.exports = {
  init(port) {
    devServer = app.listen(port);
  },
  destroy() {
    devServer.close();
  }
};