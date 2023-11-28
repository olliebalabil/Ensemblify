import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ArtistButton } from "../../components"

export default function TopArtistsDisplay() {
  const [topArtists, setTopArtists] = useState([])
  const [selectedArtists, setSelectedArtists] = useState([])


  useEffect(() => {
    const getData = async () => {
      const { data } = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      setTopArtists(data.items)
    }
    if (localStorage.getItem("token")) {
      getData()
    }
  }, [localStorage.getItem("token")])

  useEffect(() => {
    console.log("artist", selectedArtists)
  }, [selectedArtists])

  const handleMix = () => {
    //get related artists for each selected artist
    let relatedArtists = selectedArtists
    const getRelatedArtists = async (id) => {
      const { data } = await axios.get(`https://api.spotify.com/v1/artists/${id}/related-artists`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      for (let j = 0; j < data.artists.length; j++) {
        if (j < 10) {
          relatedArtists.push(data.artists[j].id)
        }
      }
    }
    const addToRelatedArtists = () => {
      for (let i = 0; i < selectedArtists.length; i++) {
        getRelatedArtists(selectedArtists[i])
      }
      //remove repeats
      relatedArtists = [...new Set(relatedArtists)]
    }

    //get top tracks for each related artist
    let tracks = []
    const getTracks = async (id) => {
      const { data } = await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=ES`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      for (let j = 0; j < data.tracks.length; j++) {
        tracks.push([data.tracks[j].uri, data.tracks[j].name])
      }
    }

    const addToTracks = async () =>{
      await addToRelatedArtists()
      for (let i = 0; i < relatedArtists.length; i++) {
        getTracks(relatedArtists[i])
      }
    }
    addToTracks()
  }
  return (
    <div>
      <button onClick={handleMix}>Mix</button>
      {topArtists.map(el => <ArtistButton key={el.id} data={el} selectedArtists={selectedArtists} setSelectedArtists={setSelectedArtists} />)}

    </div>
  )
}
