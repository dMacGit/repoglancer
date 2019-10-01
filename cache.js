const redis = require('redis')

module.exports = {
	startCache: function (port,host)
	{		
		return init_cache(port,host);		
	},
	checkUser: function (client,user)
	{
		return check_user(client,user);
	}
};

function init_cache(port,host)
{
	var client = redis.createClient(port,host);
	//Test for Redis connection
	client.on('connect', function() {
    	console.log('Redis client connected');
	});

	client.on('error', function (err) {
    	console.log('Something went wrong ' + err);
	});
	return client;
}

function check_user(client,user)
{
	var user_data = "";

	client.get(user, function (error, result) 
	{
		if(result)
		{
			console.log(">>",result);
			console.log('Found cached data for',user);
    		user_data = result;	
		}
		else
		{
			user_data = null;
		}
		
    	if (error) {
        	console.log(error);
        	throw new Error("No Cached data for user",user);
    	}
    	
	});
	return user_data;
}