
module.exports= {

    info: function(req,res){
	Graph.create().exec(function(err,r){
	    res.json(r)
	});
    }
};
