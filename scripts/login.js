var loginBut = document.getElementById("login");

$(document).ready(function(){
    //login but on click does the following
    loginBut.addEventListener("click", function(){
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        $.ajax({
            url:"/login",
            type:"post",
            data:{
                email:email,
                password:password
            },
            success:function(resp){
                if(resp.status =="success") {
                } else {
                   alert("Unsuccessful");
                }
                location.reload();
            }
        })
    });
})