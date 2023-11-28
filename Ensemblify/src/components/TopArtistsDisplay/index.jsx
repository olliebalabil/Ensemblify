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

  useEffect(()=>{
    console.log(selectedArtists)
  },[selectedArtists])

  return (
    <div>
      {topArtists.map(el => <ArtistButton key={el.id} data={el} selectedArtists={selectedArtists}setSelectedArtists={setSelectedArtists}/>)}

    </div>
  )
}
