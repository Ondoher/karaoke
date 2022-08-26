# karaoke
Karaoke Pi Software

DEVELOPER INSTRUCTIONS
----------------------
To install 

* clone this repository.
* `cd shell`
* `npm install`
* `cd app`
* `npm install`
* make a directory named 'content' and into that copy mp3 and cdg files

You should also `npm install -g electron`

There are two processes that need to be run. First in the app directory run `node server.js`. This is the application that the electron shell will run.

When that is running, then in the shell directory run `electron .`. This will launch the electron shell and run the application.

PI DEPLOYMENT INSTRUCTIONS
--------------------------
(coming soon!)
