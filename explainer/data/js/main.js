var json;

$(function() {

    $.getJSON("data/json/code.json" , function(data) {
        codes = data;
    });
    $.getJSON("data/json/operator.json" , function(data) {
        oprs = data;
    });
    
    $("#convertButton").click(function () {
        var srcText = $("#src").val();
        srcText = srcText.replace(/  +/g,"");
        for(var i in codes){
            var codeRE = new RegExp(codes[i].code,"g");
            var explanation = "";
            switch(codes[i].arg){
                //引数を持つ一般の関数について
                case "true":
                var expArg = srcText.match(RegExp(codes[i].code+"\\(.*\\)","g"));
                expArg = expArg.join("");
                expArg = expArg.replace(/.*\(/,"");
                var expLine = expArg.split("\,");
                for(var j in codes[i].explanation){
                    explanation += codes[i].explanation[j].a+expLine[j];
                }
                break;

                //if文の場合
                case "if":
                var expArg = srcText.match(RegExp(codes[i].code+"\\(.*\\)","g"));
                expArg = expArg.join("");
                expArg = expArg.replace(/.*\(/,"");
                expArg = expArg.replace(")","");
                expArg = "//"+oprsExp(expArg);
                explanation = expArg;
                break;

                //for文の場合
                case "for":
                var expArg = srcText.match(RegExp(codes[i].code+"\\(.*\\)","g"));
                expArg = expArg.join("");
                expArg = expArg.replace(/.*\(/,"");
                expArg = expArg.replace(")","");
                var expLine0 = expArg.split(";");
                var expLine = expLine0[0].split("=");
                expLine0.shift();
                for(var j in expLine0){
                    expLine0[j] = oprsExp(expLine0[j]);
                }
                expLine = expLine.concat(expLine0);
                expLine.push("");
                for(var j in codes[i].explanation){
                    explanation += codes[i].explanation[j].a+expLine[j];
                }
                break;

                case "false":
                explanation = codes[i].explanation;
                break;

                default:
                break;
            }

            srcText = srcText.replace(
                codeRE,
                explanation + "\n" + codes[i].code
            );
        }
    
        $("#dstText").text(srcText);
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    });

    //条件式を説明文に置き換える関数（引数：条件式の変数string）
    function oprsExp(expression){
        var expVar = "";
        var matchedOpr = "";
        for(var i in oprs){
            matchedOpr = expression.match(oprs[i].operator);
            if(matchedOpr){
                var vars = expression.replace(/ /g,"");
                vars = vars.split(oprs[i].operator);
                for(var j in vars){
                   expVar +=  vars[j]+oprs[i].explanation[j].a;
                }
                return expVar;
            }else{
                return "";
            }
        }
    }
});