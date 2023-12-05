import React from 'react'
import {PlaylistItem} from "../../components"

export default function Playlist({trackData}) {
  return (
    <div>
      {trackData.map((el,i)=><PlaylistItem key={i} data={el}/>)}
    </div>
  )
}
