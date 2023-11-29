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
          for (let j = 0; j < data.body.artists.length && j< 4; j++) { //add a limit on artists recommended
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
    spotifyApi.createPlaylist("Ensemblify Playlist", {"description":"", "public":false})
      .then(function(response){
        console.log("Created Playlist");
        playlistId = response.body.id;
      }, function(err){
        console.error({"error":err})
      })
      .then(function(response){
        for (let i = 0; i<artists.length;i++) {
          spotifyApi.getArtistTopTracks(artists[i].id,'GB')
            .then(function(response){
              let tracks = []
              for (let j = 0; j < response.body.tracks;j++) {
                tracks.push(response.body.tracks[j].uri)
              }
              setTrackData(tracks)
            },function(err){
              console.error({"error":err})
            })
        }
      })
      .then(function(response){
        spotifyApi.addTracksToPlaylist(playlistId,trackData)
          .then(function(data){
            console.log("tracks added!")
          }, function(err){
            console.error({"error":err})
          })
      },function(err){
        console.error({"error":err})
      })
  }

  return (
    <div>
      <div>
        {showCreateButton ? <button onClick={handleCreate}>Create</button>
          : <button onClick={handleMix}>Mix</button>

        }
        <div className='top-artists'>
          {artists.map((el, i) => <ArtistButton key={i} data={el} selectedArtists={selectedArtists} setSelectedArtists={setSelectedArtists} />)}
        </div>
      </div>

    </div>
  )
}
