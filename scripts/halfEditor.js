$(document).ready(function () {
    var surveyTitle = document.getElementById("survey-title");
    var addQ = document.getElementById("addQuestion");
    var QuestCon = document.getElementById("questionsContainer");
    var questChoose = document.getElementById("questionChooser");
    var selectQ = document.getElementById("question1");

    var selectQbtn;
    var createBtn = document.getElementById("create-button");
    var statusBar = document.getElementById("status-bar");
    var status_text = document.getElementById("status-text");
    var remQ = document.getElementById("removeQuestion");
    var inc = 1;
    var surveyQuestions = [];

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
//        "id": "ratingQuest",
//        "name": "Rating Question"
//    }, {
        "id": "multipleAnswer",
        "name": "Multiple Answers"
    }];

  
    
    function initialize(){
        // add default question 1
        addQuestion("multChoice");
        addQuestionPanel();
        changeQ("q1")
        
        
        
        // generate question type button
        document.getElementById("questionChoices").innerHTML = "";
        choices.forEach(function (Element) {
            var wrapLi = document.createElement("li");
            var choice = document.createElement("a");
            choice.id = Element.id;
            choice.innerHTML = Element.name;
            choice.href="#";
            choice.addEventListener("click", function () {
                selectType(choice.id);
            })
           wrapLi.appendChild(choice);
            document.getElementById("questionChoices").appendChild(wrapLi);
        })
        
    }
    
    initialize()
    
    function checkSurveySize(){
        if(surveyQuestions.length >= 10){
            return 1;
        }else if (surveyQuestions.length <= 1){
            return -1;
        }else{
            return 0;
        }
    }


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

    function changeQ(question_button_id) {
        // get question number
        var num = parseInt(question_button_id.substr(1));
        
        // for first question selectQ is undefine
        if(selectQ != undefined){
            selectQ.style.display = "none";
        }
        
        selectQ = document.getElementById(surveyQuestions[num - 1].id);
        
        selectQ.style.display = "inline-block";
        
        // add question panel when initialize new question
        if ($(selectQ).is(':empty')) {
            addQuestionPanel();
        }
    }

    function selectType(type) {
        selectQ.classList.remove(selectQ.classList.item(2));
        selectQ.classList.add(type)
        var position = findQ(selectQ.id);
        addQuestionPanel();
        surveyQuestions[position].type = type;
    }

    function deleteDiv() {
        $(this).parent().remove();
    }

    function addOption(optionValue,row_column = null) {
        selectQTypePanel = selectQ.className.split(" ")[2] + "-panel";
        
        var $ansDivClone = $("#" + selectQTypePanel).find("#answer-div").clone(true);
        $ansDivClone.find("#option-delete-btn").on("click", deleteDiv);
        if (selectQ.classList.contains("ratingQuest")) {
            if (this.id == "option-add-row-btn" || row_column == "row") {
                $(selectQ).find("#answer-row").append($ansDivClone);
            } else {
                $ansDivClone.find("#answer-option").removeClass();
                $ansDivClone.find("#answer-option").addClass("answer-option-col form-control");
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
        selectQTypePanel = selectQ.className.split(" ")[2] + "-panel";

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
        var $question_image = $(selectQ).find("#question-image")

        $deleteButton.on("click", deleteDiv);
        $optionAddBtn.on("click", addOption);
        $saveButton.on("click", saveQuestion(selectQ));
        $addColBtn.on("click", addOption);
        $addRowBtn.on("click", addOption);
        
        $question_image.on("change",function(){
            var image = document.createElement("img");
            image.src = $(selectQ).find("#question-image").val();
            $(selectQ).find("#image-preview-div").html(image);
        })

    }
    
    function highLightButton(buttonDOM){
        if(selectQbtn != undefined){
            selectQbtn.style.backgroundColor = "";
            selectQbtn.style.color = '#00397d'
            selectQbtn = buttonDOM;
            selectQbtn.style.backgroundColor = "#337ab7";
            selectQbtn.style.color = "white";
        }else{
            selectQbtn = buttonDOM;
            selectQbtn.style.backgroundColor = "#337ab7";
            selectQbtn.style.color = "white";
        }

    }
    
    function addQuestion(question_type){
        var surveySize = checkSurveySize();
        if(surveySize == 1){
            showStatusBar ("Maximum 10 questions","red")
        }else {
            var q = surveyQuestions.length;

            // create question panel
            var newQ = document.createElement("div");
            newQ.id = "question" + (inc);
            inc++
            newQ.className = "question tab-pane ";
            newQ.classList.add(question_type);


            QuestCon.appendChild(newQ);
            surveyQuestions.push({
                "id": newQ.id,
                "type": question_type
            })

            // create question button
            var wrapLi = document.createElement("li");
            var newQBut = document.createElement("a");
            newQBut.href = "javascript:void(0)";
            newQBut.id = "q" + (surveyQuestions.length);
            newQBut.className = "questionBut";
            newQBut.classList.add(question_type);
            newQBut.innerHTML = "Q" + (surveyQuestions.length);

            // Question button LISTENER
            newQBut.addEventListener("click", function () {
                changeQ(newQBut.id);
                highLightButton(this);
            });
            
            highLightButton(newQBut);
            changeQ(newQBut.id);

            wrapLi.appendChild(newQBut)
            questChoose.appendChild(wrapLi);
        }
    }
    
    function removeQuestion(){
        var survey_size = checkSurveySize()
        if(survey_size == -1){
            showStatusBar("Minimum 1 Question")
        }else{
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
                highLightButton(document.getElementById("q" + (b)));
            } else {
                selectQ = document.getElementById(surveyQuestions[b].id);
                changeQ("q" + (b + 1));
                highLightButton(document.getElementById("q" + (b+1)))

            }
        }
    }
    
    function loadSurveyObj(){
        $("#q1").remove();
        $("#question1").remove();
        surveyQuestions.pop();
        surveyTitle.value = global_survey_obj.survey_name;
        surveyTitle.disabled = true;
        inc = 1;
        var row = 0; // record ratiing question row
        console.log("global",global_survey_obj.questions)
        for (var g=0; g< global_survey_obj.questions.length; g++){
            var question = global_survey_obj.questions[g];
            var prev_question = global_survey_obj.questions[g-1];
            
            // if is rating question
            if(question.question_type == "ratingQuest"){
                addQuestion(question.question_type);
                $("#question" + (g+1)).find("#question-image").val(question.questionImage);
                $("#question" + (g+1)).find("#question").val(question.question);
                $("#question" + (g+1)).find("#answer-row #answer-div").remove();
                $("#question" + (g+1)).find("#answer-col #answer-div-2").remove();
                for(var i = 0; i<question.question_column.length;i++){
                    addOption(question.question_column,"row");
                    
                    // insert row value
                    $("#question" + (g+1)).find(".answer-option-row")[i].value = question.question_column[i];
                }
                for(var x=0;x<question.answers.length;x++){
                    addOption(question.answers[x]);
                    
                    // insert col value
                    $("#question" + (g+1)).find(".answer-option-col")[x].value = question.answers[x];
                }
            }else if(question.question_type == "trueFalse"){
                addQuestion(question.question_type);
                $("#question" + (g+1)).find("#question-image").val(question.questionImage);
                $("#question" + (g+1)).find("#question").val(question.question);
            }else{
                console.log((g+1))
                console.log( "question DIV",$("#question" + (g+1)))
                addQuestion(question.question_type);
                $("#question" + (g+1)).find("#question-image").val(question.questionImage);
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
        createBtn.parentNode.remove();
        // create a button to DELETE survey and CREATE a new one;
        var done_btn = document.createElement("button");
        done_btn.id = "done-btn";
        done_btn.className = "btn btn-info"
        done_btn.innerHTML = "Done";
        done_btn.addEventListener("click",function(){
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
                console.log(surveyQuestions);
                $.ajax({
                    url: "/modifySurvey",
                    type: "post",
                    data: {
                        name: surveyTitle,
                        questions: surveyQuestions
                    },
                    success: function (resp) {
                        if(resp.status == 'success'){
                            showStatusBar(resp.survey_name + ' survey modified');
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
        });
        var wrapDiv = document.createElement("div");
        wrapDiv.className = "panel-body";
        wrapDiv.appendChild(done_btn);
        $("#main-panel").append(wrapDiv);
    }

    addQ.addEventListener("click", function(){addQuestion("multChoice")});
    remQ.addEventListener("click", removeQuestion)
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
    });
})