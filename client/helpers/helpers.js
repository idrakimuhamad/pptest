arrangeResponse = function(result) {
	var response = new Object;
	var content = unescape(result.content);
		content = content.split("&");
	// console.log(content);
	for (var i = 0; i < content.length; i++) {
		var title = content[i].split("=");
		if(title.length > 1) {
			response[title[0].toUpperCase()] = title[1];
		}
	}

	return response;
}