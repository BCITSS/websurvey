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
    var imgBut = document.getElementById("imgBut");
    var backBut = document.getElementById("back");
    

    backBut.addEventListener("click",function(){
        location.href = "/main"
    })
    
    $('#uploadForm').submit(function() {
        $("#status").empty().text("File is uploading...");
        var $form = $(event.target);
        $form.ajaxSubmit({
            url:$form.attr('action'),
            error: function(xhr) {
                status('Error: ' + xhr.status);
            },

            success: function(response) {
                $("#status").empty().text(response);
                console.log(response);
            }
    });
        //Very important line, it disable the page refresh.
    return false;
    }); 
    $.ajax({
        url:"/getUser",
        type:"post",
        success:function(resp){
            
            console.log(resp);
            // display username and department name to admin panel (main.html)
			//default add employee div will be showing
            document.getElementById("nav-username").innerHTML = resp.name;
            document.getElementById("pull-right-username").innerHTML = resp.name;
            document.getElementById("pull-right-department").innerHTML = resp.department_name;
			addEmployeeDiv.style.display = "block";
			removeEmployeeDiv.style.display = "none";
			editEmployeeDiv.style.display = "none";
            
        }
           });
    
    
    
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