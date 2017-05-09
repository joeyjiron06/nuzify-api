const chai = require('chai');
const server = require('../../index');
const parseCookie = require('./parse-cookie');

class MunchAPI {

  static get(url, data) {
    return MunchAPI.fetch(url, 'GET', data);
  }

  static post(url, data) {
    return MunchAPI.fetch(url, 'POST', data);
  }

  static del(url, data, headers) {
    return MunchAPI.fetch(url, 'delete', data, headers);
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
    return MunchAPI.post('/v1/user', user);
  }

  static verifyEmail(email) {
    return MunchAPI.post('/v1/user/verify-email', {email});
  }

  static resetPassword(email) {
    return MunchAPI.post('/v1/user/reset-password', {email});
  }

  static updateMyPassword(oldPassword, newPassword, token) {
    return MunchAPI.fetch('/v1/me/update-password', 'POST', {
      old_password: oldPassword,
      new_password: newPassword,
    },
      {cookie:`munchtoken=${token}`}
    );
  }

  static updateMyPasswordWithToken(newPassword, token) {
    return MunchAPI.fetch(`/v1/me/update-password/${token}`, 'POST', {new_password: newPassword});
  }

  static getMe(token) {
    return MunchAPI.fetch('/v1/me', 'GET', null, {cookie:`munchtoken=${token}`});
  }

  static deleteMe(token) {
    let headers = token ? {cookie:`munchtoken=${token}`} : null;
    return MunchAPI.del('/v1/me', {}, headers);
  }

  static getMyFeeds(munchtoken) {
    return MunchAPI.fetch('/v1/me/feeds', 'GET', null, {cookie:`munchtoken=${munchtoken}`});
  }

  static addFeed(feed) {
    return MunchAPI.fetch('/v1/feeds', 'PUT', feed);
  }

  static addToMyFeeds(feedId, munchtoken) {
    return MunchAPI.fetch('/v1/me/feeds', 'PUT', {id:feedId}, {cookie:`munchtoken=${munchtoken}`});
  }

  static removeFromMyFeeds(feedId, munchtoken) {
    return MunchAPI.fetch('/v1/me/feeds', 'DELETE', {id:feedId}, {cookie:`munchtoken=${munchtoken}`});
  }

  static getFeed(id) {
    return MunchAPI.fetch(`/v1/feeds/${id}`, 'GET');
  }

  static getArticles(id) {
    return MunchAPI.fetch(`/v1/feeds/${id}/articles`, 'GET');
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

module.exports = MunchAPI;
