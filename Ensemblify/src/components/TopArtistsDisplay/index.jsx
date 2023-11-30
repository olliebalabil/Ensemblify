import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ArtistButton, Playlist } from "../../components"

export default function TopArtistsDisplay({ spotifyApi }) {
  const [selectedArtists, setSelectedArtists] = useState([])
  const [trackData, setTrackData] = useState([])
  const [artists, setArtists] = useState([])
  const [showCreateButton, setShowCreateButton] = useState(false)



  useEffect(() => {
    console.log(selectedArtists)
  }, [selectedArtists])

  useEffect(() => {
    const getData = async () => {
      axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then((response) => {
          setArtists(response.data.items)
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
  }, [localStorage.getItem("token")])

  const handleMix = () => {
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

  const handleCreate = () => {
    let playlistId = '';
    spotifyApi.createPlaylist("Mashify Playlist", { "description": `A playlist containing tracks from artists similar to your chosen artists`, "public": false })
      .then(function (response) {
        console.log("created playlist")
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
        console.log("tracks added");
      })
      .catch(function (err) {
        console.error({ "error": err });
      });
  };


  return (
    
        <div className='top-artists'>
        {showCreateButton ? <button onClick={handleCreate} className='action-btn'>Create</button>
          : <div>
            <button className='action-btn' onClick={handleMix}>Mix</button>
            <button className='action-btn'>Search</button>
          </div>

        }
          {artists.map((el, i) => <ArtistButton key={i} data={el} selectedArtists={selectedArtists} setSelectedArtists={setSelectedArtists} />)}
        </div>
      
  )
}
