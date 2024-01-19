import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ArtistButton, Playlist } from "../../components"


export default function TopArtistsDisplay({ spotifyApi, reset, setReset, showCreateButton,setShowCreateButton }) {
  const [selectedArtists, setSelectedArtists] = useState([])
  const [artists, setArtists] = useState([])

  const [showForm, setShowForm] = useState(false)
  const [newArtist, setNewArtist] = useState('')
  const [message, setMessage] = useState('Create')
  const [mixMessage, setMixMessage] = useState('Mix')

  useEffect(() => {
    setSelectedArtists([])
    setShowCreateButton(false)
    setShowForm(false)
    setNewArtist('')
  }, [reset])

  useEffect(() => {
    const getData = async () => {
      axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then((response) => {
          setArtists(response.data.items.splice(0, 5))
        })
        .catch((err) => {
          console.error(err)
          if (err.response.status == 401) {
            localStorage.removeItem("token")
          }
        })
    }
    if (localStorage.getItem("token")) {
      getData()
      spotifyApi.setAccessToken(localStorage.getItem("token"))
    }
  }, [localStorage.getItem("token"), reset])



  const handleMix = () => {
    if ([...selectedArtists].length==2) {
      setArtists([]) // add selected artist back
      for (let i = 0; i < selectedArtists.length; i++) { //reset selectedArtists after this?
        spotifyApi.getArtistRelatedArtists(selectedArtists[i])
          .then(function (data) {
            let arr = data.body.artists.sort(() => Math.random() - 0.5)
            for (let j = 0; j < arr.length && j < 4; j++) { //add a limit on artists recommended
              setArtists(prevState => [...prevState, { id: arr[j].id, name: arr[j].name, images: [{ url: arr[j].images[0].url }] }])
            }
          }, function (err) {
            console.error({ "Error": err.message })
          })
      }
      setShowCreateButton(!showCreateButton)
    } else {
      setMixMessage("Select Two Artists First")
      setTimeout(()=>{
        setMixMessage("Mix")
      },1800)
    }
  }

  const handleCreate = () => {
    let playlistId = '';

    spotifyApi.createPlaylist("Mashify Playlist", { "description": `A playlist containing tracks from artists similar to your chosen artists`, "public": false })
      .then(function (response) {
        playlistId = response.body.id;
        const promises = [];

        for (let i = 0; i < artists.length; i++) {
          const trackPromise = spotifyApi.getArtistTopTracks(artists[i].id, 'GB')
            .then(function (response) {
              return response.body.tracks.map(el => el.uri);
            })
            .catch(function (err) {
              console.error({ "error": err });
              return []; // Return an empty array if there's an error
            });

          promises.push(trackPromise);
        }

        // Wait for all promises to resolve
        return Promise.all(promises);
      })
      .then(function (allTopTracks) {
        // Flatten the array of track URIs
        const trackData = allTopTracks.flat().sort(() => Math.random() - 0.5)

        return spotifyApi.addTracksToPlaylist(playlistId, trackData);
      })
      .then(function (response) {
        setMessage("Playlist created!")
        setTimeout(() => {
          setReset(prevState => prevState + 1)
          setMessage("Create")
        }, 5000)
      })
      .catch(function (err) {
        console.error({ "error": err });
      });
  };

  const handleSearch = () => {
    if (!showForm) {
      setShowForm(true)
    }
  }
  const handleTextInput = (e) => {
    setNewArtist(e.target.value)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    spotifyApi.searchArtists(newArtist)
      .then(function (data) {
        setArtists(prevState => [...prevState, data.body.artists.items[0]])
        setTimeout(()=>{
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        },200)
      })
    setNewArtist('')
    setShowForm(false)
  }

  return (

    <div className='top-artists'>
      <div className="buttons">
    {showCreateButton && <button onClick={handleCreate} className='action-btn create'>{message}</button>}
    {!showCreateButton && <button className={[...selectedArtists].length == 2 ? 'action-btn mix' : 'action-btn mix non-clickable'} onClick={handleMix}>{mixMessage}</button>}
    {!showCreateButton &&
      <button className='action-btn search ' onClick={handleSearch}>{showForm ?
        <form className="search-form" onSubmit={handleSubmit}>
          <input type="text" value={newArtist} onChange={handleTextInput} placeholder='Add an Artist' />
          <input type="submit" value="Add" />
        </form>
        : <p>Search</p>}
      </button>}

      </div>
      <div className={`artists ${showCreateButton ? 'rec-grid':'mix-grid'} `}>

    {artists.map((el, i) => <ArtistButton key={i} data={el} showCreateButton={showCreateButton} selectedArtists={selectedArtists} setSelectedArtists={setSelectedArtists} />)}
      </div>
  </div>

  )
}
