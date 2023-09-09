const Discogs = require('disconnect').Client

const db = new Discogs().database()
const col = new Discogs().user().collection()

const fetchTrackCollection = async () => {
	const trackCollection = []

	return new Promise((resolve, reject) => {
		try {
			col.getReleases(
				'marcusmcb',
				0,
				{ page: 1, per_page: 20 },
				(err, data) => {
					if (err) {
						return reject(err)
					}

					let pendingReleases = data.releases.length // Keep track of releases being processed

					data.releases.forEach((item) => {
						db.getRelease(item.id, (err, data) => {
							if (err) {
								return reject(err)
							}

							data.tracklist.forEach((track) => {
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

								trackCollection.push(transformedTrack)
							})

							pendingReleases-- // Decrement the count after processing each release

							if (pendingReleases === 0) {
								resolve(trackCollection) // If all releases are processed, resolve the promise
							}
						})
					})
				}
			)
		} catch (error) {
			reject(error)
		}
	})
}

// Usage
// ;(async () => {
// 	try {
// 		const tracks = await fetchTrackCollection()
// 		console.log('TRACK COLLECTION: ', tracks)
// 	} catch (error) {
// 		console.error('ERROR: ', error)
// 	}
// })()

module.exports = {
  fetchTrackCollection
}
