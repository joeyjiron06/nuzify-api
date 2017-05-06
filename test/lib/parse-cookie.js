module.exports = function parseCookie(cookie) {
  let result = {};

  cookie.split(';').forEach((kvPair) => {
    let split = kvPair.split('=');
    let key = split[0].trim();
    let val = split[1].trim();
    result[key] = val;
  });

  return result;
};