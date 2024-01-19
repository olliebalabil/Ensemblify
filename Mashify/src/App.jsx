import { useState, useEffect } from 'react'
import axios from 'axios'
import SpotifyWebApi from 'spotify-web-api-node'
import { TopArtistsDisplay } from './components'
import './App.css'



function App() {
  //for deployed site
  // const CLIENT_ID = '1d89b9275bfc466ea6825462930ab7a7'
  // const REDIRECT_URI = 'https://mashify.onrender.com/'
  //for development

  // const CLIENT_ID = '7853a85331ec49398963a63212cdfe93'
  // const REDIRECT_URI = 'http://localhost:5173'

  const CLIENT_ID = '1d89b9275bfc466ea6825462930ab7a7'
  const REDIRECT_URI = 'https://mashify.onrender.com/'
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
  const RESPONSE_TYPE = 'token'
  const SCOPE = 'user-top-read playlist-modify-public playlist-modify-private user-read-private user-read-email' //remove unnecessary scopes
  const [token, setToken] = useState('')
  const [reset,setReset] = useState(0)
  const [showCreateButton, setShowCreateButton] = useState(false)
  const [subtitle,setSubtitle] = useState('Select Two Artists to Mix')

  const spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI
  })

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

  useEffect(() => {
    if (token) {
      axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then((response) => {
          window.localStorage.setItem("user_id", response.data.id)
        })
        .catch((err) => {
          console.error(err.message)
          localStorage.removeItem("token")
          window.location.reload()

        })
    }
  }, [token])

  useEffect(()=>{
    if(showCreateButton) {
      setSubtitle('Create the Playlist and Add to Your Spotify Account')
    } else {
      setSubtitle('Select Two Artists to Mix')
    }
  },[showCreateButton])

  const handleLogout = () => {
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('user_id')
    setToken('')
  }
  const handleReset = () => {
    setReset(prevState => prevState + 1)
  }


  return (
    <>
      <div >

        {!token ? <div className='header fancy'>
          <div className='title'>
            <h1 className='mashify-title' >Mashify</h1>
          </div>
          <a className="login-link" href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>Login to Spotify</a>
        </div>
          : <div className='header-logged-in fancy'>
            <a className="logout-link" onClick={handleLogout}>Logout</a>
            <div className='title'>
              <h1 className='mashify-title' onClick={handleReset}>Mashify</h1>
              <h2>{subtitle}</h2>
            </div>
          </div>}

      </div>
      {token &&
        <TopArtistsDisplay spotifyApi={spotifyApi} reset={reset} setReset={setReset} showCreateButton={showCreateButton} setShowCreateButton={setShowCreateButton} />
        
      }



    </>
  )
}

export default App
