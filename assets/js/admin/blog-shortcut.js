$(document).ready(function(){
  
    jQuery.fn.extend({
	insertAtCaret: function(myValue){
	    return this.each(function(i) {
		if (document.selection) {
		    //For browsers like Internet Explorer
		    this.focus();
		    sel = document.selection.createRange();
		    sel.text = myValue;
		    this.focus();
		}
		else if (this.selectionStart || this.selectionStart == '0') {
		    //For browsers like Firefox and Webkit based
		    var startPos = this.selectionStart;
		    var endPos = this.selectionEnd;
		    var scrollTop = this.scrollTop;
		    this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
		    this.focus();
		    this.selectionStart = startPos + myValue.length;
		    this.selectionEnd = startPos + myValue.length;
		    this.scrollTop = scrollTop;
		        
		} else {
		    this.value += myValue;
		    this.focus();
		        
		}
		  
	    })
	    
	},
	setSelection: function(selectionStart, selectionEnd) {
	    if(this.length == 0) return this;
	    input = this[0];

	    if (input.createTextRange) {
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
		    
	    } else if (input.setSelectionRange) {
		input.focus();
		input.setSelectionRange(selectionStart, selectionEnd);
		    
	    }

	    return this;
	    
	},
	getCaretPosition: function() {
	    var el = $(this).get(0);
	    var pos = 0;
	    if('selectionStart' in el) {
		pos = el.selectionStart;
		        
	    } else if('selection' in document) {
		el.focus();
		var Sel = document.selection.createRange();
		var SelLength = document.selection.createRange().text.length;
		Sel.moveStart('character', -el.value.length);
		pos = Sel.text.length - SelLength;
		        
	    }
	    return pos;
	        
	},
	setCaretPosition: function(position){
	    if(this.length == 0) return this;
	    return $(this).setSelection(position, position);
	}	
    }); 
    
    function writeInfosFromData(data){
	var info = {}

	Object.keys(data).forEach(function(name){
	    info[data[name].key]= {
		value: data[name].value,
		cursIndent: data[name].cursIndent
	    }
	})
	return info;
    }


    var textEltOnFocus = false,
	actionKeyDown = false,
	wordsData = {
	    's':{
		key: 83,
		letter: 's',
		value: "[s][/s]",
		cursIndent: -4
	    },
	    'e':{
		key: 69,
		letter: 'e',
		value: "[e][/e]",
		cursIndent: -4
	    },
	    'd':{
		key: 68,
		letter: 'd',
		value: "[d][/d]",
		cursIndent: -4
	    },
	    'sub':{
		key: 76,
		letter: 'l',
		value: "[sub][/sub]",
		cursIndent: -6
	    },
	    'sup':{
		key: 72,
		letter: 'h',
		value: "[sup][/sup]",
		cursIndent: -6
	    },
	    'q':{
		key: 81,
		letter: 'q',
		value: "[q][/q]",
		cursIndent: -4
	    },
	    'bq':{
		key: 67,
		letter: 'c',
		value: "[bq][/bq]",
		cursIndent: -5
	    },
	    'ab':{
		key: 65,
		letter: 'a',
		value: "[ab title=\"\"][/ab]",
		cursIndent: -7
	    },
	    'c':{
		key: 90,
		letter: 'z',
		value: '[c][/c]',
		cursIndent: -4
	    },
	    'code':{
		key: 88,
		letter: 'x',
		value: '[code][/code]',
		cursIndent: -7
	    },
	    'url':{
		key: 89,
		letter: 'y',
		value: '[url site=""][/url]',
		cursIndent: -6
	    },
	    'a':{
		key: 85,
		letter: 'u',
		value: '[a site=""][/a]',
		cursIndent: -6
	    },
	    'h1':{
		key: 84,
		letter: 't',
		value: '[h1][/h1]',
		cursIndent: -5
	    },
	    'h2':{
		key: 71,
		letter: 'g',
		value: '[h2][/h2]',
		cursIndent: -6
	    },
	    'ol':{
		key: 74,
		letter: 'j',
		value: '[ol]\n    [*]\n[/ol]',
		cursIndent: -6
	    },
	    'ul':{
		key: 75,
		letter: 'k',
		value: '[ul]\n    [*]\n[/ul]',
		cursIndent: -6
	    },
	    '*':{
		key: 73,
		letter: 'i',
		value: '\n    [*]',
		cursIndent: 0
	    },
	    'p':{
		key: 80,
		letter: 'p',
		value: '[p][/p]',
		cursIndent: -4
	    },
	    'fig':{
		key: 87,
		letter: 'w',
		value: '[fig img=""][/fig]',
		cursIndent: -8
	    }
	},
	wordsInfos=writeInfosFromData(wordsData);


    
        
    var insertWord = function(wordInfo){
	if(textEltOnFocus){
	    $(textEltOnFocus).insertAtCaret(wordInfo.value);
	    $(textEltOnFocus).setCaretPosition($(textEltOnFocus).getCaretPosition() + wordInfo.cursIndent)
	}
    };

   
    $("[data-entry='bbcode']").focus(function(){
	textEltOnFocus = this;	
    });

    var CtrlKeyCodes = [93,91,18]
    
    $(document).keydown(function(e){
	if(CtrlKeyCodes.indexOf(e.keyCode) !== -1){
	    actionKeyDown = true;
	    e.preventDefault();
	}else if( typeof wordsInfos[e.keyCode] !== 'undefined' && actionKeyDown){
	    insertWord(wordsInfos[e.keyCode]);
	    e.preventDefault();
	}
	
    })

    $(document).keyup(function(e){
	if(CtrlKeyCodes.indexOf(e.keyCode) !== -1){
	    e.preventDefault();
	    actionKeyDown = false;    
	}
    })

    //chargement des shortcuts d'administration

    Object.keys(wordsData).forEach(function(shortCutName){
	var shortCut = wordsData[shortCutName];

	var li = document.createElement("li");
	var input = document.createElement("input")
	$(input).attr('type','button')
	$(input).attr('title',wordsData[shortCutName].letter)
	$(input).attr('value',shortCutName)
	$(input).click(function(){
	    insertWord(wordsInfos[shortCut.key]);
	})
	$('#admin-shortcuts').append(li);
	$(li).append(input);
    })
})
