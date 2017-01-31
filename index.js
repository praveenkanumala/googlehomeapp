var express = require("express");
var bodyParser = require("body-parser");
const querystring = require("querystring");
var httprequest = require('request');
var port=Number(process.env.PORT || 3000);


var app = express();

var options = {
  	headers: {
    	'User-Agent': 'request',
    	'content-type': 'application/json',
    	'accept': 'application/json',
    	'wm_consumer.id': '6a9fa980-1ad4-4ce0-89f0-79490bbc7625',
    	'wm_qos.correlation_id': '123333',
    	'wm_svc.env': 'prod',
    	'wm_svc.name': 'sams-api',
    	'wm_svc.version': '1.0.0'
  	}
};
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
var router = express.Router();

app.use('/api', router);

router.get("/", function(req, res) {
    res.json({"message":"Hello World"});
 });


router.post("/clubdetails", function(req, res) {
	console.log('this is the request: '+ JSON.stringify(req.body));

    var parameters =  req.body.result.parameters;
    var location;
    var postaladdress;

    if(Object.prototype.hasOwnProperty.call(parameters, 'location')){
    	location = parameters.location;
    	if(Object.prototype.hasOwnProperty.call(location, 'geo-city-us') && 
    		Object.prototype.hasOwnProperty.call(location, 'geo-state-us')){
    		postaladdress = location['geo-city-us']+' '+location['geo-state-us'];
    	} else if(Object.prototype.hasOwnProperty.call(location, 'zip-code')){
    		postaladdress = location['zip-code'];
    	}
    }

    if(postaladdress === undefined){
    	res.set('Content-Type', 'application/json');   
		var speechtxt = 'There are no clubs found near by';
		var responsepayload = {
			speech: speechtxt,
			displayText: speechtxt,
			data: '',
			source: 'testapi'
		};
		res.send(JSON.stringify(responsepayload));
    } else {
    	var clublocatorrequest = {
	    	postaladdress: postaladdress,
	    	radius: '50',
	    	offset: '0',
	    	limit: '10'
	    };
    	var url = 'https://www.samsclub.com/soa/services/v1/clublocator/address?'+querystring.stringify(clublocatorrequest);
	    options.url = url;
	    console.log('url: '+ url);
	    httprequest.get(options, function (error, response, body) {
	  		if (!error && response.statusCode == 200) {
	    		console.log(body) // Show the HTML for the Google homepage. 
	    		var clublocatorpayload = JSON.parse(body); 		
				res.set('Content-Type', 'application/json');  
				var txt = '';
				var clubtxt = '';
				if(clublocatorpayload.payload.clubs.length === 1) {
					txt = 'There is ';
					clubtxt = ' club I found near by ';
				} else {
					txt = 'There are ';
					clubtxt = ' clubs I found near by ';
				}
				var speechtxt = txt + clublocatorpayload.payload.clubs.length+ clubtxt + postaladdress + 
					' and the nearest club is '+ clublocatorpayload.payload.clubs[0].clubName + ' at '
					+ clublocatorpayload.payload.clubs[0].address.streetAddress+' '
					+clublocatorpayload.payload.clubs[0].address.city + ' '+ clublocatorpayload.payload.clubs[0].address.state;

				var responsepayload = {
	    			speech: speechtxt,
	    			displayText: speechtxt,
	    			data: clublocatorpayload,
	    			source: 'testapi'
	    		};		
				res.send(JSON.stringify(responsepayload));
	  		} else {
				res.set('Content-Type', 'application/json');   
	  			var speechtxt = 'There are no clubs found near by';
	  			var responsepayload = {
	    			speech: speechtxt,
	    			displayText: speechtxt,
	    			data: '',
	    			source: 'testapi'
	    		};
	    		res.send(JSON.stringify(responsepayload));
	  		}
		});
    }
    

 });
 
var server = app.listen(port, function () {
    console.log("Server listening on port %s...", server.address().port);
});

