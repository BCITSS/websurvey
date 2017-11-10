var question = document.getElementById("question");
var next = document.getElementById("next");
var previous = document.getElementById("previous");

$(document).ready(function(){
    console.log("QUESTIONS");
    
    $.ajax({
        url: "/questions",
        type: "post",
        success: function(resp) {
            
            if(resp.status == "success") {
                
                console.log(resp.aArr);
                question.innerHTML = resp.qPack[0].question;
                
                for (var i=0; i < resp.qPack.length; i++) {
                    
//                    question.innerHTML = resp.qPack[i].question;
                    
                    var answerOuterDiv = document.createElement("div");
                    answerOuterDiv.className = "answerOuterDiv";
                    answerOuterDiv.id = "answerOuterDiv"+(i+1);
                    
                    document.body.appendChild(answerOuterDiv);
                    
                    var answerImageDiv = document.createElement("div");
                    answerImageDiv.className = "answerImageDiv";
                    answerOuterDiv.appendChild(answerImageDiv);

                    var answerImage = document.createElement("img");
                    answerImage.className = "answerImage";
                    answerImage.src = "/images/bcit.png";
                    answerImageDiv.appendChild(answerImage);

                    var answerWrapDiv = document.createElement("div");
                    answerWrapDiv.className = "answerWrapDiv";
                    answerOuterDiv.appendChild(answerWrapDiv);
                    
                    var answerDiv = document.createElement("div");
                    answerDiv.className = "answerDiv";
                    answerWrapDiv.appendChild(answerDiv);
                    
                    for(var j=0; j < resp.aArr[0].length; j++) {
                        var options = document.createElement("button");
                        options.className = "options";
                        if (resp.aArr[i][j] !== undefined) {
                            options.innerHTML = resp.aArr[i][j].answer;
                        } else {
                            continue;
                        }
                        answerDiv.appendChild(options);
                    }
                    
                }
                
                document.getElementById("answerOuterDiv2").style.left = "100%";
                document.getElementById("answerOuterDiv2").style.opacity = "0";
                
                next.addEventListener("click", function() {
                    document.getElementById("answerOuterDiv1").style.left = "-100%";
                    document.getElementById("answerOuterDiv2").style.left = "5%";
                    document.getElementById("answerOuterDiv1").style.opacity = "0";
                    document.getElementById("answerOuterDiv2").style.opacity = "1";
                    for (var i=0; i < resp.qPack.length; i++) {
                        question.innerHTML = resp.qPack[i].question;
                    }
                });
                
                previous.addEventListener("click", function() {
                    document.getElementById("answerOuterDiv1").style.left = "5%";
                    document.getElementById("answerOuterDiv2").style.left = "100%";
                    document.getElementById("answerOuterDiv1").style.opacity = "1";
                    document.getElementById("answerOuterDiv2").style.opacity = "0";
                    for (var i=0; i < resp.qPack.length; i--) {
                        question.innerHTML = resp.qPack[i].question;
                    }
                });
                
            } else {
                console.log("*FAILED*");
            }
        }
    });
});