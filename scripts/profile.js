import swal from 'sweetalert2';
$(document).ready(function(){

    const swal = require('sweetalert2');

	console.log('PROFILE')
	var username = document.getElementById("username");
    var email = document.getElementById("email");
    var pass = document.getElementById("password1");
    var passCon = document.getElementById("password2");
    var subBut = document.getElementById("submit");
    var canBut = document.getElementById("cancel");
    
    $.ajax({
        url:"/getUser",
        type:"post",
        success:function(resp){
            console.log(resp);
            username.value = resp.username;
            email.value = resp.email;
        }
    })
    
    subBut.addEventListener("click",function(){
        if(!pass.value == "" || !passCon.value == ""){
            if(pass.value == passCon.value){
            $.ajax({
            url:"/updateUserP",
            type:"post",
                data: {
                    email: email.value,
                    pass: pass.value
                },
            success:function(resp){
                console.log(resp);
                if(resp.status == "success"){
                swal('Account updated',
                    'Your password and/or email has been changed',
                    'success');
                }else {
                    swal('Account not updated',
                    'Your password and/or email has not been changed',
                    'error');
                }
            }
            })
        }
            else {
                swal('Account not updated',
                    'your passwords do not match',
                    'error');
            }
    }
        else {
            $.ajax({
            url:"/updateUser",
            type:"post",
                data: {
                    email: email.value
                },
            success:function(resp){
                console.log(resp);
                if(resp.status == "success"){
                swal('Account updated',
                    'Your email has been changed',
                    'success');
                }else {
                    swal('Account not updated',
                    'Your password and/or email has not been changed',
                    'error');
                }
            }
            })
        }
    })
});