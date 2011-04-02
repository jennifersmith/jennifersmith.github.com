var sys = require("sys"),
		  http = require("http"),
			  url = require("url"),
				  path = require("path"),
					  fs = require("fs");

var dir = process.argv[2] || './_site';
var port = parseInt(process.argv[3]) || 8080;
sys.log('Serving files from ' + dir + ', port is ' + port);

var filePathFromRequest = function(request){
	var uri = url.parse(request.url).pathname;
	if(uri==="/"){
		uri = "/index.html";
	}
 	uri = 	uri.replace("%20", " "); // hackety hack
	var filename = path.join(process.cwd(), dir, uri);
	return filename;
}

var serverProc = function(request, response) {
	var filename = filePathFromRequest(request);
	sys.log("Sending " + filename);
	path.exists(filename, function(exists) {
				if(exists) {
					fs.readFile(filename, function(err, data) {
					response.writeHead(200);
					response.end(data);
					});
		  	} else {
					sys.log('File not found: ' + filename);
					response.writeHead(404);
					response.end();
					}
	});
}

http.createServer(serverProc).listen(port);

sys.log("Server running at http://localhost:" + port);
