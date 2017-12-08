var email = document.getElementById('email1');
var password_reset_but = document.getElementById('password-reset');
var recover_code = document.getElementById('recover-code');
var pass_recovery_but = document.getElementById('pass-recovery');
var new_pass = document.getElementById("new-pass");
var confirm_pass = document.getElementById("confirm-pass");

var pass_rec_div = document.getElementById("pass_rec_div")
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
						  'Success!',
						  'If your email address exists in our database you will receive a password recovery code at your email address.',
						  'success'
					)
					email.style.disabled = true;
					password_reset_but.disabled = true;
					password_reset_but.style.display = 'none';
					pass_rec_div.style.display = 'none';
					
					document.getElementById('pass_confirm_div').style.display = "inline-block";
				}else {
					swal(
					  'Error',
					  'Email not found!',
					  'error'
					)
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
						swal(
						  'Success!',
						  'Your password has been changed',
						  'success'
						)
						location.href = "/login";
					}
					else{
						swal(
						  'Error',
						  'Password not changed',
						  'error'
						)
					}
				}
			})
		} else {
			console.log('passwords do not match');
			swal(
				  'Error',
				  'Passwords do not match',
				  'error'
			)
		}
	});

});