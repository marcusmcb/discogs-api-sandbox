const Discogs = require("disconnect").Client;

const db = new Discogs().database();
const col = new Discogs().user().collection();

db.getRelease(579312, (err, data) => {
  console.log(data.year);
  console.log(data.artists[0].name);
  console.log(data.genres);
  console.log(data.styles);
  console.log(data.tracklist);
});

col.getReleases("marcusmcb", 0, { page: 1, per_page: 5 }, (err, data) => {
  console.log("DATA: ");
  console.log(data.releases);
  data.releases.map((item) => {
    db.getRelease(item.id, (err, data) => {
      console.log("YEAR: ", data.year);
      console.log("ARTIST: ", data.artists[0].name);
      console.log(data.genres);
      console.log(data.styles);
      console.log(data.tracklist);
    });
  });

  //   function extractTitleAndArtists(data) {
  //     return data.map(item => ({
  //       title: item.basic_information.title,
  //       artists: item.basic_information.artists[0]
  //     }));
  //   }

  //   const result = extractTitleAndArtists(data.releases);
  //   console.log(result);
});
