import { useState, useEffect } from 'react'
import axios from 'axios'
import { TopArtistsDisplay } from './components'
import './App.css'

function App() {
  const CLIENT_ID = '7853a85331ec49398963a63212cdfe93'
  const REDIRECT_URI = 'http://localhost:5173'
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
  const RESPONSE_TYPE = 'token'
  const SCOPE = 'user-top-read'
  const [token, setToken] = useState('')

  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(el => el.startsWith("access_token")).split("=")[1]
      window.location.hash = ''
      window.localStorage.setItem("token", token)
    }
    setToken(token)

  }, [])

  const handleLogout = () => {
    window.localStorage.removeItem('token')
    setToken('')
  }



  return (
    <>
      <h1>Ensemblify</h1>
      {!token ? <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>Login to Spotify</a>
        : <button onClick={handleLogout}>Logout</button>}

      {token ?
        <TopArtistsDisplay />
        : <h2>Please Login</h2>
      }


    </>
  )
}

export default App
