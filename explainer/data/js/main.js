var json;

$(function() {

    $.getJSON("data/json/data.json" , function(data) {
      json = data;
    });
    
    $("#convertButton").click(function () {
        var srcText = $("#src").val();
        srcText = srcText.replace(/  +/g,"");
        for(var i in json){
            var codeRE = new RegExp(json[i].code,"g");
            var explanation = "";
            switch(json[i].arg){
                //引数を持つ一般の関数について
                case "true":
                var expArg = srcText.match(RegExp(json[i].code+"\\(.*\\)","g"));
                expArg = expArg.join("");
                expArg = expArg.replace(/.*\(/,"");
                var expLine = expArg.split("\,");
                for(var j in json[i].explanation){
                    explanation += json[i].explanation[j].a+expLine[j];
                }
                break;

                //for文の場合
                case "for":
                var expArg = srcText.match(RegExp(json[i].code+"\\(.*\\)","g"));
                expArg = expArg.join("");
                expArg = expArg.replace(/.*\(/,"");
                expArg = expArg.replace(")","");
                var expLine0 = expArg.split(";");
                var expLine = expLine0[0].split("=");
                expLine0.shift();
                expLine = expLine.concat(expLine0);
                expLine.push("");
                for(var j in json[i].explanation){
                    explanation += json[i].explanation[j].a+expLine[j];
                }
                break;

                default:
                explanation = json[i].explanation;
                break;
            }

            srcText = srcText.replace(
                codeRE,
                explanation + "\n" + json[i].code
            );
        }
    
        $("#dstText").text(srcText);
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    });
    
});