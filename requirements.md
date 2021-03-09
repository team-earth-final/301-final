# *Music-Lyfe*

# Vision

What is the vision of this product?

- The goal is this applications creation was to make the users listening stats more useful to them. 
- We used the data that is up to a year old to creat playlists based on that users music taste. 
- We also generated new music to listen to based on that users most listened to genre.
- Compile music from different streaming platforms to make it easier for the user to listen to their favorite music.

What pain point does this project solve?

- For the user, it eases the ardous task of curating and searching for new music and creates a space to look into the listeing sytles of others. 
- This app would allow users to sign in and see trending on their listening history as well as compare that to other users. We also wanted to remind our users of the songs they may have forgotten about or haven’t listened to for a while.

Why should we care about your product?

Our app is able to display information that you might have known was stored. We packaged that info with a bow and brought it right to you.

# Scope (In/Out)
- This application will provide music sugestions specific to the users listening habits.
- This application will provide song information.

## OUT - What will your product not do.

- It will not require a username/password user profile creation.
- Multiple screens will not be able to utlize that same account to stream

# MVP 

What will your MVP functionality be?

- An application that uses a sign in and then displays your top song with details.
- The ability to allow a user to sign in and see metrics around their Spotify listening history. Any additional API (potentially song lyrics) Spotify API Could use (sample) JSON Log-In Spotify API How will store user info? Normalize listening history

What are your stretch goals?

- Song lyrics displayed.
- Automated playlist creation.
- Which 10 songs have not been listened for the last year?
- Our app aims to help the user ease the annoyance of trying to integrate playlists for cross-platform streaming 
- Suggest playlist based on your mood. 
- We also wanted to pull down songs from certain groups and create a playlist automatically for the users.
# Domain Modeling 

## Domain Model
![image](https://user-images.githubusercontent.com/66962689/110508556-1d1da600-80cf-11eb-87c7-211c4af54a13.png)
## Database Relationship Model
![image](https://user-images.githubusercontent.com/66962689/110508754-58b87000-80cf-11eb-91ff-cdf234018a08.png)
## WIRE FRAME DIAGRAM
![image](https://user-images.githubusercontent.com/66962689/110508687-42aaaf80-80cf-11eb-874f-e32d19a459df.png)



# Functional Requirements

- An user can link their account through their spotify
- Users can retrieve song data.
- A user can access year old song data.

# Non-Functional Requirements

- Security: We will need to protect our users login information. We plan use utilize the dotenv and .gitignore witha secret KEY to do so. Users will be able to athenticate with putting their information at risk of vulnerabitly.
- Availability : Our application will be availible to users using spotify. We plan to build our app in a way that is eventually fucntioal to users that subscribe to different music platforms.

# USER STORIES:
As a user I want to create a playlist based on my music taste so that it is easier to find songs that I like.

As a user I want to find songs or playlists curated based on it having similarities to the music I already listen to.

As a user, after sign in, I want to be able to see my most played genres by month over the last year.

As a user I would like to be able to click on and view details on a song including lyrics.

As a user, I want to be able to see a list of my most listened to songs, my saved songs, my most listened to albums and artists.
