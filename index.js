const Discogs = require('disconnect').Client

const db = new Discogs().database()
const col = new Discogs().user().collection()

const trackCollection = []

try {
	col.getReleases('marcusmcb', 0, { page: 1, per_page: 5 }, (err, data) => {
		data.releases.map((item) => {
			db.getRelease(item.id, (err, data) => {
				data.tracklist.map((track) => {
					let artistString = ''

					for (let i = 0; i < data.artists.length; i++) {
						artistString += data.artists[i].name
						if (i !== data.artists.length - 1) {
							artistString += data.artists[i].join
								? ` ${data.artists[i].join} `
								: ' & '
						}
					}

					const transformedTrack = {
						artist: artistString,
						title: track.title,
						duration: track.duration,
						year: data.year && data.year !== 0 ? data.year : '',
						bpm: '',
					}

					// Push each transformedTrack to the trackCollection array
					trackCollection.push(transformedTrack)
				})

				console.log('TRACK COLLECTION: ', trackCollection)
			})
		})
	})
} catch (error) {
	console.error('ERROR: ', error)
}
