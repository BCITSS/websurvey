
var questionDiv = document.getElementById("questionDiv"),
    
    next = document.getElementById("next"),
    previous = document.getElementById("previous"),
    submit = document.getElementById("submit"),
    
    pbar = document.getElementById("pbar"),
    pbarText = document.getElementById("pbarText");

var regEx = /^[a-zA-Z0-9 \.\,\-\!\?\&]{0,75}$/;

import swal from 'sweetalert2';
const swal = require('sweetalert2');

$(document).ready(function() {
    $(document).keydown(function(objEvent) {
        if (objEvent.keyCode == 9) {  //tab pressed
            objEvent.preventDefault(); // stops its action
        }
    })
    
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
                
                var questionsList = [],
                    optionsDivList = [],
                    optionsList = [];
                
                for (var i=0; i < resp.questions.length; i++) {
                    var question = document.createElement("div");
                    question.id = "question" + i;
                    question.className = "question";
                    questionsList.push(question);
                    question.innerHTML = resp.questions[i].question;
                    if (resp.questions[i].question.length >= 25 && resp.questions[i].question.length < 50) {
                        questionsList[i].style.fontSize = "250%";
                    } else if (resp.questions[i].question.length >= 50 && resp.questions[i].question.length < 75) {
                        questionsList[i].style.fontSize = "200%";
                    } else if (resp.questions[i].question.length >= 75 && resp.questions[i].question.length < 100) {
                        questionsList[i].style.fontSize = "150%";
                    } else if (resp.questions[i].question.length >= 100) {
                        questionsList[i].style.fontSize = "125%";
                    }
                    
                    console.log(resp.questions[i].question.length);
                    
                    questionDiv.appendChild(question);
                    
                    var answerOuterDiv = document.createElement("div");
                    answerOuterDiv.className = "answerOuterDiv";
                    answerOuterDiv.id = "answerOuterDiv"+(i);
                    answerOuterDiv.style.opacity = "0";
                    answerOuterDiv.style.left = "100%";
                    optionsDivList.push(answerOuterDiv);
                    
                    document.body.appendChild(answerOuterDiv);
                    

                    var answerWrapDiv = document.createElement("div");
                    answerWrapDiv.className = "answerWrapDiv";
                    answerOuterDiv.appendChild(answerWrapDiv);
                    
                    var answerDiv = document.createElement("div");
                    answerDiv.className = "answerDiv";
                    answerWrapDiv.appendChild(answerDiv);
                    
                    if (resp.questions[i].question_variable == null) {
                        answerWrapDiv.style.width = "100%";
                    } else {
                        var answerImageDiv = document.createElement("div");
                        answerImageDiv.className = "answerImageDiv";
                        answerOuterDiv.appendChild(answerImageDiv);

                        var answerImage = document.createElement("img");
                        answerImage.className = "answerImage";
                        answerImage.src = resp.questions[i].question_variable;
                        answerImageDiv.appendChild(answerImage);
                    }
                    
                    if (resp.questions[i].question_type == "multChoice") {
                        
                        for(var j=0; j < resp.questions[i].answers.length; j++) {
                            
                            var MCoptions = document.createElement("button");
                            MCoptions.className = "MCoptions";
                            MCoptions.classList.add("question" + (i+1));
                            MCoptions.id = "MCoptions"+(i+1)+(j+1);
                            MCoptions.innerHTML = resp.questions[i].answers[j];
                            answerDiv.appendChild(MCoptions);

                            optionsList.push(MCoptions);

                            MCoptions.addEventListener("click", function() {
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
                        
                    } else if (resp.questions[i].question_type == "shortAns") {
                        
                        var SAinput = document.createElement("input");
                        SAinput.maxLength = "75";
                        SAinput.id = "SAinput" + (i+1);
                        SAinput.className = "SAinput";
                        SAinput.placeholder = "Type here...";
                        SAinput.onfocus = function() {
                            this.placeholder = "";
                        };
                        SAinput.onblur = function() {
                            this.placeholder = "Type here...";
                        };
                        SAinput.spellCheck = "false";
                        SAinput.classList.add(SAinput.id);
                        
                        var errMsg = document.createElement("div");
                        errMsg.className = "errMsg";
                        errMsg.innerHTML = "Invalid character(s) entered";
                        errMsg.style.opacity = "0";
                        
                        var wordCounter = document.createElement("div");
                        wordCounter.className = "wordCounter";
                        wordCounter.id = "wordCounter"+(i+1);
                        wordCounter.innerHTML = "75 word(s) left";
                        wordCounter.classList.add(SAinput.id);
                        
                        SAinput.addEventListener("keyup", function() {
                            var thisID = this.id;
                            
                            var length = this.value.length;
                            var finalLength = this.maxLength - length;
                            var inputs = document.getElementsByClassName("SAinput");
                            var errors = document.getElementsByClassName("errMsg");
                            var counters = document.getElementsByClassName("wordCounter");
                            
                            for (var j=0; j < counters.length; j++) {
                                if (counters[j].classList.contains(thisID)) {
                                    counters[j].innerHTML = finalLength + " word(s) left";
                                }
                                if (inputs[j].classList.contains(thisID)) {
                                    if (regEx.test(this.value)) {
                                        this.style.borderColor = "yellow";
                                        this.style.backgroundColor = "lightyellow";
                                        
                                        errors[j].style.opacity = "0";
                                        
                                        next.disabled = false;
                                        previous.disabled = false;
                                        submit.disabled = false;
                                        next.style.backgroundColor = "whitesmoke";
                                        previous.style.backgroundColor = "whitesmoke";
                                        submit.style.backgroundColor = "yellow";
                                        next.style.borderColor = "whitesmoke";
                                        previous.style.borderColor = "whitesmoke";
                                        submit.style.borderColor = "yellow";
                                    } else {
                                        this.style.borderColor = "red";
                                        this.style.backgroundColor = "lightcoral";
                                        
                                        errors[j].style.opacity = "1";
                                        
                                        next.disabled = true;
                                        previous.disabled = true;
                                        submit.disabled = true;
                                        next.style.backgroundColor = "grey";
                                        previous.style.backgroundColor = "grey";
                                        submit.style.backgroundColor = "grey";
                                        next.style.borderColor = "grey";
                                        previous.style.borderColor = "grey";
                                        submit.style.borderColor = "grey";
                                    }
                                }
                            }
                        });
                        SAinput.addEventListener("keydown", function() {
                            var thisID = this.id;
                            
                            var length = this.value.length;
                            var finalLength = this.maxLength - length;
                            var inputs = document.getElementsByClassName("SAinput");
                            var errors = document.getElementsByClassName("errMsg");
                            var counters = document.getElementsByClassName("wordCounter");
                            
                            for (var j=0; j < counters.length; j++) {
                                if (counters[j].classList.contains(thisID)) {
                                    counters[j].innerHTML = finalLength + " word(s) left";
                                }
                                if (inputs[j].classList.contains(thisID)) {
                                    if (regEx.test(this.value)) {
                                        this.style.borderColor = "yellow";
                                        this.style.backgroundColor = "lightyellow";
                                        
                                        errors[j].style.opacity = "0";
                                        
                                        next.disabled = false;
                                        previous.disabled = false;
                                        submit.disabled = false;
                                        next.style.backgroundColor = "whitesmoke";
                                        previous.style.backgroundColor = "whitesmoke";
                                        submit.style.backgroundColor = "yellow";
                                        next.style.borderColor = "whitesmoke";
                                        previous.style.borderColor = "whitesmoke";
                                        submit.style.borderColor = "yellow";
                                    } else {
                                        this.style.borderColor = "red";
                                        this.style.backgroundColor = "lightcoral";
                                        
                                        errors[j].style.opacity = "1";
                                        
                                        next.disabled = true;
                                        previous.disabled = true;
                                        submit.disabled = true;
                                        next.style.backgroundColor = "grey";
                                        previous.style.backgroundColor = "grey";
                                        submit.style.backgroundColor = "grey";
                                        next.style.borderColor = "grey";
                                        previous.style.borderColor = "grey";
                                        submit.style.borderColor = "grey";
                                    }
                                }
                            }
                        });

                        
                        answerDiv.appendChild(wordCounter);
                        answerDiv.appendChild(SAinput);
                        answerDiv.appendChild(errMsg);
                        
                    } else if (resp.questions[i].question_type == "trueFalse") {
                        
                        var trueOption = document.createElement("button"),
                            falseOption = document.createElement("button");
                        
                        trueOption.className = "TFoptions";
                        trueOption.innerHTML = "True";
                        falseOption.className = "TFoptions";
                        falseOption.innerHTML = "False";
                        
                        answerDiv.appendChild(trueOption);
                        answerDiv.appendChild(falseOption);
                        
                        trueOption.addEventListener("click", function() {
                            this.style.backgroundColor = "orange";
                            this.style.border = ".25vw inset orange";
                            this.style.boxShadow = "0 0 .75vw black";
                            
                            falseOption.style.backgroundColor = "yellow";
                            falseOption.style.border = ".25vw outset yellow";
                            falseOption.style.boxShadow = ".2vw .2vw 1.25vw black";
                        });
                        falseOption.addEventListener("click", function() {
                            this.style.backgroundColor = "orange";
                            this.style.border = ".25vw inset orange";
                            this.style.boxShadow = "0 0 .75vw black";
                            
                            trueOption.style.backgroundColor = "yellow";
                            trueOption.style.border = ".25vw outset yellow";
                            trueOption.style.boxShadow = ".2vw .2vw 1.25vw black";
                        });
                        
                    }
                    
                }
                
                document.getElementById("answerOuterDiv0").style.opacity = "1";
                document.getElementById("answerOuterDiv0").style.left = "5%";

                document.getElementById("question0").style.opacity = "1";
                document.getElementById("question0").style.left = "2.5%";
                
                var counter = 0;
                pbar.style.width = (((counter+1)/resp.questions.length)*100) + "%";
                pbarText.innerHTML = (counter+1) + " of " + resp.questions.length;
                
                next.addEventListener("click", function() {
                    if (counter >= resp.questions.length - 1) {
                        console.log("sent",respWithAnswer)
                        counter = resp.questions.length - 1;
                        $.ajax({
                            url:"/insertSurveyResult",
                            type:"post",
                            data:{
                                result:respWithAnswer
                            },
                            success:function(resp){
                                console.log(resp)
                            }
                        });
                        counter = resp.questions.length - 1;
                    } else {
                        counter++;
                    }
                    

                    for (var i=0; i < questionsList.length; i++) {
                        questionsList[i].style.opacity = "0";
                        questionsList[i].style.left = "100%";
                    }
                    for (var i=0; i < optionsDivList.length; i++) {
                        optionsDivList[i].style.opacity = "0";
                        optionsDivList[i].style.left = "100%";
                    }
                    
                    document.getElementById("question"+counter).style.opacity = "1";
                    document.getElementById("question"+counter).style.left = "2.5%";
                    document.getElementById("answerOuterDiv"+counter).style.opacity = "1";
                    document.getElementById("answerOuterDiv"+counter).style.left = "5%";
                    
                    pbar.style.width = (((counter+1)/resp.questions.length)*100) + "%";
                    pbarText.innerHTML = (counter+1) + " of " + resp.questions.length;

                    
                    if((counter+1) == optionsDivList.length) {
                        submit.style.display = "inline";
                    }
                });
                
                previous.addEventListener("click", function() {
                    if (counter < 1) {
                        counter = 0;

                    } else {
                        counter--;
                    }
                    
                    for (var i=0; i < questionsList.length; i++) {
                        questionsList[i].style.opacity = "0";
                        questionsList[i].style.left = "-100%";
                    }
                    for (var i=0; i < optionsDivList.length; i++) {
                        optionsDivList[i].style.opacity = "0";
                        optionsDivList[i].style.left = "-100%";
                    }
                    
                    document.getElementById("question"+counter).style.opacity = "1";
                    document.getElementById("question"+counter).style.left = "2.5%";
                    document.getElementById("answerOuterDiv"+counter).style.opacity = "1";
                    document.getElementById("answerOuterDiv"+counter).style.left = "5%";
                    
                    pbar.style.width = (((counter+1)/resp.questions.length)*100) + "%";
                    pbarText.innerHTML = (counter+1) + " of " + resp.questions.length;
                    
                    submit.style.display = "none";
                });
                
                submit.addEventListener("click", function() {
                    swal({
                        title: '<span style="color:white">Are you ready to submit?<span>',
                        type: 'warning',
                        showCancelButton: true,
                        background: 'rgb(75,75,75)',
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, Submit!',
                        allowOutsideClick: false
                    }).then(function (result) {
                        if (result.value) {
                            swal({
                                title: '<span style="color:white;font-size:110%">Thank you for Speaking Up!</span></br><span style="color:rgb(200,200,200);font-size:65%">We appreciate your initiative to ignite change.</span>',
                                type: 'success',
                                background: 'rgb(75,75,75)',
                                width: '60vw',
                                showConfirmButton: false,
                                allowOutsideClick: false
                            });
                            setTimeout(function() {
                                location.href = "/client";
                            }, 6500);
                        }
                    });
                });
                
            } else {
                console.log("*FAILED*");
            }
            
        }
        
    });
});