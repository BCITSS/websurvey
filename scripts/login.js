const swal = require('sweetalert2')
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
                    
					swal({
					  title: 'Success Login!',
					  text: 'Logging you in...',
					  timer: 5000,
					  onOpen: function (){
						swal.showLoading()
					  }
						
					})
					location.reload();
                } else {
					swal(
					  'Unsuccessful Login',
					  'Username and/or password is incorrect.',
					  'error'
					)
                }
                
            }
        })
    });
    
     
    document.addEventListener("keydown",function(event){
        if(event.which == 13){
            loginBut.click();
        }
    })
    
})