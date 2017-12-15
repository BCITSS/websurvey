$(document).ready(function(){
    var begin = document.getElementById("begin");
    var survey_select_list = document.getElementById("survey_select_list");
    $.ajax({
        url:"/getSurveyList",
        type:"post",
        success: function(resp){
            console.log(resp);
            for (var i=0; i< resp.length;i++){
                var new_option = document.createElement("option");
                new_option.value = resp[i].id
                new_option.innerHTML = resp[i].survey_name;
                
                survey_select_list.appendChild(new_option)
            }
        }
    });
    
    begin.addEventListener("click", function() {
        $.ajax({
            url:"/client",
            type:"post",
            data:{
                type:"modify",
                department_id: 1,
                client: true
            },
            success: function(resp){
                location.href = "/questions";
            }
        });
    });
});