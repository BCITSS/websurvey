$(document).ready(function(){
    var begin = document.getElementById("begin");
    
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