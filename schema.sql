DROP TABLE IF EXISTS app_users;
DROP TABLE IF EXISTS tracks;
DROP TABLE IF EXISTS user_tracks;

CREATE TABLE app_users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    user_name VARCHAR(255),
    spotify_user_id VARCHAR(255)
);

CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    track_name VARCHAR(255),
    artist VARCHAR(255),
    album VARCHAR(255),
    release_date VARCHAR(255),
    genre VARCHAR(255),
    spotify_track_id VARCHAR(255)
);

CREATE TABLE users_tracks (
    id SERIAL PRIMARY KEY,
    track_id INT,
    user_id INT,
    CONSTRAINT fk_app_users
      FOREIGN KEY(user_id) 
	  REFERENCES app_users(id),
    CONSTRAINT fk_tracks
      FOREIGN KEY(track_id) 
	  REFERENCES tracks(id)
);