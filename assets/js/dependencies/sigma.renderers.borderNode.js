sigma.canvas.nodes.border = function(node, context, settings) {
    var prefix = settings('prefix') || '';
    //couleur de fond
    context.fillStyle = node.color || settings('defaultNodeColor');
    context.beginPath();
    context.arc(
	node[prefix + 'x'],
	node[prefix + 'y'],
	node[prefix + 'size'],
	0,
	Math.PI * 2,
	true	  
    );

    context.closePath();
    context.fill();

    // Adding a border
    //largeur de bordure
    context.lineWidth = node.borderWidth || 1;
    //couleur de la bourdure
    context.strokeStyle = node.borderColor || '#fff';
    context.stroke();
    
};

// sigma.canvas.nodes.border = function(node, context, settings) {
//     var prefix = settings('prefix') || '';


//     var r    = node[prefix + 'size'],
// 	rf   = node[prefix + 'size']*1.2,
// 	a    = 4.5*Math.PI/4,
// 	af   = a+ Math.PI/2,
// 	xoff = node[prefix + 'x'] + r*Math.cos(a),
// 	yoff = node[prefix + 'y'] + r*Math.sin(a),
// 	x1   = node[prefix + 'x'] + 2.5*Math.cos(a + 3*Math.PI/16)*rf,
// 	y1   = node[prefix + 'y'] + 2.5*Math.sin(a + 3*Math.PI/16)*rf,
// 	x2   = node[prefix + 'x'] + r*Math.cos(af),
// 	y2   = node[prefix + 'y'] + r*Math.sin(af);


//     //le rouge
   
//     context.beginPath();
//     context.moveTo(xoff,
// 		   yoff);
//     //bezierCurveTo (ptCTRLBegin,ptCTRLEnd, ptEnd)
//     context.bezierCurveTo(xoff + r/5*Math.cos(5*Math.PI/4),
// 			  yoff + r/5*Math.sin(5*Math.PI/4),
// 			  x1,
// 			  y1,
// 			  x1,
// 			  y1);
//     context.bezierCurveTo(x1,
// 			  y1,
// 			  x2 + r*Math.cos(af),
// 			  y2 + r*Math.sin(af),
// 			  x2,
// 			  y2);
//     context.closePath();
//     context.fillStyle = '#B81F1B';
//     context.fill();

//     //ponpon

//     context.beginPath();
//     context.arc(
// 	x1,
// 	y1,
// 	node[prefix + 'size']/5,
// 	0,
// 	Math.PI * 2,
// 	true	  
//     );
   
//     context.closePath();
//     context.fillStyle = '#fff';
//     context.fill();
    
//     //fourrure
//     context.beginPath();
    
//     context.arc(
// 	node[prefix + 'x'],
// 	node[prefix + 'y'],
// 	rf,
// 	af,
// 	a,
// 	true	  
//     );
    
//     context.lineTo(node[prefix + 'x'],
// 		      node[prefix + 'y']);
//     context.closePath();
//     context.fillStyle = '#fff';
//     context.fill();
    
//     //couleur de fond
//     context.fillStyle = node.color || settings('defaultNodeColor');
//     context.beginPath();
//     context.arc(
// 	node[prefix + 'x'],
// 	node[prefix + 'y'],
// 	node[prefix + 'size'],
// 	0,
// 	Math.PI * 2,
// 	true	  
//     );
   
//     context.closePath();
//     context.fill();

// };
