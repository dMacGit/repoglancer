# Repoglancer Webserver

Simple Nodejs webserver to show basic updated stats of users github repositories.

## Installation

- Download & install node. See guide [here](https://nodejs.org/en/download/)
- Install request library via npm. Libray info [here](https://github.com/request/request).
>\# npm install request
- Install express framework via npm. Libray info [here](https://expressjs.com/)
>\# npm install express --save
- Clone this project to your target folder
>\#Sudo Git clone https://github.com/dMacGit/repoglancer.git

## Usage

Navigate to the install/target directory, open terminal and run:
>\# node app

This should start the server on the local machine on port # 3000
Open a webpage at this address: http://localhost:3000 

The server reads updated stats on repositories using Github's api on a selected user.
By default it loads this repo's owners details.

### What it shows

Displays list of Repos with basic stats on:

- Repo name.
- Branch version/tag & current commit
- Build status
- Readme state (Last Updated)
- Latest Release version.

## Roadmap

This is currently being worked on.
List of future updates/feature improvements:

- Work on displaying the details on the webpage. (Look nice)
- Separate out the ServerTime.js script. Would like this loaded dynamically from [repo](https://github.com/dMacGit/ServerTime).
- Add ability to change the github user via the webpage. (I.E a textfield/box)


