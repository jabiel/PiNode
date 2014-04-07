var util = require('util');
var http = require('http');
var url = require('url');
var fs = require('fs');
var exec = require('child_process').exec;

var port = 4444;
var web = {};

web.response = {};
web.layout = "<html><body>@Body@</body></html>";
web.Init = function()
{
	fs.readFile(process.cwd() + '/views/layout.html', 'utf8', function (err,html) {
		if (err) {
			return console.log(err);
		}
		web.layout = html;
	});
}

web.controller = function(request, response)
{
	this.response = response;
	
	console.log('req:', request.url, url.parse(request.url));
	
	if(url.parse(request.url).pathname.indexOf("/content/") != -1)
	{
		var w = this;
		fs.readFile(process.cwd() + url.parse(request.url).pathname, function (err,data) {
			if (err) {
				return console.log(err);
			}
			w.response.writeHead(200, {'Content-Type': 'image/jpeg'});
		    w.response.end(data); 
		});
		return;
	}

	var action = 'index';
	if(url.parse(request.url).pathname != '/')
	{
		action = url.parse(request.url).pathname.substring(1, 99);
	}

	// defaultowo otwieramy zwykle strony
	
	if(this[action])
	{
		var html = this[action](request);
		if(html)
		{
			response.writeHead(200, {'Content-Type': 'text/html','Content-Length': html.length});
			response.end(html);
		}
	} else
	{
		/*fs.exists(process.cwd() + '/views/' + action + '.html', function (exists) {
			if(exists)
				this.view(action);
			else
			{
				response.writeHead(404, {'Content-Type': 'text/html'});
				response.end("Page not found: " + request.url);
			}
		});*/
		response.writeHead(404, {'Content-Type': 'text/html'});
		response.end("Page not found: " + request.url);
		
	}
}


web.viewResult = function(html)
{	
	this.response.writeHead(200, {'Content-Type': 'text/html','Content-Length': html.length});
	this.response.end(html);
}
web.view = function(name, args)
{	
	var w = this;
	fs.readFile(process.cwd() + '/views/' + name + '.html', 'utf8', function (err,view) {
		if (err) {
			return console.log(err);
		}
		// tutaj przeprocesowac view 
		var html = w.layout.replace("@Body@", view);
		w.viewResult(html);
	});
}

web.index = function(req)
{
	this.view("index");
}

web.about = function(req)
{
	this.view("about");
}

web.wioluska = function(req)
{
	this.view("wioluska");
}

web.dir = function(req)
{
    var w = this;
	exec('ls', function (error, stdout, stderr) {
		var view = "<pre>" + stdout + "</pre>";
		var html = w.layout.replace("@Body@", view);
		w.viewResult(html);
	});

}

web.minidlnarestart = function(req)
{
	this.response.writeHead(301, {Location: '/'});

	exec('/etc/init.d/minidlna force-reload', function (error, stdout, stderr) { });
	return "Na glowna";
}

web.Init();
http.createServer(function (req, res) {
  web.controller(req, res);
}).listen(port);
console.log('Server running at http://127.0.0.1:'+port+'/');