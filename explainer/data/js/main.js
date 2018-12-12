var json;

$(function() {

    $.getJSON("data/json/code.json" , function(data) {
        codes = data;
    });
    $.getJSON("data/json/operator.json" , function(data) {
        oprs = data;
    });
    
    //ボタンクリック時にjsonから説明文を読み込む
    $("#src").on("ready load keyup", function () {
        var srcText = $("#src").val();
        srcText = srcText.replace(/  +/g,"");
        for(var i in codes){
            var codeRE = new RegExp(codes[i].code,"g");
            switch(codes[i].arg){
                //引数を持つ一般の関数について
                case "true":
                var expArgs = srcText.match(RegExp(codes[i].code+"\\(.*\\)","g"));
                for(var j in expArgs){
                    var explanation = "";
                    var expArg = expArgs[j];
                    expArg = expArg.replace(/.*\(/,"");
                    var expLine = expArg.split("\,");
                    for(var k in codes[i].explanation){
                        explanation += codes[i].explanation[k].a+expLine[k];
                    }
                    srcText = srcText.replace(
                        expArgs[j],
                        explanation + "\n" + expArgs[j]
                    );
                }
                break;

                //if文の場合
                case "if":
                var expArgs = srcText.match(RegExp(codes[i].code+"\\(.*\\)","g"));
                for(var j in expArgs){
                    var explanation = "";
                    var expArg = expArgs[j];
                    expArg = expArg.replace(/.*\(/,"");
                    expArg = expArg.replace(")","");
                    expArg = oprsExp(expArg);
                    explanation = codes[i].explanation[0].a+expArg+codes[i].explanation[1].a;
                    srcText = srcText.replace(
                        expArgs[j],
                        explanation + "\n" + expArgs[j]
                    );
                }
                break;

                //for文の場合
                case "for":
                var expArgs = srcText.match(RegExp(codes[i].code+"\\(.*\\)","g"));
                for(var j in expArgs){
                    var explanation = "";
                    var expArg = expArgs[j];
                    expArg = expArg.replace(/.*\(/,"");
                    expArg = expArg.replace(")","");
                    var expLine0 = expArg.split(";");
                    var expLine = expLine0[0].split("=");
                    expLine0.shift();
                    for(var k in expLine0){
                        expLine0[k] = oprsExp(expLine0[k]);
                    }
                    expLine = expLine.concat(expLine0);
                    expLine.push("");
                    for(var k in codes[i].explanation){
                        explanation += codes[i].explanation[k].a+expLine[k];
                    }
                    srcText = srcText.replace(
                        expArgs[j],
                        explanation + "\n" + expArgs[j]
                    );
                }
                break;

                case "false":
                explanation = codes[i].explanation;
                srcText = srcText.replace(
                    codeRE,
                    explanation + "\n" + codes[i].code
                );
                break;

                default:
                break;
            }
        }

        //カッコの入れ子判定を行いインデントする
        var nestCount = 0;
        var outText = "";
        srcText = srcText.split("\n");
        var nestCounts = new Array(srcText.length);
        for(var i in srcText){
            if( !(srcText[i].match("//")) && srcText[i].match("}")){
                nestCount--;
            }
            for(var j=0;j<nestCount;j++){
                srcText[i] = "    "+srcText[i];
            }
            if( !(srcText[i].match("//")) && srcText[i].match("{")){
                nestCount++;
            }
            nestCounts[i] = nestCount;
            outText += "  "+srcText[i]+"\n";
        }
        //srcTextは行毎に分割された配列となった
        console.log(nestCounts);
        console.log(srcText);
        $("#dstText").text(outText);
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
        //文章の処理はここで終わり、行毎の情報は引き続きcanvasで用いる

        //canvas要素でのビジュアル描画
        function draw() {
            $('#canvas').attr('width', $('#canvas-wrapper').width());
            $('#canvas').attr('height', $('#canvas-wrapper').height());
            var canvas = document.getElementById('canvas');
            if ( ! canvas || ! canvas.getContext ) {
                return false;
            }
            var ctx = canvas.getContext('2d');
            var w = canvas.width;
            var h = canvas.height;
            var fontSize = parseInt($('#dst').css('line-height'));
            var nestMax = nestCounts.reduce((a,b)=>a>b?a:b);
            //だいぶ回りくどいことをしている気がします
            var funcName = new Array(srcText.length);
            for(var i in srcText){
                for(var j in codes){
                    if(srcText[i].match(RegExp(codes[j].code+"\\(.*\\)"))){
                        funcName[i] = codes[j].code;
                    }else if(srcText[i].match("function .*\\(")){
                        funcName[i] = "function";
                    }
                }
            }

            //この中で描画
            function render(){
                /*いじらない*/
                ctx.clearRect(0,0,w,h);
                var sh = $('#dst').scrollTop()-fontSize;
                var sl = $('#dstText').scrollLeft();
                //console.log(sh+","+sl);
                /*いじらない*/

                ctx.strokeStyle = '#eee';
                for(var i=-3;i-sh<h;i+=fontSize){
                    ctx.beginPath();
                    ctx.moveTo(25, i-sh);
                    ctx.lineTo(w, i-sh);
                    ctx.closePath();
                    ctx.stroke();
                }


                ctx.strokeStyle = '#734229';
                for(var i=1;i<=nestMax;i++){
                    for(var j in nestCounts){
                        if(nestCounts[j-1] < nestCounts[j] && nestCounts[j]==i){
                            ctx.beginPath();
                            ctx.moveTo(18-sl+i*31/2,j*fontSize-sh);
                            ctx.lineTo(12-sl+i*31/2,j*fontSize-sh);
                            ctx.moveTo(12-sl+i*31/2,j*fontSize-sh);
                        }
                        if(nestCounts[j-1] > nestCounts[j] && nestCounts[j]==i-1){
                            ctx.lineTo(12-sl+i*31/2,j*fontSize-sh+14);
                            ctx.lineTo(18-sl+i*31/2,j*fontSize-sh+14);
                            ctx.moveTo(12-sl+i*31/2,j*fontSize-sh+14);
                            ctx.closePath();
                            ctx.stroke();
                        }
                    }
                }
                //おまじない
                ctx.beginPath();
                ctx.closePath();

                //テキストボックス外
                ctx.clearRect(0,0,22,h+sh);
                ctx.strokeStyle = '#0C00CC';
                for(var i in srcText){
                    if(funcName[i]){
                        switch(funcName[i]){
                            case "function":
                            
                            ctx.rect(3,i*fontSize-sh,14,14);
                            ctx.stroke();
                            ctx.strokeText("f",8,i*fontSize-sh+11);
                            break;
    
                            case "if":
                            ctx.strokeStyle = '0C00CC';
                            ctx.rect(3,i*fontSize-sh,14,14);
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.moveTo(10,i*fontSize-sh+14);
                            ctx.lineTo(10,i*fontSize-sh+8);
                            ctx.lineTo(5,i*fontSize-sh+3);
                            ctx.lineTo(6,i*fontSize-sh+8);
                            ctx.moveTo(5,i*fontSize-sh+3);
                            ctx.lineTo(10,i*fontSize-sh+3);
                            ctx.moveTo(10,i*fontSize-sh+10);
                            ctx.lineTo(15,i*fontSize-sh+5);
                            ctx.lineTo(14,i*fontSize-sh+10);
                            ctx.moveTo(15,i*fontSize-sh+5);
                            ctx.lineTo(11,i*fontSize-sh+5);
                            ctx.closePath();
                            ctx.stroke();
                            break;
    
                            case "else":
                            break;
    
                            case "for":
                            ctx.strokeStyle = '0C00CC';
                            ctx.rect(3,i*fontSize-sh,14,14);
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.moveTo(9,i*fontSize-sh+6);
                            ctx.lineTo(6,i*fontSize-sh+10);
                            ctx.lineTo(6,i*fontSize-sh+3);
                            ctx.lineTo(14,i*fontSize-sh+3);
                            ctx.moveTo(8,i*fontSize-sh+10);
                            ctx.closePath();
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.moveTo(6,i*fontSize-sh+12);
                            ctx.lineTo(14,i*fontSize-sh+12);
                            ctx.lineTo(14,i*fontSize-sh+6);
                            ctx.lineTo(11,i*fontSize-sh+9);
                            ctx.moveTo(14,i*fontSize-sh+6);
                            ctx.closePath();
                            ctx.stroke();
                            break;
    
                            default:
                            break;
                        }
                    }
                }

                requestAnimationFrame(render);
            }
            render();
        }
        draw();
    });

    //条件式を説明文に置き換える関数（引数：条件式の変数string）
    function oprsExp(expression){
        var expVar = "";
        var matchedNum = [];
        var matchedOpr = [];
        for(var i in oprs){
            if(expression.match(oprs[i].operator)){
                matchedNum.push(i);
                matchedOpr.push(expression.match(oprs[i].operator));
            }
        }
        matchedNum.pop();
        matchedOpr.pop();
        //alert("検索した演算子："+matchedOpr);
        if(matchedOpr.length > 0){
            for(var i in matchedOpr){
                if( (matchedOpr.length > 1 && i > 0) || (matchedOpr.length <= 1) ){
                    var vars = expression.replace(/ /g,"");
                    //alert(vars+","+matchedOpr[i]);
                    vars = vars.split(matchedOpr[i]);
                    for(var j in vars){
                        //alert("変換中[i]"+matchedOpr[i]+"変換中[j]："+vars[j]);
                        expVar +=  vars[j]+oprs[matchedNum[i]].explanation[j].a;
                    }
                    return expVar;
                }
            }
        }
    }
});


