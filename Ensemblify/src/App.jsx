import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const CLIENT_ID = '7853a85331ec49398963a63212cdfe93'
  const REDIRECT_URI = 'http://localhost:5173'
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
  const RESPONSE_TYPE = 'token'
  const SCOPE = 'user-top-read'

  const [token, setToken] = useState('')
  const [topArtists, setTopArtists] = useState([])

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

  useEffect(() => {
    const getData = async () => {
      const { data } = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setTopArtists(data.items)
    }
    getData()
  }, [token])

  return (
    <>
      <h1>Ensemblify</h1>
      {!token ? <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>Login to Spotify</a>
        : <button onClick={handleLogout}>Logout</button>}

      {token ?
        <div>
          {topArtists.map(el => <div><h2>{el.name}</h2><img src={el.images[0].url}></img></div>)}
        </div>
        : <h2>Please Login</h2>
      }


    </>
  )
}

export default App
