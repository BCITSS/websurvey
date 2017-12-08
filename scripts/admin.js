import swal from 'sweetalert2';
$(document).ready(function(){

	   $.ajax({
        url:"/getSession",
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
    const swal = require('sweetalert2');
	var addEmployeeButton = document.getElementById("add-btn");
	var removeEmployeeButton = document.getElementById("remove-btn");
	var editEmployeeButton = document.getElementById("modify-btn");
	var addEmployeeDiv = document.getElementById("addEmployeeDiv");
	var removeEmployeeDiv = document.getElementById("removeEmployeeDiv");
	var editEmployeeDiv = document.getElementById("editEmployeeDiv");
	var addEmployeeNameInput = document.getElementById('addEmployeeNameInput');
	var addEmployeePasswordInput = document.getElementById('addEmployeePasswordInput');
	var addEmployeeEmailInput = document.getElementById('addEmployeeEmailInput');
	var selectDepartmentList = document.getElementById('selectDepartmentList');
	var editEmployeeNameInput = document.getElementById('editEmployeeNameInput');
	var editEmployeePasswordInput = document.getElementById('editEmployeePasswordInput');
    var editEmployeePasswordConfirmInput = document.getElementById('editEmployeePasswordConfirmInput');
	var editEmployeeEmailInput = document.getElementById('editEmployeeEmailInput');
	var editEmployeeDepartmentList = document.getElementById('selectDepartmentList');
    var addDepDiv = document.getElementById("addDepartmentDiv");
    var addDepBut = document.getElementById("dep-btn");
    var addDepSave = document.getElementById("addDepartmentSave");
    var addDepInput = document.getElementById("addDepartmentNameInput");
    var departments = {}
    var editDepList = document.getElementById("editEmployeeDepartmentList");
    
	$.ajax({
        url:"/getSession",
        type:"post",
        success:function(resp){
            
            console.log(resp);
            // display username and department name to admin panel (main.html)
            document.getElementById("nav-username").innerHTML = resp.name;
            document.getElementById("pull-right-username").innerHTML = resp.name;
            document.getElementById("pull-right-department").innerHTML = resp.department_name;
            addEmployeeDiv.style.display = "block";
            removeEmployeeDiv.style.display = "none";
            editEmployeeDiv.style.display = "none";
            addDepDiv.style.display = "none";
            
        }
       
    });
    
    function depList(){
      $.ajax({
        url:"/getDepList",
        type:"post",
        success:function(resp){
                console.log(resp)
                resp.departments.forEach(function(department) {
                    departments[department["department_name"]] = department["id"];
                });
                Object.keys(departments).forEach(function(key) {
                    console.log(key, departments[key]);
                    var dep = document.createElement("option");
                        dep.innerHTML = key;
                        dep.value = departments[key];
                    var dep2 = document.createElement("option");
                        dep2.innerHTML = key;
                        dep2.value = departments[key];
                        editDepList.appendChild(dep);
                        selectDepartmentList.append(dep2);
                })
            }
        })  
    }
    depList();

	var regExNames = /^[a-zA-Z ]{3,50}/;
	var regExEmail = /^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$/;
	var regExPassword = /^[a-zA-Z0-9!@#$%^&*]{8,30}/;
	
	function regExTest(regEx, input){
    if(regEx.test(input)){
        return true;
    }
    return false;
	}
    
    addDepBut.addEventListener("click",function(){
        addDepDiv.style.display = "block";
        addEmployeeDiv.style.display = "none";
		removeEmployeeDiv.style.display = "none";
		editEmployeeDiv.style.display = "none";
    })
    
    addDepSave.addEventListener("click",function(){
        if(regExTest(regExNames,addDepInput.value)){
            $.ajax({
                url:"/add-department",
                type:"post",
                data:{
                    department:addDepInput.value
                },
                success:function(resp){
                    if(resp.status == "success"){
                        swal('New Department',
                    'The new department has been added',
                    'success');
                        editDepList.innerHTML= "";
                        editEmployeeDepartmentList.innerHTML = "";
                        depList();
                    }
                    else {
                        swal('Department not added',
                    'The department has not been added to the database',
                    'error');
                    }
                }
            })
        }
    })
    
    console.log("ADMIN");
	addEmployeeButton.addEventListener("click", function(){
		addEmployeeDiv.style.display = "block";
		removeEmployeeDiv.style.display = "none";
		editEmployeeDiv.style.display = "none";
        addDepDiv.style.display = "none";

	});

	removeEmployeeButton.addEventListener("click", function(){
        addDepDiv.style.display = "none";
		addEmployeeDiv.style.display = "none";
		removeEmployeeDiv.style.display = "block";
		editEmployeeDiv.style.display = "none";
		removeEmployeeList.innerHTML = "";

	$.ajax({
			url:"/get-employees",
			type:"post",
			success:function(resp){
				if(resp.status == "success"){
					console.log(resp.names);
					var employees = resp.names;

					for(var i=0;i<employees.length;i++){
						var employeeName = document.createElement("option");
						employeeName.value = employees[i].name;
						employeeName.textContent = employees[i].name;
						removeEmployeeList.appendChild(employeeName);
					}
				}
			}
		})
	});

	editEmployeeButton.addEventListener("click", function(){
		addEmployeeDiv.style.display = "none";
		removeEmployeeDiv.style.display = "none";
        addDepDiv.style.display = "none";
		editEmployeeDiv.style.display = "block";

		editEmployeeList.innerHTML = "";
		//ajax to the server, get the employee names and display it to the dropdown list
		$.ajax({
			url:"/get-employees",
			type:"post",
			success:function(resp){
				if(resp.status == "success"){
					console.log(resp.names);
					var employees = resp.names;

					var chooseEmployee = document.createElement("option");
					chooseEmployee.value = "choose";
					chooseEmployee.textContent = "Choose employee";
					editEmployeeList.appendChild(chooseEmployee);

					editEmployeePasswordInput.value = "";

					for(var i=0;i<employees.length;i++){
						var employeeName = document.createElement("option");
						employeeName.value = employees[i].name;
						employeeName.textContent = employees[i].name;
						editEmployeeList.appendChild(employeeName);
					}
				}
			}
		})

	});

	addEmployeeNameInput.onkeyup = function(){
		if(!regExTest(regExNames, addEmployeeNameInput.value)){
			addEmployeeNameInput.style.backgroundColor = '#F5A9A9'
		}else{
			addEmployeeNameInput.style.backgroundColor = '#FFFFFF'
		}
	}

	addEmployeeEmailInput.onkeyup = function(){
		if(!regExTest(regExEmail, addEmployeeEmailInput.value)){
			addEmployeeEmailInput.style.backgroundColor = '#F5A9A9'
		}else{
			addEmployeeEmailInput.style.backgroundColor = '#FFFFFF'
		}
	}


	addEmployeePasswordInput.onkeyup = function(){
		if(!regExTest(regExPassword, addEmployeePasswordInput.value)){
			addEmployeePasswordInput.style.backgroundColor = '#F5A9A9'
		}else{
			addEmployeePasswordInput.style.backgroundColor = '#FFFFFF'
		}
	}


	addEmployeeSave.addEventListener("click", function(){

		if(!regExTest(regExNames, addEmployeeNameInput.value)||!regExTest(regExEmail, addEmployeeEmailInput.value)||!regExTest(regExPassword, addEmployeePasswordInput.value)){
			$("#addEmployeeFailed").show().delay(3000).fadeOut();
		} else {
			$.ajax({
				url: "/add-employee",
				type: "post",
				data: {
					name: addEmployeeNameInput.value,
					departmentId: selectDepartmentList.value,
					email: addEmployeeEmailInput.value,
					password: addEmployeePasswordInput.value,
					type: "create"
				},
				success: function (resp) {
					console.log(resp);
					if(resp.status == "Success"){
						$("#addEmployeeSuccess").show().delay(3000).fadeOut();
						addEmployeeNameInput.value = "";
						addEmployeeIdInput.value = "";
						addEmployeePasswordInput.value = "";
					} else if(resp.status == "Failed"){
						$("#addEmployeeExists").show().delay(3000).fadeOut();
					}
				}
			})
		}
	});

	removeEmployeeSave.addEventListener("click", function(){
		$.ajax({
			url:"/remove-employee",
			type:"post",
			data:{
				name: removeEmployeeList.value,
				type: "remove"
			},
			success:function(resp){
				console.log(resp);
				removeEmployeeList.remove(removeEmployeeList.selectedIndex);
				$('#removeEmployeeModal').hide();
				$('.modal-backdrop').hide();
				$("#removeEmployeeSuccess").show().delay(3000).fadeOut();
			}
		})
	});

	editEmployeeEmailInput.onkeyup = function(){
		if(!regExTest(regExEmail, editEmployeeEmailInput.value)){
			editEmployeeEmailInput.style.backgroundColor = '#F5A9A9'
		}else{
			editEmployeeEmailInput.style.backgroundColor = '#FFFFFF'
		}
	}


	editEmployeePasswordInput.onkeyup = function(){
		if(!regExTest(regExPassword, editEmployeePasswordInput.value)){
			editEmployeePasswordInput.style.backgroundColor = '#F5A9A9'
		}else{
			editEmployeePasswordInput.style.backgroundColor = '#FFFFFF'
		}
	}

	editEmployeeList.addEventListener("change", function () {
		$.ajax({
			url:"/edit-employee",
			type:"post",
			data:{
				employee_name: editEmployeeList.value,
				type: "select"
			},
			success:function(resp){
				console.log(resp)
				if(resp.status == "success"){
					var employee = resp.user;
					
					editEmployeeEmailInput.value = employee.email;
					editDepList.value = employee.department_id;
					editEmployeePasswordInput.value = "";

				}
				else if(editEmployeeList.value == "choose"){
						editEmployeeEmailInput.value = "";
						editEmployeePasswordInput.value = "";
					}
				else{
					console.log("Could not find employee in database")
				}
			}
		})
	});

	editEmployeeSave.addEventListener("click", function(){
        if(editEmployeePasswordConfirmInput.value == "" && editEmployeePasswordInput.value ==""){
            if(!regExTest(regExEmail, editEmployeeEmailInput.value)){
			$("#editEmployeeFailed").show().delay(3000).fadeOut();
		} else {
			$.ajax({
				url: "/edit-employee",
				type: "post",
				data: {
					employee_name: editEmployeeList.value,
					employee_Email: editEmployeeEmailInput.value,
					emp_dep: editEmployeeDepartmentList.value,
					type: "edit"
				},
				success: function (resp) {
					console.log(resp);
					if(resp.status == "success"){
						$("#editEmployeeSuccess").show().delay(3000).fadeOut();
						editEmployeeList.value = "choose"
						editEmployeeEmailInput.value = "";
						editEmployeePasswordInput.value = "";
					} else if(resp.status == "Failed"){
						$("#editEmployeeExists").show().delay(3000).fadeOut();
					}
				}
			})
		}
        }
        else {
            if(editEmployeePasswordConfirmInput.value == editEmployeePasswordInput.value){
                if(!regExTest(regExEmail, editEmployeeEmailInput.value)||!regExTest(regExPassword, editEmployeePasswordInput.value)){
                $("#editEmployeeFailed").show().delay(3000).fadeOut();
                } else {
                    $.ajax({
                        url: "/edit-employee",
                        type: "post",
                        data: {
                            employee_name: editEmployeeList.value,
                            employee_Email: editEmployeeEmailInput.value,
                            emp_dep: editEmployeeDepartmentList.value,
                            pass: editEmployeePasswordInput.value,
                            type: "editP"
                        },
                        success: function (resp) {
                            console.log(resp);
                            if(resp.status == "success"){
                                $("#editEmployeeSuccess").show().delay(3000).fadeOut();
                                editEmployeeList.value = "choose"
                                editEmployeeEmailInput.value = "";
                                editEmployeePasswordInput.value = "";
                            } else if(resp.status == "Failed"){
                                $("#editEmployeeExists").show().delay(3000).fadeOut();
                            }
                        }
                    })
                }
            }
            else {
                swal('Account not updated',
                    'Your passwords do not match, please make sure if you intend to change the password that they match.',
                    'error');
            }
        }
    });

});