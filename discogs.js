const Discogs = require('disconnect').Client
const dotenv = require('dotenv')

dotenv.config()

const token = process.env.DISCOGS_ACCESS_TOKEN
const discogs = new Discogs({ userToken: token })

const db = discogs.database()
const col = discogs.user().collection()

const fetchTrackCollection = async () => {
	const trackCollection = []

	return new Promise((resolve, reject) => {
		try {
			// db.getRelease(20873707, (err, data) => {
			// 	if (err) {
			// 		return reject(err)
			// 	} else {
			// 		console.log('DATA: ')
			// 		console.log(data.artists)
			// 		// console.log(data.tracklist)
			// 		data.tracklist.forEach((track) => {
			// 			console.log(track.artists)
			// 			console.log(track.title)
			// 		})
			// 	}
			// })

			col.getReleases(
				'marcusmcb',
				0,
				{ page: 1, per_page: 35 },
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

							let trackLabels = []

							if (data.labels) {
								if (data.labels.length > 1) {
									for (let i = 0; i < data.labels.length; i++) {
										console.log(data.labels[i].name)
										trackLabels.push(data.labels[i].name)
									}
								} else {
									trackLabels.push(data.labels[0].name)
								}
							}

							if (trackLabels.length > 1) {
								const uniqueLabels = (arr) => {
									return [...new Set(arr)]
								}
								trackLabels = uniqueLabels(trackLabels)
								console.log("SET? ", trackLabels)
							}

							data.tracklist.forEach((track) => {
								// console.log('-----------------------------')
								// console.log('TRACK: ', track)
								let artistString = ''
								// console.log("MAIN ARTIST?: ")
								// console.log(data.artists)
								if (data.artists[0].name === 'Various') {
									// console.log('-----------------')
									// console.log('TRACK ARTIST: ', track.artists[0].name)
									// console.log('TITLE: ', track.title)
									artistString = track.artists[0].name
								} else {
									// console.log('-----------------')
									// console.log('MAIN ARTIST:', data.artists[0].name)
									// console.log('TITLE: ', track.title)
									for (let i = 0; i < data.artists.length; i++) {
										// console.log("ARTIST NAME:")
										// console.log(data.artists[i].name, i)
										// console.log('---------------')
										artistString += data.artists[i].name
										if (i !== data.artists.length - 1) {
											artistString += data.artists[i].join
												? ` ${data.artists[i].join} `
												: ' & '
										}
									}
								}

								// if (artistString === 'Various') {
								// 	for (let i = 0; i < data.tracklist.length; i++) {
								// 		console.log("HERE: ", data.tracklist[i].artists.name)
								// 	}
								// 	console.log("**********************")
								// 	console.log("ARTIST DATA: ")
								// 	console.log(data.tracklist)
								// 	console.log("**********************")
								// }

								const transformedTrack = {
									artist: artistString,
									title: track.title,
									duration: track.duration,
									year: data.year && data.year !== 0 ? data.year : '',
									bpm: '',
									genre: data.genres ? data.genres : '',
									style: data.styles ? data.styles : '',
									country: data.country ? data.country : '',
									labels: trackLabels,
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
			console.log('DISCOGS ERROR: ')
			console.log(error)
			reject(error)
		}
	})
}

module.exports = {
	fetchTrackCollection,
}
