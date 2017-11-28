var email = document.getElementById('email1');
var password_reset_but = document.getElementById('password-reset');
var recover_code = document.getElementById('recover-code');
var pass_recovery_but = document.getElementById('pass-recovery');
var new_pass = document.getElementById("new-pass");
var confirm_pass = document.getElementById("confirm-pass");
const swal = require('sweetalert2');

$(document).ready(function(){
	console.log('PASSWORD RECOVERY PAGE');
    //login but on click does the following
	
	password_reset_but.addEventListener("click", function(){
		var myEmail = email.value
		$.ajax({
			url: "/pass-reset",
			type:"post",
			data:{
				email: myEmail,
			},
			success:function(resp){
				if(resp.status == "success"){
					swal(
						  'Good job!',
						  'You clicked the button!',
						  'success'
					)
					//alert("If your email address exists in our database you will receive a password recovery code at your email address.");
					email.style.disabled = true;
				}else {
					alert("Error");
				}
			}
		})
	});
	

	
	pass_recovery_but.addEventListener("click", function(){
		console.log(recover_code);
		if (new_pass.value == confirm_pass.value){
			console.log("yes")
			$.ajax({
				url: "/pass_recovery_url",
				type:"post",
				data:{
					email: email.value,
					passcode: recover_code.value,
					password: confirm_pass.value
				},
				success:function(resp){
					if(resp.status == "success"){
						alert("Your password has been changed");
						location.href = "/";
					}
					else{
						alert("Something went wrong");
					}
				}
			})
		} else {
			console.log('passwords do not match');
		}
	});

});