import React, { useState } from 'react'
import './trackcollection.css'

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

type TrackCollectionProps = {
	trackCollection: Track[]
	sortColumn: string | null
	handleSort: (column: string) => void
	handleDoubleClick: (row: number, col: string) => void
	renderCell: (
		rowIndex: number,
		column: string,
		value: string | number | string[]
	) => React.ReactNode
	searchQuery: string
	setSearchQuery: (query: string) => void
}

const TrackCollection: React.FC<TrackCollectionProps> = ({
	trackCollection,
	sortColumn,
	handleSort,
	handleDoubleClick,
	renderCell,
	searchQuery,
	setSearchQuery,
}) => {
	const [resizing, setResizing] = useState<null | {
		initialX: number
		column: string
	}>(null)
	const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
		{}
	)

	const startResize = (e: React.MouseEvent, column: string) => {
		// Prevent default behavior to stop any text selection while resizing
		e.preventDefault()

		setResizing({ initialX: e.clientX, column })
		// Attach event listeners
		window.addEventListener('mousemove', doResize)
		window.addEventListener('mouseup', stopResize)
	}

	const doResize = (e: MouseEvent) => {
		if (!resizing) return

		// Find the th element
		const thElement = document.querySelector(
			`th[data-column="${resizing.column}"]`
		)
		if (!thElement) return

		// Calculate width difference
		const widthDiff = e.clientX - resizing.initialX
		const newWidth = thElement.getBoundingClientRect().width + widthDiff

		setColumnWidths((prevWidths) => ({
			...prevWidths,
			[resizing.column]: newWidth,
		}))

		// Update the initialX for the next mousemove event
		if (resizing) {
			setResizing({
				...resizing,
				initialX: e.clientX,
			})
		}
	}

	const stopResize = () => {
		// Remove event listeners
		window.removeEventListener('mousemove', doResize)
		window.removeEventListener('mouseup', stopResize)
		// Stop resizing
		setResizing(null)
	}

	const filterTracks = (tracks: Track[]): Track[] => {
		if (!searchQuery.trim()) return tracks // Return all tracks if search is empty
		return tracks.filter((track) =>
			Object.values(track).some((value) =>
				Array.isArray(value)
					? value.some((item) =>
							item.toLowerCase().includes(searchQuery.toLowerCase())
					  )
					: value.toString().toLowerCase().includes(searchQuery.toLowerCase())
			)
		)
	}

	return (
		<div className='vinyl-track-collection'>
			<input
				type='text'
				placeholder='Search tracks...'
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>

			<table style={{ borderCollapse: 'collapse' }}>
				<thead>
					<tr>
						{[
							'artist',
							'title',
							'duration',
							'year',
							'bpm',
							'format',
							'genre',
							'subgenre',
							'country',
							'label(s)',
						].map((column) => (
							<th
								key={column}
								onClick={() => handleSort(column)}
								style={{
									cursor: 'pointer',
									padding: '8px',
									textAlign: 'left',
									position: 'relative',
									width: columnWidths[column]
										? `${columnWidths[column]}px`
										: 'auto',
								}}
							>
								{column}
								<div
									style={{
										position: 'absolute',
										top: 0,
										right: 0,
										bottom: 0,
										width: '5px',
										cursor: 'ew-resize',
									}}
									onMouseDown={(e) => startResize(e, column)}
								></div>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{filterTracks(trackCollection).map((track, rowIndex) => (
						<tr key={rowIndex} style={{ borderBottom: '1px solid lightgrey' }}>
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
	)
}

export default TrackCollection
