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

var data = {
    			'google': {
    				'expect_user_response': false
    			}
    		};

var itemaislemappling = {
	'bananas': 'Aisle 16' , 
	'Bananas': 'Aisle 16' , 
	'organic bananas': 'Aisle 1' , 
	'Samsung TV': 'the electronic section',
	'samsung tv': 'the electronic section',
	'olive oil': 'Front of Aisle 21',
	'almonds':'back of aisle 20 on the right',
	'pistachios': 'Back of the club next to the fresh vegetables',
	'organic quinoa': 'Aisle 6',
	'brown rice':'back of Aisle 23',
	'white rice':'back of Aisle 23',
	'cereals':'Aisle 27',
	'cereal':'Aisle 27',
	'coconut water':'in between Aisle 22 and 23',
	'tablets':'Aisle 11',
	'ipad':'Aisle 12',
	'fitbit':'Aisle 13',
	'cameras':'Aisle 14',
	'batteries':'in between checkout aisle 3 and 4',
	'diapers':'Aisle 17',
	'milk':'in the back right section of the club in the first refrigerator',
	'sonoma coast': 'Aisle 20',
	'kashi chocolate almond and sea salt granola bars': 'Aisle 21'
};

var stockstatus = {
	'bananas': 'instock' , 
	'organic bananas': 'instock' , 
	'samsung tv': 'instock',
	'olive oil': 'instock',
	'almonds':'instock',
	'pistachios': 'instock',
	'duracell batteries':'instock',
	'batteries':'instock',
	'diapers':'instock',
	'milk':'instock',
	'sonoma coast': 'instock'
};

var moreItemInformation = {
	'kashi chocolate almond and sea salt granola bars': 'Its 4.5 star rated product Total fat 2grams and protein 6grams Currently $2 off as its on instant savings'
};

var alternateitems = {
	'kenwood pinot noir': 'sonoma coast',
	'nutritional lara bars': 'Kashi Chocolate Almond and Sea Salt Granola Bars'
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
    var action = req.body.result.action;    

    if(action === 'find.aisle'){
    	if(Object.prototype.hasOwnProperty.call(parameters, 'item')){
    		var itemname = parameters.item.toLowerCase();
    		var aisle = itemaislemappling[itemname];
    		var outputItemName;
    		//var itemobject = JSON.parse(itemaislemappling);    		
    		console.log('item name: '+itemname);
    		res.set('Content-Type', 'application/json');  
			var speechtxt;
    		if(aisle !== undefined){
    			speechtxt = 'Please check '+ itemaislemappling[itemname]+' for '+itemname ;
    		}  else{
    			var alternateitem = alternateitems[itemname]; 
    			outputItemName = alternateitem;
    			if(alternateitem !== undefined){
    				var alternateitemaisle = itemaislemappling[alternateitem];	
    				speechtxt = 'We do not carry '+itemname+' but we do have '+ alternateitem+' in aisle '+alternateitemaisle +  ' Would you like more information for the item';
    			} else {
	    			speechtxt = 'We are sorry this item is out of stock. It is available online at Samsclub.com';
    			}
    		}
    		
  			var contextOuts;
  			var responseexpected = false;
  			if(outputItemName !== undefined){
  			 	contextOuts = [{name:"more-item-data",lifespan:1,parameters:{itemNameReturned:outputItemName}}];
  			 	responseexpected = true;
  			}
  			var dataOut = {
    			google: 
    			{
    				expect_user_response: responseexpected
    			}
  			};
			var responsepayload = {
				speech: speechtxt,
				displayText: speechtxt,
				data: dataOut,
				contextOut: contextOuts,
				source: 'testapi'
			};
			res.send(JSON.stringify(responsepayload));
    	} else {
    		res.set('Content-Type', 'application/json');   
			var speechtxt = 'We are sorry we cannot find the item where it is located!!!!';
			var responsepayload = {
				speech: speechtxt,
				displayText: speechtxt,
				data: '',
				source: 'testapi'
			};
			res.send(JSON.stringify(responsepayload));
    	}
    } else if(action === 'stock.information'){
    	if(Object.prototype.hasOwnProperty.call(parameters, 'item')){
    		var itemname = parameters.item.toLowerCase();
    		var stock = stockstatus[itemname];
    		//var itemobject = JSON.parse(itemaislemappling);    		
    		console.log('item name: '+itemname);
    		res.set('Content-Type', 'application/json');  
			var speechtxt;
    		if(stock === 'instock'){
    			speechtxt = itemname+' are out of stock, you can find those at the nearest Samsclub which is 5 miles away or online at Samsclub.com';
    		}  else{
    			speechtxt = 'We are sorry this item is out of stock.';
    		}
    		
			var responsepayload = {
				speech: speechtxt,
				displayText: speechtxt,
				data: '',
				source: 'testapi'
			};
			res.send(JSON.stringify(responsepayload));
    	} else {
    		res.set('Content-Type', 'application/json');   
			var speechtxt = 'We are sorry we cannot find the item!!!';
			var responsepayload = {
				speech: speechtxt,
				displayText: speechtxt,
				data: '',
				source: 'testapi'
			};
			res.send(JSON.stringify(responsepayload));
    	}
    } else if(action === 'item.information'){
    	if(Object.prototype.hasOwnProperty.call(parameters, 'item')){
    		var itemname = parameters.item.toLowerCase();
    		var iteminformation = moreItemInformation[itemname];
    		//var itemobject = JSON.parse(itemaislemappling);    		
    		console.log('item name: '+itemname);
    		res.set('Content-Type', 'application/json');  
			var speechtxt;
    		if(iteminformation !== undefined){
    			speechtxt = iteminformation;
    		}  else{
    			speechtxt = 'We are sorry this item is not available.';
    		}
    		
			var responsepayload = {
				speech: speechtxt,
				displayText: speechtxt,
				data: '',
				source: 'testapi'
			};
			res.send(JSON.stringify(responsepayload));
    	} else {
    		res.set('Content-Type', 'application/json');   
			var speechtxt = 'We are sorry this item is not available.';
			var responsepayload = {
				speech: speechtxt,
				displayText: speechtxt,
				data: '',
				source: 'testapi'
			};
			res.send(JSON.stringify(responsepayload));
    	}
    } else {
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

					var speechtxt = 'There are no clubs found near by';

					for(var club in clublocatorpayload.payload.clubs){

						if(clublocatorpayload.payload.clubs[club].clubAvailable){
							speechtxt = txt + clublocatorpayload.payload.clubs.length+ clubtxt + postaladdress + 
										' and the nearest club is '+ clublocatorpayload.payload.clubs[club].clubName + ' at '
										+ clublocatorpayload.payload.clubs[club].address.streetAddress+' '
										+clublocatorpayload.payload.clubs[club].address.city + ' '+ clublocatorpayload.payload.clubs[club].address.state;
							break;			
						}
					}

					
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
    }

    

 });
 
var server = app.listen(port, function () {
    console.log("Server listening on port %s...", server.address().port);
});

