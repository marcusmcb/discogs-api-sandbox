import React from 'react'
import axios from 'axios'
import './App.css'

const App = () => {
	const handleDataClick = async (event: React.FormEvent) => {
    try {
      const response = await axios.get(`http://localhost:5000/fetch-tracks`)
      console.log("EXPRESS RESPONSE: ")
      console.log(response.data)
    } catch (error) {
      console.log("CLICK ERROR: ")
      console.log(error)
    }
		
	}

	return (
		<div className='App'>
			<div style={{ padding: '15px', fontWeight: '600' }}>
				Vinyl Collection App
			</div>
			<hr />
			<button
				onClick={(event) => {
					handleDataClick(event)
				}}
			>
				Get Data
			</button>
		</div>
	)
}

export default App
