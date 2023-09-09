// index.js

const express = require('express')
const { fetchTrackCollection } = require('./discogs')

const app = express()
const PORT = 3000

app.get('/fetch-tracks', async (req, res) => {
	try {
		const tracks = await fetchTrackCollection()
		console.log('TRACK COLLECTION: ', tracks)
		res.status(200).send('Tracks fetched and logged successfully!')
	} catch (error) {
		console.error('ERROR: ', error)
		res.status(500).send('Error fetching tracks.')
	}
})

app.listen(PORT, () => {
	console.log(`Server started on http://localhost:${PORT}`)
})
