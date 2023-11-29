import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ArtistButton, Playlist } from "../../components"

export default function TopArtistsDisplay({ spotifyApi }) {
  const [topArtists, setTopArtists] = useState([])
  const [selectedArtists, setSelectedArtists] = useState([])
  const [trackData, setTrackData] = useState([])
  const [showPlaylist, setShowPlaylist] = useState(false)

  const mockTrackData = [
    "spotify:track:52Bg6oaos7twR7IUtEpqcE",
    "spotify:track:15Iczlf2Xl2s4EiLFrkYeg",
    "spotify:track:0Ziohm1Ku8E2yUDYoclfhO",
    "spotify:track:5AMrnF761nziCWUfjBgRUI",
    "spotify:track:1bFPKxP56XWDXJOwo3Kvfp",
    "spotify:track:4HqRhdpxH9zFUkf1kzbr3H",
    "spotify:track:4xfAVJL8R7mVYbDk8a9xOY",
    "spotify:track:0AYECTSiSlE8sQtGKypxx2",
    "spotify:track:4gRySBzWoWD2JqEFZnfPuX",
    "spotify:track:6tPiCU4LFsXUQPRIykOAnl",
    "spotify:track:4kbMNRyFzBoqPxLxX1Q2Jq",
    "spotify:track:5ckwOX7SVzt9OISbGkD299",
    "spotify:track:6iI6NXjtI3IkjK2k1juqaX",
    "spotify:track:1EfWxxlaLLiwnLS3ABr8vu",
    "spotify:track:3Xy16SYnhBiSBL5yUXaHG1",
    "spotify:track:0tvepqOHxqKt2PYRcLTHRR",
    "spotify:track:1L8n3DR0g5w36X51i2k8A4"
  ]

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
      axios.get(`https://api.spotify.com/v1/artists/${id}/related-artists`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then((response) => {
          for (let j = 0; j < response.data.artists.length; j++) {
            if (j < 5) { //returns 5 related artists
              getTracks(response.data.artists[j].id)
            }
          }
        })

        .catch((err) => {
          console.error("error", err.message)
        })
    }

    //get top tracks for each related artist
    const getTracks = async (id) => {
      const { data } = await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=GB`, { //change market
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      for (let j = 0; j < data.tracks.length; j++) {
        tracks.push(data.tracks[j])
      }
    }

    const addToRelatedArtists = () => {
      for (let i = 0; i < selectedArtists.length; i++) {
        getTopTracks(selectedArtists[i])
      }
    }

    const addPlaylist = async () => {
      await addToRelatedArtists()
      setTrackData(tracks)
      setShowPlaylist(!showPlaylist)
      spotifyApi.createPlaylist("Ensemblify Playlist", { 'description': 'Featuring recommendations based on your favourite artists', 'public': false })
        .then(function (data) {
          spotifyApi.addTracksToPlaylist(data.body.id, tracks)
            .then(function (data) {
              console.log("Tracks added", data)
              setShowPlaylist(!showPlaylist)
            }, function (err) {
              console.log("error", err)
            })
        }, function (err) {
          console.log('Error', err)

        })
    }
    addPlaylist()
  }

  return (
    <div>
        <div>
          <button onClick={handleMix}>Mix</button>
          <div className='top-artists'>
            {topArtists.map(el => <ArtistButton key={el.id} data={el} selectedArtists={selectedArtists} setSelectedArtists={setSelectedArtists} />)}
          </div>
        </div>

    </div>
  )
}
