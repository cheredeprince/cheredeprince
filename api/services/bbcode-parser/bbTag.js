//Represents a BB tag
var BBTag = (function () {
    //Creates a new BB tag
    function BBTag(tagName, //The name of the tag
        insertLineBreaks, //Indicates if line breaks are inserted inside the tag content
        suppressLineBreaks, //Suppresses any line breaks for nested tags
        noNesting, //Indicates if the tag supports nested tags
        markupGenerator) {
        this.tagName = tagName;
        this.insertLineBreaks = insertLineBreaks;
        this.suppressLineBreaks = suppressLineBreaks;
        this.noNesting = noNesting;
        this.markupGenerator = markupGenerator;
        //If no generator is defined, use the default one
        if (markupGenerator == undefined) {
            this.markupGenerator = function (tag, content, attr) {
                return "<" + tag.tagName + ">" + content + "</" + tag.tagName + ">";
            };
        }
    }
    //Creates a new simple tag
    BBTag.createSimpleTag = function (tagName, insertLineBreaks) {
        if (insertLineBreaks === void 0) { insertLineBreaks = true; }
        return new BBTag(tagName, insertLineBreaks, false, false);
    };
    //Creates a tag with the given generator
    BBTag.createTag = function (tagName, markupGenerator, insertLineBreaks) {
        if (insertLineBreaks === void 0) { insertLineBreaks = true; }
        return new BBTag(tagName, insertLineBreaks, false, false, markupGenerator);
    };
    return BBTag;
})();

module.exports = BBTag;
