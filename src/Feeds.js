const parser = require('xml2json');
const http = require('./utils/http');

const PARSER_OPTIONS = {
  object:true,
  sanitize: true,
  trim: true
};


class Feeds {

  /**
   * @see Feeds.rss
   * @see Feeds.atom
   * @param {string} url
   * @return {Promise} returns a promise that yields an Object {source, items}
   */
  static fetch(url) {
    return http.get(url)
      .then((response) => {
        let string = response.string();

        // parse the response string
        let type = Feeds.identify(string);
        if (type === 'atom') {
          return Feeds.atom(string);
        } else if (type === 'rss') {
          return Feeds.rss(string);
        }

        // could not parse the file to throw an error
        response.error = new Error('parse error');
        throw response;
      });
  }

  /**
   *
   * @param {string} str
   * @return {*|null} the image url extracted from the string
   */
  static image(str) {
    str = str || '';
    let imgMatch = str.match(/src="[\w\W]+?"/) || '';
    let img_url = (imgMatch[0] || '').replace('src="', '').replace('"', '');
    return img_url || null;
  }

  /**
   * Convert an atom rss feed to the proper json structure for the REST API
   * @param {string} xml
   * @return {object||null} an JSON object containing the properties of the feed.
   */
  static atom(xml) {
    let feed;

    try {
      feed = parser.toJson(xml, PARSER_OPTIONS).feed;
    } catch (e) {}

    // bad data - return null
    if (!feed) {
      return null;
    }

    let source = {
      title : feed.title || null,
      img_url : feed.icon || null,
      link: (feed.link || {}).href || null
    };

    let entries = feed.entry || [];

    // when there is only one item the parse set entry to the entry json, not an array
    if (!Array.isArray(entries)) {
      entries  = [entries];
    }

    // map the entries
    let items = entries.map((entry) => {
      entry.link = entry.link || {};
      entry.content = entry.content || {};

      return {
        title: entry.title || null,
        link: entry.link.href || null,
        img_url: Feeds.image(entry.content.$t),
      }
    });


    return {
      source,
      items
    };
  }

  /**
   * Convert an atom rss feed to the proper json structure for the REST API
   * @param {string} xml
   * @return {object||null} an JSON object containing the properties of the feed.
   */
  static rss(xml) {
    let channel;

    try {
      channel = parser.toJson(xml, PARSER_OPTIONS).rss.channel;
    } catch (e) {}

    // bad data - return null
    if (!channel) {
      return null;
    }


    let source = {
      title : channel.title || null,
      link : channel.link || null,
      img_url : (channel.image || {}).url || null
    };

    let items = channel.item || [];

    if (!Array.isArray(items)) {
      items = [items];
    }

    // map items
    items = items.map((item) => {
      return {
        title: item.title || null,
        link: item.link || null,
        img_url: Feeds.image(item.description)
      }
    });

    return {
      source,
      items
    };
  }

  /**
   * @param {string} xml
   * @return {string|null} returns "atom", "rss", or null when it is neither.
   */
  static identify(xml) {
    if (/<rss /i.test(xml)) {
      return "rss";
    } else if (/<feed /i.test(xml)) {
      return "atom";
    } else {
      return null;
    }
  }
}



module.exports = Feeds;