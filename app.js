const request = require('request')
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
  - Current dev version,
  - Build errors,
  - Release version
  It then displays this in the web page/app for easy viewing.
*/

var base_response_json = "{ Url Error: No data returned }";
var repo_response_json;
var USER_NAME = 'dMacGit'
var URL_USER_BASE_REQUEST = 'https://api.github.com/users/'+USER_NAME;
var URL_USER_FOUND_REPOS = URL_USER_BASE_REQUEST+'/repos';
var lastUpdatedTime;
var update_Limit = 1; //<-- Set this as default to 15 (Minutes)
var REPOS_lastUpdated;
var REPO_Number;
var REPO_List  = {};

async function query_user_Base()
{
  try
  {
    base_response_json = await query_user(URL_USER_BASE_REQUEST, base_response_json, true);
    console.log(base_response_json);
    REPO_Number = base_response_json.public_repos;
    
    
    
    console.log("User: ",base_response_json.login,"\nRepo count: ",base_response_json.public_repos,"\nLast updated: ",base_response_json.updated_at);
  }
  catch (error)
  {
    console.error("Query_user await function Error!");
    console.error(error);
  }

};

async function query_user_Repos()
{
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

function query_user(url_query, result_data, query_base)
{
  return new Promise((resolve, reject) => {

      request({

        headers: {
          'User-Agent': USER_NAME,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        uri: url_query,
        method: 'GET'
      }, function(error,response,body)
      {
        console.error('error:',error); //Handle (Catch) any error
        console.log('status-code:',response && response.statusCode); //Print out response and status.
        
        
        /* 
          JSON parser notes
          Currenlty will use/execute Jsaon Parser in synchronous call
          THIS WILL BLOCK

          Extract some global user parameters:
          - Repo count (public_repos)
          - Last update (updated_at) Timestamp

        */    
        lastUpdatedTime = timeGrabber.returnTime();
        console.log("User: ["+USER_NAME+"] git details cached @ ",lastUpdatedTime);
        result_data = JSON.parse(body);
        resolve(result_data);
      });
    });

  
	/*http.request(options, function(res) {
  		console.log('STATUS: ' + res.statusCode);
  		console.log('HEADERS: ' + JSON.stringify(res.headers));
  		res.setEncoding('utf8');
  		res.on('data', function (chunk) {
    		console.log('BODY: ' + chunk);
  		});
	}).end();*/
};


function update_Repos_Stats()
{
  for (var i = 0; i < REPO_Number; i++) 
  {
    var repo_name = repo_response_json[i].name;
    REPO_List[repo_name] = repo_response_json[i];
    console.log("=======================\nRepo number:",i,"\nName:",repo_name,"\n",REPO_List[repo_name]);
  }
};

query_user_Base();
query_user_Repos();
app.get('/', function(req, res) 
{ 
  res.send(base_response_json.toString()+"\n");
  console.log(timeGrabber.returnTime());
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

