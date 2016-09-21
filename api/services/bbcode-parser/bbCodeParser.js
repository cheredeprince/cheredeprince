﻿var BBCodeParseTree = require("./bbCodeParseTree")
var BBTag = require("./bbTag");

//Indicates if the first string ends with the second str
function endsWith(str, endStr) {
    if (str.length == 0) {
        return false;
    }
    if (endStr.length > str.length) {
        return false;
    }
    var inStrEnd = str.substr(str.length - endStr.length, endStr.length);
    return endStr == inStrEnd;
}
//Indicates if the first string starts with the second string
function startsWith(str, startStr) {
    if (str.length == 0) {
        return false;
    }
    if (startStr.length > str.length) {
        return false;
    }
    var inStrStart = str.substr(0, startStr.length);
    return startStr == inStrStart;
}
var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
//Escapes the given html
function escapeHTML(html) {
    return html.replace(/[&<>]/g, function (tag) {
        return tagsToReplace[tag] || tag;
    });
}
//Represents a BB code parser
var BBCodeParser = (function () {
    //Creates a new parser with the given tags
    function BBCodeParser(bbTags) {
        this.bbTags = bbTags;
    }
    //Parses the given string
    BBCodeParser.prototype.parseString = function (content, stripTags, insertLineBreak) {
        if (stripTags === void 0) { stripTags = false; }
        if (insertLineBreak === void 0) { insertLineBreak = true; }
        //Create the parse tree
        var parseTree = BBCodeParseTree.buildTree(content, this.bbTags);
        //If the tree is invalid, return the input as text
        if (parseTree == null || !parseTree.isValid()) {
            return content;
        }
        //Convert it to HTML
        return this.treeToHtml(parseTree.subTrees, insertLineBreak, stripTags);
    };
    //Converts the given subtrees into html
    BBCodeParser.prototype.treeToHtml = function (subTrees, insertLineBreak, stripTags) {
        var _this = this;
        if (stripTags === void 0) { stripTags = false; }
        var htmlString = "";
        var suppressLineBreak = false;
        subTrees.forEach(function (currentTree) {
            if (currentTree.treeType == 1 /* Text */) {
                var textContent = currentTree.content;
                textContent = escapeHTML(textContent);
                if (insertLineBreak && !suppressLineBreak) {
                    textContent = textContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    suppressLineBreak = false;
                }
                htmlString += textContent;
            }
            else {
                //Get the tag
                var bbTag = _this.bbTags[currentTree.content];
                var content = _this.treeToHtml(currentTree.subTrees, bbTag.InsertLineBreaks, stripTags);
                //Check if to strip the tags
                if (!stripTags) {
                    htmlString += bbTag.markupGenerator(bbTag, content, currentTree.attributes);
                }
                else {
                    htmlString += content;
                }
                suppressLineBreak = bbTag.suppressLineBreaks;
            }
        });
        return htmlString;
    };
    //Returns the default tags
    BBCodeParser.defaultTags = function () {
        var bbTags = new Array();
        //Simple tags
        bbTags["b"] = new BBTag("b", true, false, false);
        bbTags["i"] = new BBTag("i", true, false, false);
        bbTags["u"] = new BBTag("u", true, false, false);
        bbTags["text"] = new BBTag("text", true, false, true, function (tag, content, attr) {
            return content;
        });
        bbTags["img"] = new BBTag("img", true, false, false, function (tag, content, attr) {
            return "<img src=\"" + content + "\" />";
        });
        bbTags["url"] = new BBTag("url", true, false, false, function (tag, content, attr) {
            var link = content;
            if (attr["url"] != undefined) {
                link = escapeHTML(attr["url"]);
            }
            if (!startsWith(link, "http://") && !startsWith(link, "https://")) {
                link = "http://" + link;
            }
            return "<a href=\"" + link + "\" target=\"_blank\">" + content + "</a>";
        });
        bbTags["code"] = new BBTag("code", true, false, true, function (tag, content, attr) {
            var lang = attr["lang"];
            if (lang !== undefined) {
                return "<code class=\"" + escapeHTML(lang) + "\">" + content + "</code>";
            }
            else {
                return "<code>" + content + "</code>";
            }
        });
        return bbTags;
    };
    BBCodeParser.escapeHTML = function (content) {
        return escapeHTML(content);
    };
    BBCodeParser.startsWith = function (str, startStr) {
        return startsWith(str, startStr);
    };
    BBCodeParser.endsWith = function (str, endStr) {
        return endsWith(str, endStr);
    };
    return BBCodeParser;
})();

module.exports = BBCodeParser;
