$(".response-event").click(function(e){

    $("#comment-input-container").append('<input type="hidden" id="input-responseto" name="responseto" value="'+$(e.target).attr('data-commentid')+'"> ')
    $("#comment-form-title").html('Pondre une réponse pour ' + $(e.target).attr('data-name')+ '<span class="text-info"> (<a href="#comment-form" id="response-cancel" class="text-btn">annuler</a>)</span> ' );
    $("#comment-submit-btn").attr("value","(Ré)Pondre")
    
    $("#response-cancel").click(function(e){

	$("#input-responseto").remove()
	$("#comment-form-title").text("Dépose ton commentaire")
	$("#comment-submit-btn").attr("value","Déposer")
    })
})
