const request = require('request')
const fs = require('fs')
const os = require('os')
const timeGrabber = require('./serverTime.js')
const express = require('express')
const app = express()
const port = 3000

/*
  Repoglance Nodejs Application

  Description: 

  Simple Nodejs app which queries a 'users' github repositories.
  Grabs some basic info to show current state of each repo.
  - Repo name, 
  - Readme last update,
  - Current master/branch versions,
  - Latest branches commits,
  - Build errors, ???
  - Current Tag
  - Release version
  It then displays this in the web page/app for easy viewing.
*/

//Below are Oauth login credentials
//This is required for more than 60 request/hour
var TOKEN_FOLDER_PATH = "./oauth/"
var TOKEN_FILE = "token.txt"
var oauth_name = ""
var oauth_token = ""
var RATE_LIMITED = false;

// Response variables
var base_response_json = "{ Url Error: No data returned }";
var repo_response_json;
var repo_readme_json;
var rate_limit_check;

// Request URL variables
var USER_NAME = 'dMacGit' //<-- Change this based on github username/profile
var URL_RATE_LIMIT_CHECK = "https://api.github.com/rate_limit";
var URL_USER_BASE_REQUEST = 'https://api.github.com/users/'+USER_NAME;
var URL_USER_FOUND_REPOS = URL_USER_BASE_REQUEST+'/repos';
var URL_USER_REPO_BASE = URL_USER_FOUND_REPOS+'/' // Add RepoName to end
var URL_REPO_COMMIT_REQUEST_README_PREFIX = 'https://api.github.com/repos/'+USER_NAME+'/' // Add RepoName to end
var URL_REPO_COMMIT_REQUEST_README_SUFFIX = '/commits/master?path=README.md';
var URL_REPO_TAGS_PREFIX = URL_USER_REPO_BASE // Add RepoName to end
var URL_REPO_TAGS_SUFFIX = '/tags'
var URL_REPO_RELEASES_PREFIX = URL_USER_REPO_BASE // Add RepoName to end
var URL_REPO_RELEASES_SUFFIX = '/releases'

// User Repository variables
var REPOS_lastUpdated;
var REPO_Number;
var REPO_List  = {};

// Below are some JSON object templates
/*
Using Json to store custom object: {
 repo_name: 
 "last_updateTime",
 "last_commit",
 "readme_last_updateTime",
 latest_tag = { time, version, description},
 latest_release = { time, version, description},
 rawRepoObject,
}
*/
var latest_tag = { "tag_version": "", "tag_time": "", "tag_description": ""};
var latest_release = { "release_version": "", "release_time": "", "release_description": "" };
var REPO_Meta = { "repo_name": "", "repo_desc": "", "last_repoUpdateTime": "", "last_commit": "", "readme_last_updateTime": "", "latest_tag": {}, "latest_release": {}, "raw_RepoData":{} };

// Server sync variables
var lastUpdatedTime;
var update_Limit = 1; //<-- Set this as default to 15 (Minutes)

/*
  TODO/Notes on procedures:

  - Grab user base repo page [https://api.github.com/users/USER_NAME]
  - Get list of Repos/porjects [https://api.github.com/users/USER_NAME/repos]
  - Store last update time & commit id for Repo
  - Get contents url (Json object list) to Check README.md file details [https://api.github.com/users/USER_NAME/repos/REPO_NAME/contents/] ?? Not needed now, see below
  - {README.md} Use [https://api.github.com/users/USER_NAME/repos/REPO_NAME/commits?path=README.md] after Repo to get commits targeting README.md file updates.
   (Use jsonObject[0].commit.committer.date for latest commit)
  - {Tags} Use [https://api.github.com/repos/USER_NAME/REPO_NAME/tags] to get object list of repo tags (jsonObject[0].name)
  - {Releases} Use [https://api.github.com/repos/USER_NAME/REPO_NAME/releases] and JsonObject[0].tag_name to get latest release version
   (Use object[0].name to get release name, and object[0].body to get description)

*/

/*
  { Token_Loader } Simple file reader function to load token into app
*/
function Token_Loader(dir,fileName)
{
  console.log(dir+fileName)
  var data = fs.readFileSync(dir+fileName, "utf8")
  {
    oauth_name = data.toString().split(':')[0];
    oauth_token = data.toString().split(':')[1];
    console.log("Loaded Oauth token:",oauth_name);
  };
  
};

/*
  {Query_User} Main url requester fucntion

  This is used by decorator functions [] to simplify url reqesting
  Handles header generating, and error handling of request/reponses
  Also keeps track of update time for controll of server syncing and cacheing

  Takes as input the URL_QUERY string, RETURN_DATA object, and third Boolean flag* (*Look into removing this flag!)
  Uses promise/resove principle to return data to calling functions
*/
function query_user(url_query, result_data, query_base)
{

  return new Promise((resolve, reject) => {
      var auth = "token "+oauth_token.toString();
      request({

        headers: {
          'User-Agent': USER_NAME,
          'Authorization': auth,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        //Authorization: "token "+oauth_token,
        uri: url_query,
        method: 'GET'
      }, function(error,response,body)
      {
        if(response.statusCode != 403)
        {
          lastUpdatedTime = timeGrabber.returnTime();
          console.log("User: ["+USER_NAME+"] git details cached @ ",lastUpdatedTime);
          result_data = JSON.parse(body);
          resolve(result_data);
          console.log('status-code:',response && response.statusCode); //Print out response and status.

        }
        else
        {
          console.error('error:',error); //Handle (Catch) any error
          console.log('status-code:',response && response.statusCode); //Print out response and status.
          RATE_LIMITED = true;
          throw new Error("[ 403 Error! ] Rate Limited");
          return
        }
      });
    });

};

/*
  {Query_User_Base} Asynchronous base query function

  This passes decorated url and data objects for the main "Query_User" url requester function

  Controlls requests to do with the user's base github profile
  Updates the "base_response_json" object
*/
async function query_user_Base()
{
  try
  {
    base_response_json = await query_user(URL_USER_BASE_REQUEST, base_response_json, true);
    //console.log(base_response_json);
    //REPO_Number = base_response_json.public_repos;
    console.log("User: ",base_response_json.login,"\nRepo count: ",base_response_json.public_repos,"\nLast updated: ",base_response_json.updated_at);
  }
  catch (error)
  {
    console.error("Query_user await function Error!");
    console.error(error);
  }
};

/*
  {Query_User_Repos} Asynchronous repository query function

  This passes decorated url and data objects for the main "Query_User" url requester function

  Controlls requests for users repositories

  Updates the "repo_response_json" object
*/
async function query_user_Repos()
{
  try
  {
    repo_response_json = await query_user(URL_USER_FOUND_REPOS, repo_response_json, false);
    /*JSON.Array repo_list = repo_response_json*/
    //console.log(repo_response_json);
    //update_Repos_Stats();
    //console.log("User: ",base_response_json.login,"\nRepo count: ",base_response_json.public_repos,"\nLast updated: ",base_response_json.updated_at);
  }
  catch (error)
  {
    console.error("Query_user await function Error!");
    console.error(error);
  }

};


async function update_all_repos()
{
  //First check rate Limit
  try
  {
    rate_limit_check = await query_user(URL_RATE_LIMIT_CHECK, rate_limit_check, true);
    //console.log(base_response_json);
    
    console.log("Rate limit check: ",rate_limit_check);
  }
  catch (error)
  {
    console.error("Base response await function Error!");
    console.error(error);
  }
  if (RATE_LIMITED)
  {
    throw new Error("[ 403 Error! ] Rate Limited");
    return
  }

  try
  {
    base_response_json = await query_user(URL_USER_BASE_REQUEST, base_response_json, true);
    //console.log(base_response_json);
    REPO_Number = base_response_json.public_repos;
    console.log("User: ",base_response_json.login,"\nRepo count: ",base_response_json.public_repos,"\nLast updated: ",base_response_json.updated_at);
  }
  catch (error)
  {
    console.error("Base response await function Error!");
    console.error(error);
  }

  try
  {
    repo_response_json = await query_user(URL_USER_FOUND_REPOS, repo_response_json, false);
  }
  catch (error)
  {
    console.error("Repo response await function Error!");
    console.error(error);
  }

  console.log("Storing Repo meta....");
  for (var i = 0; i < REPO_Number; i++) 
  {
    //Construct Json Meta object
    var REPO_Meta = {};
    var repo_name = repo_response_json[i].name;
    try
    {
      var readme_url = URL_REPO_COMMIT_REQUEST_README_PREFIX+repo_name+URL_REPO_COMMIT_REQUEST_README_SUFFIX;
      var readme_json = await query_user(readme_url, readme_json, false);
    }
    catch (error)
    {
      console.error("Readme request await function Error!");
      console.error(error);
    }
    REPO_Meta["repo_name"] = repo_name;
    REPO_Meta["repo_desc"] = repo_response_json[i].description;
    REPO_Meta["last_repoUpdateTime"] = repo_response_json[i].updated_at;
    //console.log("++ Test readme object output ++",readme_json);
    REPO_Meta["readme_last_updateTime"] = readme_json.commit.committer.date;
    REPO_Meta["readme_last_updateMessage"] = readme_json.commit.message;
    REPO_Meta["raw_RepoData"] = repo_response_json[i];
    
    REPO_List[repo_name] = REPO_Meta;
    console.log("==================\nRepo number:",i,"\nName:",REPO_List[repo_name].repo_name,"\n--> Saved!\n=================");
    //console.log("Printing out the Meta data:",REPO_List[repo_name]);
  
  }

};


/*
  {Query_User_Repos_Readmes} Asynchronous repository query function for readme.md files

  This passes decorated url and data objects for the main "Query_User" url requester function

  Controlls requests for readme files on repositories
  
  #
*/
async function query_user_repos_readmes()
{
  //TODO
  /*
  - {README.md} Use [https://api.github.com/users/USER_NAME/repos/REPO_NAME/commits?path=README.md] after Repo to get commits targeting README.md file updates.
   (Use jsonObject[0].commit.committer.date for latest commit)
   */
  try
  {
    repo_response_json = await query_user(URL_USER_FOUND_REPOS, repo_response_json, false);
    /*JSON.Array repo_list = repo_response_json*/
    //console.log(repo_response_json);
    update_Repos_Stats();
    //console.log("User: ",base_response_json.login,"\nRepo count: ",base_response_json.public_repos,"\nLast updated: ",base_response_json.updated_at);
  }
  catch (error)
  {
    console.error("Query_user await function Error!");
    console.error(error);
  }

};

function update_repo(repo_name)
{
  //TODO: request update on single repo and sub stats
};

Token_Loader(TOKEN_FOLDER_PATH,TOKEN_FILE);

update_all_repos()

app.get('/', function(req, res) 
{ 
  res.send(base_response_json.toString()+"\n");
  console.log(timeGrabber.returnTime());
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

