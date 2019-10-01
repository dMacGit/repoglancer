module.exports = {
	query_user: function ()
	{
		return query_user();

	}
};

function query_user(user, oauth_token, url_query, result_data, query_base)
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
      });
    });

};