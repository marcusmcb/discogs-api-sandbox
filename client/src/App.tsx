import React, { useState } from 'react'
import axios from 'axios'
import './App.css'

type Track = {
	[key: string]: string | number
	artist: string
	title: string
	duration: string
	year: number
	bpm: string
}

const App = () => {
	const [trackCollection, setTrackCollection] = useState<Track[]>([])
	const [editField, setEditField] = useState<{
		row: number
		col: string
	} | null>(null)
	const [sortColumn, setSortColumn] = useState<string | null>(null)
	const [isAscending, setIsAscending] = useState<boolean>(true)

	const handleDataClick = async (event: React.FormEvent) => {
		try {
			const response = await axios.get(`http://localhost:5000/fetch-tracks`)
			console.log('EXPRESS RESPONSE: ')
			console.log(response.data)
			setTrackCollection(response.data)
		} catch (error) {
			console.log('CLICK ERROR: ')
			console.log(error)
		}
	}

	const handleSort = (column: string) => {
		// Toggle sort direction if column is re-selected
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
		value: string | number
	) => {
		if (editField?.row === rowIndex && editField.col === column) {
			return (
				<input
					value={value}
					onChange={(e) => handleValueChange(rowIndex, column, e.target.value)}
					onBlur={() => setEditField(null)}
				/>
			)
		}
		return value
	}

	return (
		<div className='App'>
			<div className='button-box'>
				<div style={{ padding: '15px', fontWeight: '600', fontSize: '20px' }}>
					Vinyl Collection App
				</div>
				<button
					style={{ marginBottom: '15px' }}
					onClick={(event) => {
						handleDataClick(event)
					}}
				>
					Get Data
				</button>
			</div>

			<hr />
			{trackCollection.length === 0 ? (
				<div className='button-box'>No tracks</div>
			) : (
				<div>
					<table style={{ borderCollapse: 'collapse' }}>
						<thead>
							<tr>
								{['artist', 'title', 'duration', 'year', 'bpm'].map(
									(column) => (
										<th
											key={column}
											onClick={() => handleSort(column)}
											style={{ cursor: 'pointer', padding: '8px' }}
										>
											{column}
										</th>
									)
								)}
							</tr>
						</thead>
						<tbody>
							{trackCollection.map((track, rowIndex) => (
								<tr
									key={rowIndex}
									style={{ borderBottom: '1px solid lightgrey' }}
								>
									{Object.keys(track).map((column) => (
										<td
											key={column}
											onDoubleClick={() => handleDoubleClick(rowIndex, column)}
											style={{ padding: '8px' }}
										>
											{renderCell(rowIndex, column, (track as any)[column])}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

export default App
