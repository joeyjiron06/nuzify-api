const expect = require('chai').expect;
const FeedReed = require('feed-read');
const fs = require('fs');
const Feeds = require('../../src/Feeds');


describe('Feeds', () => {
  let atomXML;

  before(() => {
    atomXML = fs.readFileSync('test/fixtures/atom.feed.xml', 'utf8');
  });

  describe('parse', () => {
    it('should parse feeds into a json structure', () => {



      FeedReed.atom(atomXML, '', (err, data) => {
        let firstPost = data[0];
        expect(firstPost.title).to.equal('Do we need a wearable voice recorder to take notes for us?');
        expect(firstPost.published.toString()).to.equal(new Date('2017-02-20T17:53:19-05:00').toString());
        expect(firstPost.author).to.equal('Ashley Carman');
        expect(firstPost.link).to.equal("http://www.theverge.com/circuitbreaker/2017/2/20/14673906/senstone-kickstarter-campaign-release");
        expect(firstPost.content).to.equal('<img alt=""src="https://cdn0.vox-cdn.com"/> <p id="PV747w">The Verge </p>');
        expect(firstPost.feed.link).to.equal('http://www.theverge.com/');
      });



    });
  });

});