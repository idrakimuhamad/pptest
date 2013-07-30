
var gotToken = location.href.indexOf('token') > -1 ? true: false;

Template.ec_button.rendered = function() {

	// var dg = new PAYPAL.apps.DGFlow({
	// 	// the HTML ID of the form submit button which calls setEC
	// 	trigger: "submitBtn"
	// 	//stage: "sandbox"  //test in Sandbox
	// 	//sole: "false"   // disable nameOnButton function
	// });

}

Template.response.data = function() {
	if(!Session.get('set_response_ack')) {
		return 'Retrieving..';
	} else if(Session.get('set_response_ack') === "Failure") {
		return 'Request Failed';
	} else {
		return "SET EC RESPONSE <br>ACK : " + Session.get('set_response_ack') + "<br>TOKEN : " + Session.get('response_token') + '<br><br>';
	}
}

Template.ec_button.redirect_url = function() {
	return Session.get('redirect_url');
}

//If there's no token call SetEC
if(!gotToken) {

	Meteor.autorun(function() {
		var nvpset = nvps + "&METHOD=SetExpressCheckout&VERSION=95.0"
		+ "&RETURNURL=http://localhost:3000/" //set your Return URL here
		+ "&CANCELURL=http://localhost:3000/" //set your Cancel URL here
		+ "&PAYMENTREQUEST_0_CURRENCYCODE=USD"
	    + "&LOCALCODE=US"
	   	+ "&PAYMENTREQUEST_0_AMT=0.02"
	    + "&PAYMENTREQUEST_0_ITEMAMT=0.01"
	    + "&PAYMENTREQUEST_0_TAXAMT=0.01"
	    + "&PAYMENTREQUEST_0_DESC=Movies"
	    + "&PAYMENTREQUEST_0_PAYMENTACTION=Sale"
	    + "&L_PAYMENTREQUEST_0_ITEMCATEGORY0=Digital"
	    + "&L_PAYMENTREQUEST_0_NAME0=Kitty Antics"
	   	+ "&L_PAYMENTREQUEST_0_NUMBER0=101"
	    + "&L_PAYMENTREQUEST_0_QTY0=1"
	    + "&L_PAYMENTREQUEST_0_AMT0=0.01"
	    + "&L_PAYMENTREQUEST_0_DESC0=Download"
	    + "&NOSHIPPING=1";

		Meteor.call("callAPI", nvpset, url, function(err, result) {
			// console.log(result);
			var response = arrangeResponse(result);
			Session.set('set_response_ack', response.ACK);

			var ack = Session.get('set_response_ack');

			if(ack == "Success"){
				// Redirect to paypal
				redirect_url = PAYPAL_URL + escape(response.TOKEN);
				Session.set('redirect_url', redirect_url);
			} else {
				$.each(response, function(k,v) {
					$('.entry').append(k + ' = ' + v + '<br>');
				});
			}

			Session.set('response_token', response.TOKEN);
		});
	});
} else {

	Meteor.autorun(function() {
		//Get url
		var hostname = location.protocol + '//' + location.host;

		var query =  location.href.replace(hostname + '/?');
		query = arrangeResponse(query);

		Session.set('response_token', query.TOKEN);

		//Call GetEC
		var nvpget = nvps + "&VERSION=95.0&METHOD=GetExpressCheckoutDetails"
		+ "&TOKEN=" + escape(Session.get('response_token'));

		Meteor.call("callAPI", nvpget, url, function(err, result) {
			// console.log(result);
			var response = arrangeResponse(result);
			Session.set('get_response_ack', response.ACK);
			Session.set('response_token', response.TOKEN);

			var ack = Session.get('get_response_ack');

			var pID = response.PAYERID;	

			// GOT payerID call DOEC, else display response from getec
			if(pID) {
				var nvpdo = nvps+"&VERSION=95.0"
				+ "&METHOD=DoExpressCheckoutPayment"
				+ "&PAYMENTREQUEST_0_AMT=" + response.PAYMENTREQUEST_0_AMT
				+ "&TOKEN=" + token
				+ "&PAYERID=" + PPID;

				// RUN DOEC
				Meteor.call("callAPI", nvpdo, url, function(err, result) {
					var response = arrangeResponse(result);
					Session.set('do_response_ack', response.ACK);
					var ack = Session.get('do_response_ack');
					$('.entry').append('Do EC Response');
					$.each(response, function(k,v) {
						$('.entry').append(k + ' = ' + escape(v) + '<br>');
					});
				});
			} else {
				$('.entry').append('GET EC Response<br>');
				$.each(response, function(k,v) {
					$('.entry').append(k + ' = ' + escape(v) + '<br>');
				})
			}
		});
	});
}