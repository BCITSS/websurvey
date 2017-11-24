$(document).ready(function () {
    var surveyTitle = document.getElementById("survey-title");
    var addQ = document.getElementById("addQuestion");
    var QuestCon = document.getElementById("questionsContainer");
    var questChoose = document.getElementById("questionChooser");
    var selectQ = document.getElementById("question1");
    var createBtn = document.getElementById("create-button");
    var clicked_btn = document.getElementById("q1");
    clicked_btn.style.backgroundColor = "red";
    var statusBar = document.getElementById("status-bar");
    var status_text = document.getElementById("status-text");
    var choices = [{
        "id": "multChoice",
        "name": "Multiple Choice"
    }, {
        "id": "trueFalse",
        "name": "True False"
    }, {
        "id": "shortAns",
        "name": "Short Answer"
    }, {
        "id": "ratingQuest",
        "name": "Rating Question"
    }, {
        "id": "multipleAnswer",
        "name": "Multiple Answers"
    }];
    var inc = 1;
    var surveyQuestions = [{
        "id": "question1",
        "type": "multChoice"
    }];
    var remQ = document.getElementById("removeQuestion");
    remQ.disabled = true;

    // Q1 sample button
    document.getElementById("q1").addEventListener("click", function () {
        changeQ("q1");
        colorQuestionButton(this);
    });
    changeQ("q1");
    console.log(choices);
    choices.forEach(function (Element) {
        var choice = document.createElement("button");
        choice.id = Element.id;
        choice.innerHTML = Element.name;
        choice.addEventListener("click", function () {
            selectType(choice.id);
            console.log(clicked_btn);
            clicked_btn.classList.remove(clicked_btn.classList[1]);
            clicked_btn.classList.add(this.id);
        })
        document.getElementById("questionChoices").appendChild(choice);
    })
    
    var clicked_type = document.getElementById("multChoice");
    
    // function check input is empty
    function emptyCheck(input){
        if( input.length == 0 || input == null || input ==""){
            return true;
        }else{
            return false;
        }
    }
    
    // check if survey title and question is empty
    function checkSurveyInput(survey_title,question_array){
        if(emptyCheck(survey_title)){
            return "survey title is empty"
        }
        for(var i=0; i<question_array.length;i++){
            var Element = question_array[i];
            if(emptyCheck(Element.question)){
                return "question " + (i+1) +" is empty"
            }else{
                if(Element.type != "shortAns"){
                    if(Element.answers.length <= 0){
                        return "question "+(i+1)+" answer option is empty"
                    }else{
                        for(var x=0; x<Element.answers.length;x++){
                            var answer_option = Element.answers[x];
                            if(emptyCheck(answer_option)){
                               return "question "+(i+1) +" answer option is empty"
                            }
                        }
                    }
                }
            }
        }
        return true;

    }

    function findQ(id) {
        var a = 0;
        var b = 0;
        surveyQuestions.forEach(function (Element) {
            if (id == Element.id) {
                b = a
            }
            a += 1;
        })
        return b;
    }

    function changeQ(qNum) {
        var num = parseInt(qNum.substr(1));
        selectQ.style.display = "none";
        selectQ = document.getElementById(surveyQuestions[num - 1].id);
        selectQ.style.display = "inline-block";
        if ($(selectQ).is(':empty')) {
            addQuestionPanel();
        }
    }

    function selectType(type) {
        selectQ.classList.forEach(function (Element) {
            if (Element != "question") {
                selectQ.classList.remove(Element);
            }
        })
        selectQ.classList.add(type);
        var position = findQ(selectQ.id);
        addQuestionPanel();
        
        surveyQuestions[position].type = type;
    }

    function deleteDiv() {
        $(this).parent().remove();
    }

    function addOption(optionValue,row_column = null) {
        var $ansDivClone = $("#" + selectQTypePanel).find("#answer-div").clone(true);
        $ansDivClone.find("#option-delete-btn").on("click", deleteDiv);
        if (selectQ.classList.contains("ratingQuest")) {
            if (this.id == "option-add-row-btn" || row_column == "row") {
                $(selectQ).find("#answer-row").append($ansDivClone);
            } else {
                $ansDivClone.find("#answer-option").removeClass();
                $ansDivClone.find("#answer-option").addClass("answer-option-col");
                $(selectQ).find("#answer-col").append($ansDivClone);
            }
        } else {
            $(selectQ).find("#answer-section").append($ansDivClone);
        }

    }

    function saveQuestion(question_w) {
        var question = $(question_w).find("#question").first();
        var questionImage = $(question_w).find("#question-image").first();
        if (!question_w.classList.contains("ratingQuest")) {
            var answersArray = (function () {
                var answers = $(question_w).find(".answer-option");
                var a = [];
                for (i = 0; i < answers.length; i++) {
                    a.push(answers[i].value);
                }
                return a;
            })();
        } else {
            var answersArray = (function () {
                var answersRow = $(question_w).find(".answer-option-row");
                var row = [];
                var answersCol = $(question_w).find(".answer-option-col");
                var col = [];
                for (i = 0; i < answersRow.length; i++) {
                    row.push(answersRow[i].value);
                }
                for (i = 0; i < answersCol.length; i++) {
                    col.push(answersCol[i].value);
                }
                return [row, col];
            })();
        }

        surveyQuestions.forEach(function (Element) {
            if (Element.id == question_w.id) {
                Element.question = question[0].value;
                Element.questionImage = questionImage[0].value;
                Element.answers = answersArray;
            }
        });
    }

    function addQuestionPanel() {
        selectQTypePanel = selectQ.className.split(" ")[1] + "-panel";
        var $panel = $('#' + selectQTypePanel).clone(true);
        $panel[0].id = selectQTypePanel + "-c"
        $(selectQ).children().remove();
        $(selectQ).append($panel);
        selectQ.firstChild.style.display = "block";

        // QuestionPanel Buttons LISTENER
        var $optionAddBtn = $(selectQ).find("#option-add-btn");
        var $saveButton = $(selectQ).find("#save-btn");
        var $deleteButton = $(selectQ).find("#option-delete-btn");
        var $addColBtn = $(selectQ).find("#option-add-col-btn");
        var $addRowBtn = $(selectQ).find("#option-add-row-btn");

        $deleteButton.on("click", deleteDiv);
        $optionAddBtn.on("click", addOption);
        $saveButton.on("click", saveQuestion(selectQ));
        $addColBtn.on("click", addOption);
        $addRowBtn.on("click", addOption);

    }
    function colorQuestionButton(buttonDOM){
        clicked_btn.style.backgroundColor = "";
        clicked_btn = buttonDOM;
        clicked_btn.style.backgroundColor = "red";
    }
    
    function addQuestion(question_type){
        inc += 1;
        var q = surveyQuestions.length;
        var newQ = document.createElement("div");
        newQ.id = "question" + (inc);
        newQ.className = "question";
        newQ.classList.add(question_type);
        QuestCon.appendChild(newQ);
        surveyQuestions.push({
            "id": newQ.id,
            "type": question_type
        })
        var newQBut = document.createElement("button");
        newQBut.id = "q" + (surveyQuestions.length);
        newQBut.className = "questionBut";
        newQBut.classList.add(question_type);
        newQBut.innerHTML = "Q" + (surveyQuestions.length);

        // Question button LISTENER
        newQBut.addEventListener("click", function () {
            changeQ(newQBut.id);
            colorQuestionButton(this);
            
        });
        changeQ(newQBut.id);
        questChoose.appendChild(newQBut);
        
        colorQuestionButton(newQBut);

        remQ.disabled = false;
        if (surveyQuestions.length > 9) {
            addQ.disabled = true;
        }
    }
    
    function loadSurveyObj(){
        $("#q1").remove();
        $("#question1").remove();
        surveyQuestions.pop();
        surveyTitle.value = global_survey_obj.name;
        surveyTitle.disabled = true;
        inc = 0;
        var row = 0; // record ratiing question row
        for (var g=0; g< global_survey_obj.questions.length; g++){
            var question = global_survey_obj.questions[g];
            var prev_question = global_survey_obj.questions[g-1];
//            addQuestion(question.question_type);
//            $("#question" + (g+1)).find("#question").val(question.question);
            
            // if is rating question
            if(question.question_type == "ratingQuest"){
                console.log("RR",question);
                if(prev_question != undefined && question.question == prev_question.question){
                    // row +1 when next question is in same rating question
                    row += 1
                    
                    // not add question but added another row
                    addOption(question.question_column,"row");
                    
                    // insert row value
                    $("#question" + (g+1-row)).find(".answer-option-row")[row].value = question.question_column;
                    
                }else{
                    // reset row back to 0 because is not same rating question
                    row = 0
                    addQuestion(question.question_type);
                    $("#question" + (g+1)).find("#question").val(question.question);
                    
                    // inert first row value
                    $("#question" + (g+1)).find(".answer-option-row")[row].value = question.question_column;
                    
                    // add option column
                    for (var y=0; y<question.answers.length-1; y++){
                        addOption(question.answers[y]);
                    }
                    
                    // insert value for column
                    for(var z=0; z<question.answers.length; z++){
                        $("#question" + (g+1)).find(".answer-option-col")[z].value = question.answers[z];
                    }
                }
                
            }
            else if(question.answers.length > 0 && question.question_type != "trueFalse"){
                addQuestion(question.question_type);
                $("#question" + (g+1)).find("#question").val(question.question);
                for (var x=0; x<question.answers.length-1; x++){
                    addOption(question.answers[x]);
                }
                for(var h=0; h<question.answers.length; h++){
                    $("#question" + (g+1)).find(".answer-option")[h].value = question.answers[h];
                }
            }
            
        }
    }
    
    // check if survey obj is assign
    
    if(global_survey_obj != "none"){
        loadSurveyObj();
        createBtn.remove();
        // create a button to DELETE survey and CREATE a new one;
        var done_btn = document.createElement("button");
        done_btn.id = "done-btn";
        done_btn.innerHTML = "Done";
        done_btn.addEventListener("click",function(){
            $(".question").each(function () {
            saveQuestion(this);
            });
            surveyTitle = document.getElementById("survey-title").value;

            $.ajax({
                url: "/modifySurvey",
                type: "post",
                data: {
                    name: surveyTitle,
                    questions: surveyQuestions
                },
                success: function (resp) {
                    if(resp.status == 'success'){
                        var msg = resp.survey_name + ' survey modified';
                        showStatusBar(msg);
                        location.reload();
                    }else{
                        showStatusBar(resp,"red")
                    }
                },
                error: function(e){
                    conosle.log(e);
                    showStatusBar("ERROR:"+e,"red");
                }
            });
        });
        $("#main-content").append(done_btn);
    }

    addQ.addEventListener("click", function(){addQuestion("multChoice")});

    remQ.addEventListener("click", function () {

        addQ.disabled = false;
        var a = 0;
        var b = 0;
        document.getElementById("q" + surveyQuestions.length).remove();
        surveyQuestions.forEach(function (Element) {
            if (Element.id == selectQ.id) {
                surveyQuestions.splice(a, 1);
                b = a;
            } else {
                a += 1;
            }
        })
        selectQ.remove();

        // select next question
        if (b > surveyQuestions.length - 1) {
            selectQ = document.getElementById(surveyQuestions[b - 1].id);
            changeQ("q" + (b));
            colorQuestionButton(document.getElementById("q" + (b)));
        } else {
            selectQ = document.getElementById(surveyQuestions[b].id);
            changeQ("q" + (b + 1));
            colorQuestionButton(document.getElementById("q" + (b+1)))
        }

        if (surveyQuestions.length < 2) {
            this.disabled = true;
            return;
        }

    })

    createBtn.addEventListener("click", function () {
        $(".question").each(function () {
            saveQuestion(this);
        });
        surveyTitle = document.getElementById("survey-title").value;
        
        // check input before create
        var checkInputStaus = checkSurveyInput(surveyTitle,surveyQuestions)
        
        // create survey
        if(checkInputStaus != true){
            showStatusBar(checkInputStaus,"red");
        }else{
            $.ajax({
                url: "/createSurvey",
                type: "post",
                data: {
                    name: surveyTitle,
                    questions: surveyQuestions
                },
                success: function (resp) {
                    console.log(resp.status);
                    if(resp.status == 'success'){
                        showStatusBar(resp.survey_name + ' survey created');
                        $("#main-content").html("");
                    }else{
                        showStatusBar(resp,"red");
                    }
                },
                error: function(e){
                    console.log(e);
                    showStatusBar("ERROR:"+e,"red");
                }
            });
        }
        console.log("CREATE",surveyQuestions);
    })
})
