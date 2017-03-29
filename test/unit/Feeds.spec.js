const expect = require('chai').expect;
const fs = require('fs');
const Feeds = require('../../src/Feeds');
const fixtureServer = require('../lib/mock-server');

const PORT = 4000;

describe('Feeds', () => {


  describe('atom', () => {
    it('should parse feeds into a json structure', () => {
      let xml = fs.readFileSync('test/fixtures/atom.feed.xml', 'utf8');
      let data = Feeds.atom(xml);

      expect(data.source).to.deep.equal({
        title : 'The Verge - All Posts',
        img_url: 'https://cdn3.vox-cdn.com/community_logos/34086/verge-fv.png',
        link : 'http://www.theverge.com/'
      });

      expect(data.items[0]).to.deep.equal({
        title : 'This Lamborghini is the fastest production car ever to lap the Nürburgring',
        link : 'http://www.theverge.com/2017/3/6/14837790/lamborghini-huracan-performante-unveil-geneva-motor-show-2017',
        img_url : 'https://cdn0.vox-cdn.com/thumbor/38QtYlvQYSZeOCotESIKrU4fBX0=/493x0:4824x2887/1310x873/cdn0.vox-cdn.com/uploads/chorus_image/image/53570647/Huracan_Performante_High__5_.0.jpg'
      });

      expect(data.items[1]).to.deep.equal({
        title : 'This is a test',
        link : 'http://www.test.com/hello-test',
        img_url : 'https://test.com/image.jpg'
      });
    });

    it('should return null if an invalid xml is specified', () => {
      expect(Feeds.atom('')).to.be.null;
      expect(Feeds.atom('bad data!')).to.be.null;
      expect(Feeds.atom(null)).to.be.null;
      expect(Feeds.atom(undefined)).to.be.null;
      expect(Feeds.atom(12)).to.be.null;
      expect(Feeds.atom({})).to.be.null;
      expect(Feeds.atom(function(){})).to.be.null;
    });

    it('should return a json with no link when no link is specified', () => {
      let xml = fs.readFileSync('test/fixtures/atom.feed.xml', 'utf8');

      // remove the link from the fixture and make sure it still parses
      xml = xml.replace('<link type="text/html" href="http://www.theverge.com/" rel="alternate"/>', '');
      let data = Feeds.atom(xml);
      expect(data.source.link).to.be.null;
    });

    it('should return an empty array when no entries are in xml', () => {
      let xml = '<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en"></feed>';
      let data = Feeds.atom(xml);
      expect(data.items).to.have.length(0);
    });

    it('should return entries that dont have links', () => {
      let xml = '<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en"><entry><title>Test</title></entry></feed>';
      let data = Feeds.atom(xml);
      expect(data.items[0].title).to.equal('Test');
    });

    it('should return nulls for title, img_url, and link in ENTRY when there is no values', () => {
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
          <entry/>
         </feed>
      `;
      let data = Feeds.atom(xml);
      expect(data.items[0]).to.deep.equal({
        title : null,
        link : null,
        img_url : null
      });
    });
  });


  describe('rss', () => {
    it('should parse feeds into a json structure', () => {
      let xml = fs.readFileSync('test/fixtures/rss.feed.xml', 'utf8');
      let data = Feeds.rss(xml);

      expect(data.source).to.deep.equal({
        title : 'Engadget RSS Feed',
        img_url : 'https://www.blogsmithmedia.com/www.engadget.com/media/feedlogo.gif?cachebust=true',
        link : 'https://www.engadget.com/rss.xml'
      });

      expect(data.items[0]).to.deep.equal({
        title : 'How to stop the Nintendo Switch\'s Joy-Con from losing sync',
        link : 'https://www.engadget.com/2017/03/07/how-to-stop-the-nintendo-switchs-joy-con-from-losing-sync/',
        img_url : 'https://s.aolcdn.com/dims-shared/dims3/GLOB/crop/1600x1049+0+0/resize/1600x1049!/format/jpg/quality/85/https://s.aolcdn.com/hss/storage/midas/9b8dc9fed589c7cd0a90dd138d485d31/204974161/Nintendo+Switch+preview+gallery+11.jpg'
      });

      expect(data.items[1]).to.deep.equal({
        title : 'How Sonos made the new Playbase sound a lot better than it should',
        link : 'https://www.engadget.com/2017/03/07/sonos-playbase-speaker-hands-on-behind-the-scenes/',
        img_url : 'https://s.aolcdn.com/hss/storage/midas/bd85837ea7312b8381be4b38144d91cf/205017524/DSCF5843.jpg'
      });
    });

    it('should return null if an invalid xml is specified', () => {
      expect(Feeds.rss('')).to.be.null;
      expect(Feeds.rss('bad data!')).to.be.null;
      expect(Feeds.rss(null)).to.be.null;
      expect(Feeds.rss(undefined)).to.be.null;
      expect(Feeds.rss(12)).to.be.null;
      expect(Feeds.rss({})).to.be.null;
      expect(Feeds.rss(function(){})).to.be.null;
    });

    it('should return only one item when one item is in the xml', () => {
      let xml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:dc="https://purl.org/dc/elements/1.1/" xmlns:itunes="https://www.itunes.com/dtds/podcast-1.0.dtd">
        <channel>
          <item>
            <title><![CDATA[Test title]]></title>
            <link>https://www.test.com/test-article/</link>
          </item>
        </channel>
      </rss>
      `;

      let data = Feeds.rss(xml);

      expect(data.items[0]).to.deep.equal({
        title : 'Test title',
        link : 'https://www.test.com/test-article/',
        img_url : null
      });
    });

    it('should return nulls for title, img_url, and link when there is no values', () => {
      let xml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:dc="https://purl.org/dc/elements/1.1/" xmlns:itunes="https://www.itunes.com/dtds/podcast-1.0.dtd">
        <channel>
          <test/>
        </channel>
      </rss>
      `;

      let data = Feeds.rss(xml);
      expect(data.source).to.deep.equal({
        title : null,
        link: null,
        img_url : null
      });


      expect(data.items).to.have.length(0);
    });

    it('should return nulls for title, img_url, and link in ITEM when there is no values', () => {
      let xml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:dc="https://purl.org/dc/elements/1.1/" xmlns:itunes="https://www.itunes.com/dtds/podcast-1.0.dtd">
        <channel>
          <item/>
        </channel>
      </rss>
      `;

      let data = Feeds.rss(xml);

      expect(data.items[0]).to.deep.equal({
        title : null,
        link : null,
        img_url : null
      });
    });
  });


  describe('identify', () => {
    it('shuold return rss when rss feed is specified', () => {
      let xml = `<?xml version="1.0"?>
        <rss version="2.0" xmlns:dc="https://purl.org/dc/elements/1.1/"
            xmlns:itunes="https://www.itunes.com/dtds/podcast-1.0.dtd">
        </rss>`;
      expect(Feeds.identify(xml)).to.equal('rss');
    });

    it('shuold return atom when feed is specified', () => {
      let xml = `<?xml version="1.0"?>
        <?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
        </feed>`;
      expect(Feeds.identify(xml)).to.equal('atom');
    });

    it('should return null when invalid param is passed in', () => {
      expect(Feeds.identify('')).to.be.null;
      expect(Feeds.identify('123')).to.be.null;
      expect(Feeds.identify(null)).to.be.null;
      expect(Feeds.identify(undefined)).to.be.null;
      expect(Feeds.identify(23)).to.be.null;
      expect(Feeds.identify({})).to.be.null;
      expect(Feeds.identify(function(){})).to.be.null;
    });
  });


  describe('fetch', () => {

    before(() => {
      fixtureServer.init(PORT);
    });

    after(() => {
      fixtureServer.destroy();
    });

    it('should return a promise', () => {
      expect(Feeds.fetch('http://hi.com')).to.be.an.instanceof(Promise);
    });

    it('should return parsed feed item when passed an RSS url', (done) => {
      Feeds.fetch(`http://localhost:${PORT}/rss.feed.xml`)
        .then((feed) => {
          expect(feed).to.be.an.object;
          expect(feed.source).to.deep.equal({
            title : 'Engadget RSS Feed',
            img_url : 'https://www.blogsmithmedia.com/www.engadget.com/media/feedlogo.gif?cachebust=true',
            link : 'https://www.engadget.com/rss.xml'
          });
          expect(feed.items[0]).to.deep.equal({
            title : "How to stop the Nintendo Switch's Joy-Con from losing sync",
            img_url : 'https://s.aolcdn.com/dims-shared/dims3/GLOB/crop/1600x1049+0+0/resize/1600x1049!/format/jpg/quality/85/https://s.aolcdn.com/hss/storage/midas/9b8dc9fed589c7cd0a90dd138d485d31/204974161/Nintendo+Switch+preview+gallery+11.jpg',
            link : 'https://www.engadget.com/2017/03/07/how-to-stop-the-nintendo-switchs-joy-con-from-losing-sync/',
          })
        })
        .then(done)
        .catch(done);
    });


    it('should return parsed feed item when passed an ATOM url', (done) => {
      Feeds.fetch(`http://localhost:${PORT}/atom.feed.xml`)
        .then((feed) => {
          expect(feed).to.be.an.object;
          expect(feed.source).to.deep.equal({
            title : 'The Verge - All Posts',
            img_url : 'https://cdn3.vox-cdn.com/community_logos/34086/verge-fv.png',
            link : 'http://www.theverge.com/'
          });
          expect(feed.items[0]).to.deep.equal({
            title : "This Lamborghini is the fastest production car ever to lap the Nürburgring",
            img_url : 'https://cdn0.vox-cdn.com/thumbor/38QtYlvQYSZeOCotESIKrU4fBX0=/493x0:4824x2887/1310x873/cdn0.vox-cdn.com/uploads/chorus_image/image/53570647/Huracan_Performante_High__5_.0.jpg',
            link : 'http://www.theverge.com/2017/3/6/14837790/lamborghini-huracan-performante-unveil-geneva-motor-show-2017'
          })
        })
        .then(done)
        .catch(done);
    });


    it('should reject the promise with a parse error when the url is not a valid feed', (done) => {
      Feeds.fetch(`http://localhost:${PORT}/invalid.feed.xml`)
        .catch((response) => {
          expect(response.error.message).to.equal('parse error');
        })
        .then(done)
    });

    it('should reject the promise with a 404 status code', (done) => {
      Feeds.fetch(`http://localhost:${PORT}/I_DO_NOT_EXIST`)
        .catch((response) => {
          expect(response.statusCode).to.equal(404);
        })
        .then(done)
    });
  });
});