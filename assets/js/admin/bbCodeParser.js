var TokenType;
(function(TokenType) {
    TokenType[TokenType["Text"] = 0] = "Text";
    TokenType[TokenType["StartTag"] = 1] = "StartTag";
    TokenType[TokenType["EndTag"] = 2] = "EndTag"
})(TokenType || (TokenType = {}));
var Token = function() {
    function Token(tokenType, content, tagAttributes, tagStr) {
        this.tokenType = tokenType;
        this.content = content;
        this.tagAttributes = tagAttributes;
        this.tagStr = tagStr;
    }
    Token.prototype.toString = function() {
        return this.content + " (" + TokenType[this.tokenType] + ")"
    };
    Token.prototype.equals = function(token) {
        return this.tokenType == token.tokenType && this.content == token.content
    };
    return Token
}();

function textToken(content) {
    return new Token(0, content)
}
var attrNameChars = "[a-zA-Z0-9\\.\\-_:;/]";
var attrValueChars = "[a-zA-Z0-9/\-_.!~*'():@&=+,$]";
 
function tagToken(match) {
    if (match[1] == undefined) {
        var tagName = match[2];
        var attributes = new Array;
        var attrPattern = new RegExp("(" + attrNameChars + '+)?="(' + attrValueChars + '*)"', "g");
        var attrStr = match[0].substr(1 + tagName.length, match[0].length - 2 - tagName.length);
        var attrMatch;
        while (attrMatch = attrPattern.exec(attrStr)) {
            if (attrMatch[1] == undefined) {
                attributes[tagName] = attrMatch[2]
            } else {
                attributes[attrMatch[1]] = attrMatch[2]
            }
        }
        return new Token(1, tagName, attributes, match[0])
    } else {
        return new Token(2, match[1].substr(1, match[1].length - 1));
    }
}

function asTextToken(token) {
    if (token.tokenType == 1) {
        token.content = token.tagStr;
        token.tokenType = 0
    }
    if (token.tokenType == 2) {
        token.content = "[/" + token.content + "]";
        token.tokenType = 0
    }
}
var Tokenizer = function() {
    function Tokenizer(bbTags) {
        this.bbTags = bbTags
    }
    Tokenizer.prototype.tokenizeString = function(str) {
        var tokens = this.getTokens(str);
        var newTokens = new Array;
        var noNesting = false;
        var noNestingTag = "";
        var noNestedTagContent = "";
        for (var i in tokens) {
            var currentToken = tokens[i];
            var bbTag = this.bbTags[currentToken.content];
            var addTag = true;
            if (bbTag === undefined && !noNesting) {
                asTextToken(currentToken)
            } else {
                if (noNesting) {
                    if (currentToken.tokenType == 2 && currentToken.content == noNestingTag) {
                        noNesting = false;
                        newTokens.push(textToken(noNestedTagContent))
                    } else {
                        asTextToken(currentToken);
                        noNestedTagContent += currentToken.content;
                        addTag = false
                    }
                } else {
                    if (bbTag.noNesting && currentToken.tokenType == 1) {
                        noNesting = true;
                        noNestingTag = currentToken.content;
                        noNestedTagContent = ""
                    }
                }
            }
            if (addTag) {
                newTokens.push(currentToken)
            }
        }
        return newTokens
    };
    Tokenizer.prototype.getTokens = function(str) {
        var pattern = '\\[(/\\w*)\\]|\\[(\\w*)+(="' + attrValueChars + '*")?( ' + attrNameChars + '+="' + attrValueChars + '*")*\\]';
        var tagPattern = new RegExp(pattern, "g");
        var tokens = new Array;
        var match;
        var lastIndex = 0;
        while (match = tagPattern.exec(str)) {
            var delta = match.index - lastIndex;
            if (delta > 0) {
                tokens.push(textToken(str.substr(lastIndex, delta)))
            }
            tokens.push(tagToken(match));
            lastIndex = tagPattern.lastIndex
        }
        var delta = str.length - lastIndex;
        if (delta > 0) {
            tokens.push(textToken(str.substr(lastIndex, delta)))
        }
        return tokens
    };
    return Tokenizer
}();
var TreeType;
(function(TreeType) {
    TreeType[TreeType["Root"] = 0] = "Root";
    TreeType[TreeType["Text"] = 1] = "Text";
    TreeType[TreeType["Tag"] = 2] = "Tag"
})(TreeType || (TreeType = {}));
var BBCodeParseTree = function() {
    function BBCodeParseTree(treeType, content, attributes, subTrees) {
        this.treeType = treeType;
        this.content = content;
        this.attributes = attributes;
        this.subTrees = subTrees;
        this.subTrees = new Array
    }
    BBCodeParseTree.prototype.isValid = function() {
        if (this.subTrees.length == 0) {
            return true
        }
        for (var i in this.subTrees) {
            var currentTree = this.subTrees[i];
            if (currentTree == null || !currentTree.isValid()) {
                return false
            }
        }
        return true
    };
    BBCodeParseTree.prototype.toString = function() {
        return TreeType[this.treeType] + " - " + this.content
    };
    BBCodeParseTree.buildTree = function(str, bbTags) {
        var tokenizer = new Tokenizer(bbTags);
        var tokens = tokenizer.tokenizeString(str);
        return BBCodeParseTree.buildTreeFromTokens(new BBCodeParseTree(0, str), tokens.reverse())
    };
    BBCodeParseTree.buildTreeFromTokens = function(rootTree, tokens, currentTag) {
        if (currentTag === void 0) {
            currentTag = ""
        }
        if (rootTree == null) {
            return null
        }
        if (tokens.length == 0) {
            return rootTree
        }
        var currentToken = tokens.pop();
        if (currentToken.tokenType == 0) {
            rootTree.subTrees.push(new BBCodeParseTree(1, currentToken.content))
        }
        if (currentToken.tokenType == 1) {
            var tagName = currentToken.content;
            rootTree.subTrees.push(BBCodeParseTree.buildTreeFromTokens(new BBCodeParseTree(2, tagName, currentToken.tagAttributes), tokens, tagName))
        }
        if (currentToken.tokenType == 2) {
            var tagName = currentToken.content;
            if (tagName == currentTag) {
                return rootTree
            } else {
                return null
            }
        }
        if (tokens.length == 0) {
            if (currentTag != "") {
                return null
            }
        }
        return BBCodeParseTree.buildTreeFromTokens(rootTree, tokens, currentTag)
    };
    return BBCodeParseTree
}();
var BBTag = function() {
    function BBTag(tagName, insertLineBreaks, suppressLineBreaks, noNesting, markupGenerator) {
        this.tagName = tagName;
        this.insertLineBreaks = insertLineBreaks;
        this.suppressLineBreaks = suppressLineBreaks;
        this.noNesting = noNesting;
        this.markupGenerator = markupGenerator;
        if (markupGenerator == undefined) {
            this.markupGenerator = function(tag, content, attr) {
                return "<" + tag.tagName + ">" + content + "</" + tag.tagName + ">"
            }
        }
    }
    BBTag.createSimpleTag = function(tagName, insertLineBreaks) {
        if (insertLineBreaks === void 0) {
            insertLineBreaks = true
        }
        return new BBTag(tagName, insertLineBreaks, false, false)
    };
    BBTag.createTag = function(tagName, markupGenerator, insertLineBreaks) {
        if (insertLineBreaks === void 0) {
            insertLineBreaks = true
        }
        return new BBTag(tagName, insertLineBreaks, false, false, markupGenerator)
    };
    return BBTag
}();

function endsWith(str, endStr) {
    if (str.length == 0) {
        return false
    }
    if (endStr.length > str.length) {
        return false
    }
    var inStrEnd = str.substr(str.length - endStr.length, endStr.length);
    return endStr == inStrEnd
}

function startsWith(str, startStr) {
    if (str.length == 0) {
        return false
    }
    if (startStr.length > str.length) {
        return false
    }
    var inStrStart = str.substr(0, startStr.length);
    return startStr == inStrStart
}
var tagsToReplace = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;"
};

function escapeHTML(html) {
    return html.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag
    })
}
var BBCodeParser = function() {
    function BBCodeParser(bbTags) {
        this.bbTags = bbTags
    }
    BBCodeParser.prototype.parseString = function(content, stripTags, insertLineBreak) {
        if (stripTags === void 0) {
            stripTags = false
        }
        if (insertLineBreak === void 0) {
            insertLineBreak = true
        }
        var parseTree = BBCodeParseTree.buildTree(content, this.bbTags);
        if (parseTree == null || !parseTree.isValid()) {
            return content
        }
        return this.treeToHtml(parseTree.subTrees, insertLineBreak, stripTags)
    };
    BBCodeParser.prototype.treeToHtml = function(subTrees, insertLineBreak, stripTags) {
        var _this = this;
        if (stripTags === void 0) {
            stripTags = false
        }
        var htmlString = "";
        var suppressLineBreak = false;
        subTrees.forEach(function(currentTree) {
            if (currentTree.treeType == 1) {
                var textContent = currentTree.content;
                textContent = escapeHTML(textContent);
                if (insertLineBreak && !suppressLineBreak) {
                    textContent = textContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    suppressLineBreak = false
                }
                htmlString += textContent
            } else {
                var bbTag = _this.bbTags[currentTree.content];
                var content = _this.treeToHtml(currentTree.subTrees, bbTag.InsertLineBreaks, stripTags);
                if (!stripTags) {
                    htmlString += bbTag.markupGenerator(bbTag, content, currentTree.attributes)
                } else {
                    htmlString += content
                }
                suppressLineBreak = bbTag.suppressLineBreaks
            }
        });
        return htmlString
    };
    BBCodeParser.defaultTags = function() {
        var bbTags = new Array;
        bbTags["b"] = new BBTag("b", true, false, false);
        bbTags["i"] = new BBTag("i", true, false, false);
        bbTags["u"] = new BBTag("u", true, false, false);
        bbTags["text"] = new BBTag("text", true, false, true, function(tag, content, attr) {
            return content
        });
        bbTags["img"] = new BBTag("img", true, false, false, function(tag, content, attr) {
            return '<img src="' + content + '" />'
        });
        bbTags["url"] = new BBTag("url", true, false, false, function(tag, content, attr) {
            var link = content;
            if (attr["url"] != undefined) {
                link = escapeHTML(attr["url"])
            }
            if (!startsWith(link, "http://") && !startsWith(link, "https://")) {
                link = "http://" + link
            }
            return '<a href="' + link + '" target="_blank">' + content + "</a>"
        });
        bbTags["code"] = new BBTag("code", true, false, true, function(tag, content, attr) {
            var lang = attr["lang"];
            if (lang !== undefined) {
                return '<code class="' + escapeHTML(lang) + '">' + content + "</code>"
            } else {
                return "<code>" + content + "</code>"
            }
        });
        return bbTags
    };
    BBCodeParser.escapeHTML = function(content) {
        return escapeHTML(content)
    };
    BBCodeParser.startsWith = function(str, startStr) {
        return startsWith(str, startStr)
    };
    BBCodeParser.endsWith = function(str, endStr) {
        return endsWith(str, endStr)
    };
    return BBCodeParser
}();
