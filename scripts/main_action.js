$(document).ready(function(){
    // get logined username and department name
    var nav_username = document.getElementById("nav-username");
    var pull_right_username = document.getElementById("pull-right-username")
    var pull_right_department = document.getElementById("pull-right-department")

   $.ajax({
        url:"/getSession",
        type:"post",
        success:function(resp){
            // display username and department name to admin panel (main.html)
            console.log(resp);
            if(resp.status == "success"){
                nav_username.innerHTML = resp.name;
                pull_right_username.innerHTML = resp.name;
                pull_right_department.innerHTML = resp.department_name;
            }else{
                location.href('/login');
            }
            
        }
       
   });
    
});

/* Sidebar Button JS
 * =================
 */
var maincontent = $('#main-content');
var newBtn = $('#new-btn');
var modifyBtn = $('#modify-btn');
var viewBtn = $('#view-btn');
var publishBtn = $("#publish-btn");
var statusBarCloseBtn = document.getElementById("status-bar-close");


statusBarCloseBtn.addEventListener("click",function(){
    statusBar.style.display = "none";
})

newBtn.on("click",function(){
    $.ajax({
        url:'/adminPage',
        type:'post',
        data:{
            type:"create"
        },
        success:function(resp){
            maincontent.html(resp);
        }
    });
   
});

modifyBtn.on("click",function(){
    $.ajax({
        url:'/adminPage',
        type:'post',
        data:{
            type:"modify"
        },
        success:function(resp){
            maincontent.html(resp);
        }
    })
});

viewBtn.on("click",function(){
    $.ajax({
        url:'/adminPage',
        type:'post',
        data:{
            type:"view"
        },
        success:function(resp){
            console.log(resp);
            maincontent.html(resp);
        }
    })
});
