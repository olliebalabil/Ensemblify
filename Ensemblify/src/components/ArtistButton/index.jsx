import React, {useState} from 'react'

export default function ArtistButton({data, selectedArtists, setSelectedArtists}) {

  const handleClick = () =>{
    if (selectedArtists.includes(data.id)) {
      setSelectedArtists(prevState => prevState.filter(el => el!=data.id))
    } else {
      setSelectedArtists(prevState => [...prevState, data.id])
    }
  }

  return (
    <div className="artist-button" key={data.id} onClick={handleClick}><h2>{data.name}</h2><img src={data.images[0].url}></img></div>
  )
}
