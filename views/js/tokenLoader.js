/*
    This Script simply accepts/checks the users github token from server
    and then does a rate-limit query.
*/
var URL_RATE_LIMIT_CHECK = "https://api.github.com/rate_limit";
var rate_limit_check;

var oName = "<%= oauthData[0].oauth_Name -%>";
var oToken = "<%= oauthData[0].oauth_Token -%>";
console.log("User Token named: "+oName+"passed from server. Token: "+oToken);
console.log("Running rate limit check on token...")
try
{
    rate_limit_check = await query_user(user, oToken, URL_RATE_LIMIT_CHECK, rate_limit_check, true);
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