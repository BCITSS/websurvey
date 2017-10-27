$(document).ready(function(){
    var addQ =document.getElementById("addQuestion");
    var QuestCon = document.getElementById("questionsContainer");
    var questChoose = document.getElementById("questionChooser");
    var selectQ = document.getElementById("question1");
    var choices = ["multChoice", "trueFalse", "shortAns", "ratingQuest", "multipleAnswer"];
    var inc = 1;
    var surveyQuestions = [{"id":"question1","type":"multChoice"}];
    var remQ = document.getElementById("removeQuestion");
    
    document.getElementById("q1").addEventListener("click",function(){
        changeQ("q1");
    })
    choices.forEach(function(Element){
        var choice = document.createElement("button");
        choice.id = Element;
        choice.innerHTML = Element;
        choice.addEventListener("click", function(){
            selectType(choice.id);
        })
        document.getElementById("questionChoices").appendChild(choice);
    })
    
    function findQ(id){
        var a = 0;
        var b = 0;
        surveyQuestions.forEach(function(Element){
            if(id == Element.id){
                b=a
            }
            a += 1;
        })
        return b;
    }
    
    function changeQ(qNum) {
        var num = parseInt(qNum.substr(1));
        selectQ.style.display = "none";
        selectQ = document.getElementById(surveyQuestions[num-1].id);   
        selectQ.style.display = "inline-block";
    }
    
    function selectType(type){
        selectQ.classList.forEach(function(Element){
            if( Element != "question"){
                selectQ.classList.remove(Element);
            }
        })
        selectQ.classList.add(type);
        var position = findQ(selectQ.id);
        console.log(position)
        surveyQuestions[position].type = type;
    }
    
    addQ.addEventListener("click", function(){
        inc += 1;
        var q = surveyQuestions.length;
        var newQ = document.createElement("div");
        newQ.id = "question" + (inc);
        newQ.className = "question";
        newQ.classList.add("multChoice")
        QuestCon.appendChild(newQ);
        surveyQuestions.push({"id": newQ.id ,"type":"multChoice"})
        var newQBut = document.createElement("button");
        newQBut.id="q"+(surveyQuestions.length);
        newQBut.className = "questionBut";
        newQBut.innerHTML = "Q" + (surveyQuestions.length);
        newQBut.addEventListener("click", function(){
            changeQ(newQBut.id);
        });
        changeQ(newQBut.id);
        questChoose.appendChild(newQBut);
    })
    
    remQ.addEventListener("click",function(){
        var a = 0;
        var b = 0;
        document.getElementById("q"+surveyQuestions.length).remove();
        surveyQuestions.forEach(function(Element){
            if(Element.id == selectQ.id){
                surveyQuestions.splice(a,1);
                b = a;
            }
            a += 1;
        })
        selectQ.remove();
        if(b > surveyQuestions.length - 1){
            selectQ = document.getElementById(surveyQuestions[b-1].id);
        }
        else {
            selectQ = document.getElementById(surveyQuestions[b].id);
        }
    })
})