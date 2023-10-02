const Discogs = require('disconnect').Client;
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.DISCOGS_ACCESS_TOKEN;
const discogs = new Discogs({ userToken: token });

const db = discogs.database();
const col = discogs.user().collection();

async function fetchTrackCollection(discogsProfileName) {
  const trackCollection = [];
  let page = 1;
  const per_page = 45;

  while (true) {
    const data = await getReleasePage(discogsProfileName, page, per_page);
    const releases = data.releases;

    for (const item of releases) {
      await sleep(1000);  // Delay before fetching release details.
      const releaseData = await getReleaseDetails(item.id);

      // The following is your code for processing each release and populating trackCollection.
      let trackLabels = [];
      const format = releaseData.formats[0].descriptions[0];
      console.log("------------")
      console.log(releaseData)
      if (releaseData.labels) {
        if (releaseData.labels.length > 1) {
          for (let i = 0; i < releaseData.labels.length; i++) {
            trackLabels.push(releaseData.labels[i].name);
          }
        } else {
          trackLabels.push(releaseData.labels[0].name);
        }
      }

      if (trackLabels.length > 1) {
        trackLabels = [...new Set(trackLabels)];
      }

      releaseData.tracklist.forEach((track) => {
        let artistString = '';
        if (releaseData.artists[0].name === 'Various' || track.artists) {
          if (!track.artists) {
            artistString = ''
          } else {
            artistString = track.artists[0].name;
          }
        } else {
          for (let i = 0; i < releaseData.artists.length; i++) {
            artistString += releaseData.artists[i].name;
            if (i !== releaseData.artists.length - 1) {
              artistString += releaseData.artists[i].join
                ? ` ${releaseData.artists[i].join} `
                : ' & ';
            }
          }
        }

        const transformedTrack = {
          artist: artistString,
          title: track.title,
          duration: track.duration,
          year: releaseData.year && releaseData.year !== 0 ? releaseData.year : '',
          bpm: '',
          format: format,
          genre: releaseData.genres ? releaseData.genres : [],
          style: releaseData.styles ? releaseData.styles : [],
          country: releaseData.country ? releaseData.country : '',
          labels: trackLabels,
        };

        trackCollection.push(transformedTrack);
      });

    }

    if (data.pagination.page === data.pagination.pages) {
      break;  // All pages fetched
    }

    page++;
    await sleep(1000);  // Delay before fetching the next page.
  }

  return trackCollection;
}

function getReleasePage(username, page, per_page) {
  return new Promise((resolve, reject) => {
    col.getReleases(username, 0, { page, per_page }, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

function getReleaseDetails(releaseId) {
  return new Promise((resolve, reject) => {
    db.getRelease(releaseId, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  fetchTrackCollection,
};
