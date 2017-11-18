var question = document.getElementById("question"),
    
    next = document.getElementById("next"),
    previous = document.getElementById("previous"),
    
    pbar = document.getElementById("pbar"),
    pbarText = document.getElementById("pbarText");

$(document).ready(function() {
    
    $.ajax({
        url: "/client",
        data: {
            client: true,
            department_id: 1
        },
        type: "post",
        success: function(resp) {
            console.log(resp);
            if(resp) {
                
                var optionsDivList = [],
                    optionsList = [];
                question.innerHTML = resp.questions[0].question;
                
                for (var i=0; i < resp.questions.length; i++) {
                    
                    var answerOuterDiv = document.createElement("div");
                    answerOuterDiv.className = "answerOuterDiv";
                    answerOuterDiv.id = "answerOuterDiv"+(i);
                    answerOuterDiv.style.opacity = "0";
                    answerOuterDiv.style.left = "100%";
                    optionsDivList.push(answerOuterDiv);
                    
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
                    
                    for(var j=0; j < resp.questions[i].answers.length; j++) {
                        var options = document.createElement("button");
                        options.className = "options";
                        options.classList.add("question" + (i+1));
                        options.id = "options"+(i+1)+(j+1);
                        options.innerHTML = resp.questions[i].answers[j];
                        answerDiv.appendChild(options);
                        
                        optionsList.push(options);
                        
                        options.addEventListener("click", function() {
                            var option = this.id;
                            for(var l=0; l < optionsList.length; l++) {
                                if(optionsList[l].classList.contains("question" + (counter + 1))) {
                                    if(optionsList[l].id == option) {
                                        optionsList[l].style.backgroundColor = "orange";
                                        optionsList[l].style.border = ".25vw inset orange";
                                        optionsList[l].style.boxShadow = "0 0 .75vw black";
                                    } else {
                                        optionsList[l].style.backgroundColor = "yellow";
                                        optionsList[l].style.border = ".25vw outset yellow";
                                        optionsList[l].style.boxShadow = ".2vw .2vw 1.25vw black";
                                    }
                                }
                            }
                        });
                    }
                    
                }
                
                document.getElementById("answerOuterDiv0").style.opacity = "1";
                document.getElementById("answerOuterDiv0").style.left = "5%";
                
                var counter = 0;
                pbar.style.width = (((counter+1)/resp.questions.length)*100) + "%";
                pbarText.innerHTML = (counter+1) + " of " + resp.questions.length;
                
                next.addEventListener("click", function() {
                    if (counter >= resp.questions.length - 1) {
                        counter = resp.questions.length - 1;
                    } else {
                        counter++;
                    }
                    
                    question.innerHTML = resp.questions[counter].question;
                    
                    for (var i=0; i < optionsDivList.length; i++) {
                        optionsDivList[i].style.opacity = "0";
                        optionsDivList[i].style.left = "-100%";
                    }
                    
                    document.getElementById("answerOuterDiv"+counter).style.opacity = "1";
                    document.getElementById("answerOuterDiv"+counter).style.left = "5%";
                    
                    pbar.style.width = (((counter+1)/resp.questions.length)*100) + "%";
                    pbarText.innerHTML = (counter+1) + " of " + resp.questions.length;
                });
                
                previous.addEventListener("click", function() {
                    if (counter < 1) {
                        counter = 0;
                    } else {
                        counter--;
                    }
                    
                    question.innerHTML = resp.questions[counter].question;
                    
                    for (var i=0; i < optionsDivList.length; i++) {
                        optionsDivList[i].style.opacity = "0";
                        optionsDivList[i].style.left = "100%";
                    }
                    
                    document.getElementById("answerOuterDiv"+counter).style.opacity = "1";
                    document.getElementById("answerOuterDiv"+counter).style.left = "5%";
                    
                    pbar.style.width = (((counter+1)/resp.questions.length)*100) + "%";
                    pbarText.innerHTML = (counter+1) + " of " + resp.questions.length;
                });
                
            } else {
                console.log("*FAILED*");
            }
            
        }
        
    });
});