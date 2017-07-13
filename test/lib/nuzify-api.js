const chai = require('chai');
const server = require('../../index');
const parseCookie = require('./parse-cookie');

class NuzifyAPI {

  static get(url, data) {
    return NuzifyAPI.fetch(url, 'GET', data);
  }

  static post(url, data) {
    return NuzifyAPI.fetch(url, 'POST', data);
  }

  static del(url, data, headers) {
    return NuzifyAPI.fetch(url, 'delete', data, headers);
  }

  static fetch(url, method, data, headers) {
    return new Promise((resolve, reject) => {
      let request = chai.request(server);
      method = method.toLowerCase();

      headers = headers || {};

      request = request[method](url);

      for (let key in headers) {
        request = request.set(key, headers[key]);
      }

      request
        .send(data)
        .end((err, res) => {
          if (err) {
            reject(res);
          } else {
            resolve(res);
          }
        });
    });
  }

  static postUser(user) {
    return NuzifyAPI.post('/v1/user', user);
  }

  static verifyEmail(email) {
    return NuzifyAPI.post('/v1/user/verify-email', {email});
  }

  static resetPassword(email) {
    return NuzifyAPI.post('/v1/user/reset-password', {email});
  }

  static updateMyPassword(oldPassword, newPassword, token) {
    return NuzifyAPI.fetch('/v1/me/update-password', 'POST', {
      old_password: oldPassword,
      new_password: newPassword,
    },
      {cookie:`nuzifytoken=${token}`}
    );
  }

  static updateMyPasswordWithToken(newPassword, token) {
    return NuzifyAPI.fetch(`/v1/me/update-password/${token}`, 'POST', {new_password: newPassword});
  }

  static getMe(token) {
    return NuzifyAPI.fetch('/v1/me', 'GET', null, {cookie:`nuzifytoken=${token}`});
  }

  static deleteMe(token) {
    let headers = token ? {cookie:`nuzifytoken=${token}`} : null;
    return NuzifyAPI.del('/v1/me', {}, headers);
  }

  static getMyFeeds(nuzifytoken) {
    return NuzifyAPI.fetch('/v1/me/feeds', 'GET', null, {cookie:`nuzifytoken=${nuzifytoken}`});
  }

  static addFeed(feed) {
    return NuzifyAPI.fetch('/v1/feeds', 'PUT', feed);
  }

  static addToMyFeeds(feedId, nuzifytoken) {
    return NuzifyAPI.fetch('/v1/me/feeds', 'PUT', {id:feedId}, {cookie:`nuzifytoken=${nuzifytoken}`});
  }

  static removeFromMyFeeds(feedId, nuzifytoken) {
    return NuzifyAPI.fetch('/v1/me/feeds', 'DELETE', {id:feedId}, {cookie:`nuzifytoken=${nuzifytoken}`});
  }

  static getFeed(id) {
    return NuzifyAPI.fetch(`/v1/feeds/${id}`, 'GET');
  }

  static getArticles(id) {
    return NuzifyAPI.fetch(`/v1/feeds/${id}/articles`, 'GET');
  }

  static authenticate(email, password) {
  return new Promise((resolve, reject) => {
    chai.request(server)
      .post('/v1/authenticate')
      .send({email, password})
      .end((err, res) => {
        if (err) {
          reject(res);
        } else {
          res.cookie = parseCookie(res.headers['set-cookie'][0]);
          resolve(res);
        }
      });
  });
}
}

module.exports = NuzifyAPI;
