import { useState, useEffect } from 'react'
import axios from 'axios'
import SpotifyWebApi from 'spotify-web-api-node'
import { TopArtistsDisplay } from './components'
import './App.css'



function App() {
  //for deployed site
  // const CLIENT_ID = '1d89b9275bfc466ea6825462930ab7a7'
  // const REDIRECT_URI = 'https://mashify.onrender.com/'
  const CLIENT_ID = '7853a85331ec49398963a63212cdfe93'
  const REDIRECT_URI = 'http://localhost:5173'
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
  const RESPONSE_TYPE = 'token'
  const SCOPE = 'user-top-read playlist-modify-public playlist-modify-private user-read-private user-read-email' //remove unnecessary scopes
  const [token, setToken] = useState('')

  const spotifyApi = new SpotifyWebApi({
    clientId: '7853a85331ec49398963a63212cdfe93',
    redirectUri: 'http://localhost:5173'
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

  useEffect(()=>{
    if (token) {
      axios.get("https://api.spotify.com/v1/me",{
        headers:{
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then((response)=>{
        window.localStorage.setItem("user_id",response.data.id)
      })
      .catch((err)=>{
        console.error(err.message)
      })
    }
  },[token])

  const handleLogout = () => {
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('user_id')
    setToken('')
  }



  return (
    <>
      <h1 className='mashify-title'>Mashify</h1>
      {!token ? <a className="login-link" href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>Login to Spotify</a>
        : <a className="login-link" onClick={handleLogout}>Logout</a>}

      {token ?
        <TopArtistsDisplay spotifyApi={spotifyApi}/>
        : <h2>Login to get started</h2>
      }


    </>
  )
}

export default App
