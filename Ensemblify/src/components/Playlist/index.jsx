import React from 'react'

export default function Playlist({trackData}) {
  return (
    <div>
      {trackData.map((el,i)=><div>{el}</div>)}
    </div>
  )
}
