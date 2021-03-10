DROP TABLE IF EXISTS users_tracks;
DROP TABLE IF EXISTS tracks;
DROP TABLE IF EXISTS app_users;

CREATE TABLE app_users (
    id SERIAL PRIMARY KEY,
    fave_artist VARCHAR(255),
    display_name VARCHAR(255),
    spotify_user_id VARCHAR(255) UNIQUE
);

CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    track_name VARCHAR(255),
    artist VARCHAR(255),
    album_name VARCHAR(255),
    release_date VARCHAR(255),
    genres VARCHAR(255),
    spotify_track_id VARCHAR(255),
    preview_url VARCHAR(255),
    app_user_id INT,
    user_rank INT,
    global_plays INT,
    user_plays INT,
    popularity INT,
    last_time_user_played VARCHAR(255),
    album_cover_url VARCHAR(255),
    CONSTRAINT fk_app_users
      FOREIGN KEY(app_user_id) 
    REFERENCES app_users(id)
);
