
/*
	First expose functions
*/

module.exports = {
	returnTime: function ()
	{		
		return generateTime();
		
	}
};

/*
	Internal private fucntion
	-------------------------
	Used to generate the time object
*/
function generateTime()
{
	var current_Date = new Date();
	var time_string_One = "" + current_Date.getHours() + ":" + current_Date.getMinutes() + "." + current_Date.getSeconds() + " " + current_Date.getDay() + "/" + current_Date.getMonth() + "/" + current_Date.getYear();
	return formatTime(current_Date);
	
};

/*
	Internal private fucntion
	-------------------------
	Used to parse/format time object to readable string
*/
function formatTime(dateObject)
{

	var time_string_One = "" + dateObject.getHours() + ":" + dateObject.getMinutes() + "." + dateObject.getSeconds() + " " + dateObject.getDay() + "/" + dateObject.getMonth() + "/" + dateObject.getYear();
	var day_number = "" + dateObject.getDate();
	var formatted_day = ""
	var options = {	month: 'long' };

	day_number_len = day_number.length;

	if (day_number_len > 0) {
		query_number = (day_number)[1];
		//console.log("Number of digits: "+day_number_len)
	}
	if (query_number == 1) 
	{
		formatted_day = day_number.toString() + "st";
	}
	else if (query_number == 2) 
	{
		formatted_day = day_number.toString() + "nd";
	}
	else if (query_number == 3) 
	{
		formatted_day = day_number.toString() + "rd";
	} 
	else
	{
		formatted_day = day_number.toString() + "th";
	}
	var month_string = dateObject.toLocaleString('en-nz', { month: 'long'	});
	var formatted_time = "" + dateObject.getHours() + ":" + dateObject.getMinutes() + "." + dateObject.getSeconds() + " " + formatted_day + " of " + month_string + " " + dateObject.getUTCFullYear();
	return formatted_time;
};