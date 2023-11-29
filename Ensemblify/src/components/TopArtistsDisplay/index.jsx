import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ArtistButton } from "../../components"

export default function TopArtistsDisplay({spotifyApi}) {
  const [topArtists, setTopArtists] = useState([])
  const [selectedArtists, setSelectedArtists] = useState([])
  const [recommendedTracks, setRecommendedTracks] = useState([])


  useEffect(() => {
    const getData = async () => {
      axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then((response) => {
          setTopArtists(response.data.items)
        })
        .catch((err) => {
          console.error(err.response.status)
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
    //get related artists for each selected artist
    let tracks = []
    const getTopTracks = async (id) => {
      const { data } = await axios.get(`https://api.spotify.com/v1/artists/${id}/related-artists`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      for (let j = 0; j < data.artists.length; j++) {
        if (j < 5) { //returns 5 related artists
          getTracks(data.artists[j].id)
        }
      }
    }

    //get top tracks for each related artist
    const getTracks = async (id) => {
      const { data } = await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=GB`, { //change market
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      for (let j = 0; j < data.tracks.length; j++) {
        tracks.push(data.tracks[j].uri)
        setRecommendedTracks(tracks)
      }
    }

    const addToRelatedArtists = () => {
      for (let i = 0; i < selectedArtists.length; i++) {
        getTopTracks(selectedArtists[i])
      }
    }

    const addToPlaylist = async () => {
      spotifyApi.createPlaylist("Ensemblify Playlist", {'description': 'Featuring recommendations based on your favourite artists', 'public': false})
      .then(function(data) {
        spotifyApi.addTracksToPlaylist(data.body.id, recommendedTracks)
        .then(function(data) {
          console.log("Tracks added", data)
        }, function(err){ 
          console.log("error",err)
        })
      }, function (err) {
        console.log('Error', err)
      })
    }


    addToRelatedArtists()
    addToPlaylist()
  }
  return (
    <div>
      <button onClick={handleMix}>Mix</button>
      <div className='top-artists'>
        {topArtists.map(el => <ArtistButton key={el.id} data={el} selectedArtists={selectedArtists} setSelectedArtists={setSelectedArtists} />)}
      </div>

    </div>
  )
}
