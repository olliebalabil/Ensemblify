import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ArtistButton, Playlist } from "../../components"

export default function TopArtistsDisplay({ spotifyApi, reset, setReset }) {
  const [selectedArtists, setSelectedArtists] = useState([])
  const [artists, setArtists] = useState([])
  const [showCreateButton, setShowCreateButton] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newArtist, setNewArtist] = useState('')
  const [message, setMessage] = useState('Create')

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
            for (let j = 0; j < data.body.artists.length && j < 4; j++) { //add a limit on artists recommended
              setArtists(prevState => [...prevState, { id: data.body.artists[j].id, name: data.body.artists[j].name, images: [{ url: data.body.artists[j].images[0].url }] }])
            }
          }, function (err) {
            console.error({ "Error": err.message })
          })
      }
      setShowCreateButton(!showCreateButton)
    }
  }

  const handleCreate = () => {
    let playlistId = '';
    function shuffle(array) {
      let currentIndex = array.length, randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }

      return array;
    }
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
        const trackData = allTopTracks.flat();

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
      })
    setNewArtist('')
    setShowForm(false)
  }

  return (

    <div className='top-artists'>
      <div className="buttons">
    {showCreateButton && <button onClick={handleCreate} className='action-btn'>{message}</button>}
    {!showCreateButton && <button className={[...selectedArtists].length == 2 ? 'action-btn' : 'action-btn non-clickable'} onClick={handleMix}>Mix</button>}
    {!showCreateButton &&
      <button className='action-btn search' onClick={handleSearch}>{showForm ?
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
