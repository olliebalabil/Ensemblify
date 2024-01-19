import React, {useState} from 'react'

export default function ArtistButton({data, selectedArtists, setSelectedArtists, showCreateButton}) {
  const [isActive,setIsActive]=useState(false)

  const handleClick = () =>{
    if (selectedArtists.length<2 && !selectedArtists.includes(data.id)) { //adding an artist
      setIsActive(!isActive)
      setSelectedArtists(prevState => [...prevState,data.id])
    } else if (selectedArtists.includes(data.id)){ //taking away artist
      setIsActive(!isActive)
      setSelectedArtists(prevState => prevState.filter(el => el!=data.id))

    }
 
    
  }

  return (
    <div className={`artist-button ${isActive && !showCreateButton ? 'active' :''} ${selectedArtists.length == 2 && !isActive ? 'in-active' : ''} ${showCreateButton ? 'in-active rec-artist': ''}`} key={data.id} onClick={handleClick} data-active={false}>
      <div><img src={data.images[0].url}></img></div><h3>{data.name}</h3></div>
  )
}
