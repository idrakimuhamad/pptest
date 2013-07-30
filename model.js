
Meteor.methods({
    callAPI : function(query, url) {
    	this.unblock();
        if (Meteor.isServer) {

            return Meteor.http.call("GET", url, {
                query: query
            });
        }
    }
});