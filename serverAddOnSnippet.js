const userObjectArray = [];
function MakeUserObject (data){

  this.first_name = data.  first_name
  this.last_name = data.   last_name
  this.user_name = data.   user_name  
  this.top_artist = data.  top_artist 
  this.top_album = data.  top_album
  this.preview_url = data.  preview_url
  this.top_artist = data.   top_artist  
  this.top_album = data.  top_album  
  this.top_album_release_date = data.  top_album_release_date   
  this.top_album_cover_url = data.  top_album_cover_url  
  userObjectArray.push(this);

}

function MakeNewTrack (data) {
  this.track_name = data. track_name  
  this.artist = data.  artist 
  this.album = data.  album 
  this.release_date = data. release_date  
  this.genre = data.  genre 
  this.spotify_track_id = data.  spotify_track_id 
  this.preview_url = data.   preview_url
}