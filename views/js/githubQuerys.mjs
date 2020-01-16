export { query_user, token_Loader
	/*query_user: function ()
	{
		return query_user();

	},
	token_Loader: function ()
	{
		return token_Loader();

	}*/
};

var RATE_LIMITED = false;

function token_Loader(user, oauth)
{
    /*
    This Script simply accepts/checks the users github token from server
    and then does a rate-limit query.
    */
    var URL_RATE_LIMIT_CHECK = "https://api.github.com/rate_limit";

    var rate_limit_check;
    //var oauth = JSON.parse('<%- oauth %>');
    console.log();
    var oName = oauth[0].oauth_Name;
    var oToken = oauth[0].oauth_Token;
    console.log("User Token named: "+oName+" Token: "+oToken);
    console.log("Running rate limit check on token...")
    try
    {
        var promise = new Promise(function(resolve, reject) {
            // do a thing, possibly async, then…
            rate_limit_check = query_user(user, oToken, URL_RATE_LIMIT_CHECK, rate_limit_check, true);
            if (rate_limit_check.statusCode == 200) {
                resolve("Stuff worked!");
            }
            else
            {
                console.log(rate_limit_check)
                reject(Error("It broke"));
            }
        });
        //rate_limit_check = promise query_user(user, oToken, URL_RATE_LIMIT_CHECK, rate_limit_check, true);
        //console.log(base_response_json);

        console.log("Rate limit check: ",promise);
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
}

function query_user(user, oauth_token, url_query, result_data, query_base)
{

  return new Promise((resolve, reject) => {
      var auth = "token "+oauth_token.toString();

      console.log("This is the token for "+user+" : "+auth);

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.addEventListener("load", function(){
            console.log(this.responseText);
            resolve(this.responseText)
        });
        xmlHttp.open("GET",url_query,true);
        xmlHttp.setRequestHeader('User-Agent', user,
          'Authorization', auth,
          'Accept', 'application/vnd.github.v3+json',
          'Content-Type', 'application/json');
         xmlHttp.send(null);
         //console.log(xmlHttp.responseText);
         //resolve(xmlHttp.responseText);
        /*
        headers: {
          'User-Agent': user,
          'Authorization': auth,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        //Authorization: "token "+oauth_token,
        uri: url_query,
        method: 'GET'*/
      /* function(error,response,body)
      {
        if(response.statusCode != 403)
        {
          //lastUpdatedTime = timeGrabber.returnTime();
          //console.log("User: ["+USER_NAME+"] git details cached @ ",lastUpdatedTime);
          result_data = JSON.parse(body);
          resolve(result_data);
          console.log('status-code:',response && response.statusCode); //Print out response and status.
          console.log('Url that was sent:',url_query)

        }
        else
        {
          console.error('error:',error); //Handle (Catch) any error
          console.log('status-code:',response && response.statusCode); //Print out response and status.
          RATE_LIMITED = true;
          throw new Error("[ 403 Error! ] Rate Limited");
          return
        }
      });*/
    });

};