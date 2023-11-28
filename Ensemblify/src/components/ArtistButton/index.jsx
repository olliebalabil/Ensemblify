import React, {useState} from 'react'

export default function ArtistButton({data, selectedArtists, setSelectedArtists}) {

  const handleClick = () =>{
    if (selectedArtists.includes(data)) {
      setSelectedArtists(prevState => prevState.filter(el => el!=data))
    } else {
      setSelectedArtists(prevState => [...prevState, data])
    }
  }

  return (
    <div key={data.id} onClick={handleClick}><h2>{data.name}</h2><img src={data.images[0].url}></img></div>
  )
}
