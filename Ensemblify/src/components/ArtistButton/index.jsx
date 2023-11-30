import React, {useState} from 'react'

export default function ArtistButton({data, selectedArtists, setSelectedArtists}) {
  const [isActive,setIsActive]=useState(false)

  const handleClick = () =>{
    setIsActive(!isActive)
    if (selectedArtists.includes(data.id)) {
      setSelectedArtists(prevState => prevState.filter(el => el!=data.id))
    } else {
      setSelectedArtists(prevState => [...prevState, data.id])
    }
  }

  return (
    <div className={`artist-button ${isActive ? 'active' :''}`} key={data.id} onClick={handleClick} data-active={false}><img src={data.images[0].url}></img></div>
  )
}
