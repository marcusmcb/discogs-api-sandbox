import React, { useState } from 'react'
import axios from 'axios'
import TrackCollection from './components/TrackCollection'
import './App.css'

type Track = {
	[key: string]: string | number | string[]
	artist: string
	title: string
	duration: string
	year: number
	bpm: string
	format: string
	genre: string[]
	style: string[]
	country: string
	labels: string[]
}

const App = () => {
	const [trackCollection, setTrackCollection] = useState<Track[]>([])
	const [editField, setEditField] = useState<{
		row: number
		col: string
	} | null>(null)
	const [sortColumn, setSortColumn] = useState<string | null>(null)
	const [isAscending, setIsAscending] = useState<boolean>(true)
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [profileName, setProfileName] = useState<string>('')

	const handleDataClick = async (event: React.FormEvent) => {
		try {
			console.log('PROFILE?: ', profileName)
			const response = await axios.get(`http://localhost:5000/fetch-tracks`, {
				params: {
					profileName: profileName,
				},
			})
			console.log('EXPRESS RESPONSE: ')
			console.log(response.data)
			setTrackCollection(response.data)
		} catch (error) {
			console.log('CLICK ERROR: ')
			console.log(error)
		}
	}

	const handleSort = (column: string) => {
		if (sortColumn === column) {
			setIsAscending(!isAscending)
		} else {
			setIsAscending(true)
			setSortColumn(column)
		}

		const sorted = [...trackCollection].sort((a, b) => {
			if (a[column] < b[column]) return isAscending ? -1 : 1
			if (a[column] > b[column]) return isAscending ? 1 : -1
			return 0
		})
		setTrackCollection(sorted)
	}

	const handleDoubleClick = (row: number, col: string) => {
		setEditField({ row, col })
	}

	const handleValueChange = (
		row: number,
		col: string,
		value: string | number
	) => {
		const updatedTracks = [...trackCollection]
		updatedTracks[row][col] = value
		setTrackCollection(updatedTracks)
	}

	const renderCell = (
		rowIndex: number,
		column: string,
		value: string | number | string[]
	) => {
		const renderCellContent = Array.isArray(value) ? value.join(', ') : value

		if (editField?.row === rowIndex && editField.col === column) {
			return (
				<input
					value={renderCellContent.toString()} // Convert to string in case it's an array or number
					onChange={(e) => handleValueChange(rowIndex, column, e.target.value)}
					onBlur={() => setEditField(null)}
				/>
			)
		}
		return renderCellContent
	}

	return (
		<div className='App'>
			<div className='button-box'>
				<div style={{ padding: '15px', fontWeight: '600', fontSize: '20px' }}>
					Vinyl Collection App
				</div>
				<div style={{ padding: '15px' }}>
					Enter your Discogs profile name below:
				</div>
				<input
					type='text'
					placeholder='Enter Discogs profile name'
					value={profileName}
					onChange={(e) => setProfileName(e.target.value)}
				/>

				<button
					style={{ marginBottom: '15px', marginTop: '15px' }}
					onClick={(event) => {
						handleDataClick(event)
					}}
				>
					{trackCollection.length !== 0 ? 'Update Data' : 'Get Track Data'}
				</button>
			</div>

			<hr />
			{trackCollection.length === 0 ? (
				<div className='button-box'>No tracks</div>
			) : (
				<TrackCollection
					trackCollection={trackCollection}
					sortColumn={sortColumn}
					handleSort={handleSort}
					handleDoubleClick={handleDoubleClick}
					renderCell={renderCell}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
				/>
			)}
		</div>
	)
}

export default App
