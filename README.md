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
- **You will need to create a Github personal Oauth token from in your github account.** This is needed due to possible rate limits that the server may hit.
  Read [this](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) handy guide on how to do this.
- Now save this _token-name_ and _token_ in a **token.txt** file within a subfolder called **oauth** in the target directory. The _token-name_ and _token_ should look like this in **token.txt** file:
>tokenName:token

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


 
