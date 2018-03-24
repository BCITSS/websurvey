$(document).ready(function(){
    var begin = document.getElementById("begin");
    var survey_select_list = document.getElementById("survey_select_list");
    $.ajax({
        url:"/getSurveyList",
        type:"post",
        success: function(resp){
            console.log(resp);
            if(resp == "no survey live"){
                console.log("no survey live");
            }else{
                for (var i=0; i< resp.length;i++){
                    var new_option = document.createElement("option");
                    new_option.value = resp[i].id
                    new_option.innerHTML = resp[i].survey_name;
                    survey_select_list.appendChild(new_option)
                }
            }
        }
    });
    
    $.ajax({
        url:"/getClientSurveyId",
        type:"post",
        success: function(resp){
            console.log("ID",resp);
            if(!resp == "" || !resp == null){
                survey_select_list.value = resp;
            }
        }
    });
    
    
    
    begin.addEventListener("click", function() {
        $.ajax({
            url:"/client",
            type:"post",
            data:{
                type:"modify",
                survey_id: survey_select_list.value,
                client: true,
                setsession:true
            },
            success: function(resp){
                location.href = "/questions";
            }
        });
    });
});