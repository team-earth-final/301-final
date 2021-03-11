console.log('sanity 1')

window.onSpotifyWebPlaybackSDKReady = () => {
  const token = 'BQC3r2eU-CQfSGwa-w0FOHarhcWs4G9letH4psaOSPyeNkj1YUTzIRn0mp5RDoWsBo4JcDmQSNaLewp0IfEv44Rxs3D2X1_gmhJDeWLCf66-kG9HHt0fNkNln5QzwV24OPoT1Xgh4H3TRoxx-q2mccfCIlkyEk-Exyk'; //need one
  const player = new Spotify.Player({
    name: 'potato',
    getOAuthToken: cb => { cb(token); }
  });

  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error(message); });
  player.addListener('authentication_error', ({ message }) => { console.error(message); });
  player.addListener('account_error', ({ message }) => { console.error(message); });
  player.addListener('playback_error', ({ message }) => { console.error(message); });

  // Playback status updates
  player.addListener('player_state_changed', state => { console.log(state); });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  player.connect();
};