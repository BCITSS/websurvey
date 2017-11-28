$(document).ready(function(){
    // get logined username and department name
   $.ajax({
        url:"/getSession",
        type:"post",
        success:function(resp){
            
            console.log(resp);
            // display username and department name to admin panel (main.html)
            document.getElementById("nav-username").innerHTML = resp.name;
            document.getElementById("pull-right-username").innerHTML = resp.name;
            document.getElementById("pull-right-department").innerHTML = resp.department_name;
            
        }
       
   });
});

if (typeof jQuery === "undefined") {
  throw new Error("BCITSSD requires jQuery");
}

$.mainPage = {};

$.mainPage.options = {
  //Sidebar push menu toggle button selector
  sidebarToggleSelector: "[data-toggle='offcanvas']",
  //Activate sidebar push menu
  sidebarPushMenu: true,
};

/* ------------------
 * - Implementation -
 * ------------------
*/
$(function () {
  //Easy access to options
  var o = $.mainPage.options;

  //Activate the layout maker
  $.mainPage.layout.activate();

  //Enable sidebar tree view controls
  $.mainPage.tree('.sidebar');

  //Activate sidebar push menu
  if (o.sidebarPushMenu) {
    $.mainPage.pushMenu(o.sidebarToggleSelector);
  }
  /*
   * INITIALIZE BUTTON TOGGLE
   * ------------------------
   */
  $('.btn-group[data-toggle="btn-toggle"]').each(function () {
    var group = $(this);
    $(this).find(".btn").click(function (e) {
      group.find(".btn.active").removeClass("active");
      $(this).addClass("active");
      e.preventDefault();
    });

  });
});

/* ----------------------
 * - Functions -
 * ----------------------
*/
$.mainPage.layout = {
  activate: function () {
    var _this = this;
    _this.fix();
    _this.fixSidebar();
    $(window, ".wrapper").resize(function () {
      _this.fix();
      _this.fixSidebar();
    });
  },
  fix: function () {
    //Get window height and the wrapper height
    var neg = $('.main-header').outerHeight() + $('.main-footer').outerHeight();
    var window_height = $(window).height();
    var sidebar_height = $(".sidebar").height();
    //Set the min-height of the content and sidebar based on the
    //the height of the document.
    if ($("body").hasClass("fixed")) {
      $(".content-wrapper, .right-side").css('min-height', window_height - $('.main-footer').outerHeight());
    } else {
      if (window_height >= sidebar_height) {
        $(".content-wrapper, .right-side").css('min-height', window_height - neg);
      } else {
        $(".content-wrapper, .right-side").css('min-height', sidebar_height);
      }
    }
  },
  fixSidebar: function () {
    //Make sure the body tag has the .fixed class
    if (!$("body").hasClass("fixed")) {
      if (typeof $.fn.slimScroll != 'undefined') {
        $(".sidebar").slimScroll({destroy: true}).height("auto");
      }
      return;
    } else if (typeof $.fn.slimScroll == 'undefined' && console) {
      console.error("Error: the fixed layout requires the slimscroll plugin!");
    }
    //Enable slimscroll for fixed layout
    if ($.mainPage.options.sidebarSlimScroll) {
      if (typeof $.fn.slimScroll != 'undefined') {
        //Distroy if it exists
        $(".sidebar").slimScroll({destroy: true}).height("auto");
        //Add slimscroll
        $(".sidebar").slimscroll({
          height: ($(window).height() - $(".main-header").height()) + "px",
          color: "rgba(0,0,0,0.2)",
          size: "3px"
        });
      }
    }
  }
};

/* PushMenu()
 * ==========
 */
$.mainPage.pushMenu = function (toggleBtn) {
  //Enable sidebar toggle
  $(toggleBtn).click(function (e) {
    e.preventDefault();
    //Enable sidebar push menu
    $("body").toggleClass('sidebar-collapse');
    $("body").toggleClass('sidebar-open');
  });
  $(".content-wrapper").click(function () {
    //Enable hide menu when clicking on the content-wrapper on small screens    
    if ($(window).width() <= 767 && $("body").hasClass("sidebar-open")) {
      $("body").removeClass('sidebar-open');
    }
  });

};

/* Tree()
 * ======
 * Converts the sidebar into a multilevel
 * tree view menu.
 */
$.mainPage.tree = function (menu) {
  $("li a", $(menu)).click(function (e) {
    //Get the clicked link and the next element
    var $this = $(this);
    var checkElement = $this.next();

    //Check if the next element is a menu and is visible
    if ((checkElement.is('.treeview-menu')) && (checkElement.is(':visible'))) {
      //Close the menu
      checkElement.slideUp('normal', function () {
        checkElement.removeClass('menu-open');
      });
      checkElement.parent("li").removeClass("active");
    }
    //If the menu is not visible
    else if ((checkElement.is('.treeview-menu')) && (!checkElement.is(':visible'))) {
      //Get the parent menu
      var parent = $this.parents('ul').first();
      //Close all open menus within the parent
      var ul = parent.find('ul:visible').slideUp('normal');
      //Remove the menu-open class from the parent
      ul.removeClass('menu-open');
      //Get the parent li
      var parent_li = $this.parent("li");

      //Open the target menu and add the menu-open class
      checkElement.slideDown('normal', function () {
        //Add the class active to the parent li
        checkElement.addClass('menu-open');
        parent.find('li.active').removeClass('active');
        parent_li.addClass('active');
      });
    }
    //if this isn't a link, prevent the page from being redirected
    if (checkElement.is('.treeview-menu')) {
      e.preventDefault();
    }
  });
};

/* Sidebar Button JS
 * =================
 */

var maincontent = $('#main-content');
var newBtn = $('#new-btn');
var modifyBtn = $('#modify-btn');
var viewBtn = $('#view-btn');
var publishBtn = $("#publish-btn");
var statusBarCloseBtn = document.getElementById("status-bar-close");

// get survey obj from server
function loadSurveyObj(survey_obj){
    global_survey_obj = survey_obj;
    $.ajax({
        url:"/adminPanel",
        type:"post",
        data:{
            type: "create"
        },
        success:function(resp){
        }
    });
}

// get random color
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// convert array for chartjs
function parseSurveyStatus(obj){
    var question_array = [];
    var answer_array = [];
    var answer_count = [];
    for (var key in obj){
        if(obj.hasOwnProperty(key)){
            question_array.push(key);
            var temp_array_1 = [];
            var temp_array_2 = [];
            for (var i =0; i<obj[key].length;i++){
                console.log(obj[key][i]);
                temp_array_1.push(obj[key][i][0]);
                temp_array_2.push(obj[key][i][1]);
            }
            answer_array.push(temp_array_1);
            answer_count.push(temp_array_2);
        } 
    }
    return {
        "question_array":question_array,
        "answer_array":answer_array,
        "answer_count":answer_count
    };
}
// convert resp obj to 2D array
function convert2DArray(obj){
    var twoDarray = [];
    for(var i=0;i<obj.length;i++){
        var temp_array = [];
        temp_array.push(obj[i].question_text);
        temp_array.push(obj[i].answer_option_text);
        twoDarray.push(temp_array);
    }
    return twoDarray;
}

// convert 2D array to CSV
function arrayToCsv(array){
    var csvRow = [];
    for(var i=0; i< array.length;i++){
        csvRow.push(array[i].join(','));
    }
    var csvString = csvRow.join("\r\n");
        
    return csvString; 
}

statusBarCloseBtn.addEventListener("click",function(){
    statusBar.style.display = "none";
})

newBtn.on("click",function(){
    $.ajax({
        url:'/adminPanel',
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
        url:'/adminPanel',
        type:'post',
        data:{
            type:"view"
        },
        success:function(resp){
            console.log(resp);
            // --- create action bar ---
            var bar = document.createElement('div');
            bar.id = 'action_bar';
            
            var modify_action_button = document.createElement('button');
            modify_action_button.innerHTML = 'Modify';
            modify_action_button.class = "mod-action-btn";
            
            var publish_action_button = document.createElement('button');
            publish_action_button.innerHTML = 'Publish';
            publish_action_button.class = "pub-action-btn";
            
            var delete_action_button = document.createElement('button');
            delete_action_button.innerHTML = 'Delete';
            delete_action_button.class = "delete-action-btn";
            
            // Top Modify Button click event listener
            modify_action_button.addEventListener("click",function(){
               var selected_survey = document.querySelector('input[name="modi_btn"]:checked');
                console.log(selected_survey);
                $.ajax({
                    url:"/adminPanel",
                    type:"post",
                    data:{
                        type:"modify",
                        survey_id: selected_survey.value
                    },
                    success: function(resp){
                        console.log("OK?",resp);
                        console.log(resp);
                        if(resp.status == false){
                            showStatusBar(resp.msg,"red");
                        }else{
                            var survey_obj = resp;
                            $.ajax({
                                url:"/adminPanel",
                                type:"post",
                                data:{
                                    type:"create"
                                },
                                success:function(resp){
                                    maincontent.html(resp);
                                    loadSurveyObj(survey_obj);
                                },
                                error:function(e){
                                    console.log(e);
                                }
                            });
                        }
                        
                    }
                });
            });
            bar.append(modify_action_button);
            
            // Top Delete button listner
            publish_action_button.addEventListener("click",function(){
                var selected_survey = document.querySelector('input[name="modi_btn"]:checked');
                console.log(selected_survey);
                $.ajax({
                    url:"/adminPanel",
                    type:"post",
                    data:{
                        type:"publish",
                        survey_id: selected_survey.value
                    },
                    success: function(resp){
                        if(resp.status == false){
                            showStatusBar(resp.msg,"red");
                        }else{
                            showStatusBar("survey "+resp.survey_name+" is publishing")
                        }
                        modifyBtn.click();
                    }
                });
            });
            bar.append(publish_action_button);
            
            delete_action_button.addEventListener("click",function(){
                var selected_survey = document.querySelector('input[name="modi_btn"]:checked');
                console.log(selected_survey);
                $.ajax({
                    url:"/adminPanel",
                    type:"post",
                    data:{
                        type:"delete",
                        survey_id: selected_survey.value
                    },
                    success: function(resp){
                        if(resp.status == "success"){
                            showStatusBar("survey '"+resp.survey_name+"' deleted")
                        }else{
                            showStatusBar(resp.status+" cannot delete publishing survey","red");
                        }
                        modifyBtn.click();
                    }
                });
            })
            bar.append(delete_action_button);
            
            // --- create survey list table ---
            var table = document.createElement("table");
            table.className += "survey-list-table";
            table.id = "survey-list-table";
            table.setAttribute('border','1');
            var headTr = document.createElement('tr');
            var tableColumn = ['survey name','description', 'create date', 'last update','current publishing','been published' ,'select' ]
            tableColumn.forEach(function(Element){
                var th = document.createElement('th');
                th.innerHTML = Element;
                headTr.appendChild(th);
            });
            table.appendChild(headTr);
            
            console.log(resp);
            console.log(resp.length);
            if(resp.status == "No survey" ){
                var new_div = document.createElement('div');
                new_div.id = "content-div";
                new_div.innerHTML = resp.message;
                maincontent.html(new_div);
            }else{
                for(var i=0;i<resp.length;i++){
                    var row = table.insertRow(i+1);
                    var survey_name = row.insertCell(0);
                    var description = row.insertCell(1);
                    var create_date = row.insertCell(2);
                    var last_update = row.insertCell(3);
                    var publish = row.insertCell(4);
                    var been_pub = row.insertCell(5)
                    var modify = row.insertCell(6);

                    var modify_button = document.createElement('input');
                    modify_button.type = 'radio';
                    modify_button.name = 'modi_btn';
                    modify_button.value = resp[i].id;
                    modify_button.class = 'modify-button';

                    survey_name.innerHTML = resp[i].survey_name;
                    description.innerHTML = resp[i].description;
                    create_date.innerHTML = resp[i].start_date.replace(/T.*$/,"");
                    // change color of  the cell if isopen equal to true
                    var open_var;
                    if(resp[i].isopen){
                        publish.style.backgroundColor = "#c4ffad";
                        openvar = "Yes";
                    }else{
                        openvar = "No";
                    }
                    publish.innerHTML = openvar;
                    last_update.innerHTML = resp[i].updated.replace(/T.*$/,"");
                    modify.appendChild(modify_button);
                    
                    // change color of  the cell if been_published equal to true
                    var published_var;
                    if(resp[i].been_published){
                        been_pub.style.backgroundColor = "#c4ffad";
                        published_var = "Yes"
                    }else{
                        published_var = "No"
                    }
                    
                    // background color of modify cell indicate if can modify
                    console.log(resp[i])
                    if(resp[i].isopen){
                        modify.style.backgroundColor = "#ffadad";
                        modify_button.remove();
                    }
                    been_pub.innerHTML = published_var;
                }
                maincontent.html('');
                maincontent.append(bar);
                maincontent.append(table);
            }
        }
    });
});

viewBtn.on("click",function(){
    $.ajax({
        url:'/adminPanel',
        type:'post',
        data:{
            type:"view_status"
        },
        success:function(resp){
            console.log(resp);
            if(resp.survey_result == "no result"){
                maincontent.innerHTML = "No Survey";
            }else{
                var table = document.createElement("table");
                table.className += "survey-list-table";
                table.id = "survey-view";
                table.setAttribute('border','1');
                var headTr = document.createElement('tr');
                var tableColumn = ['survey name','description', 'create date', 'publish', 'last update','Total Response','CSV' ]
                tableColumn.forEach(function(Element){
                    var th = document.createElement('th');
                    th.innerHTML = Element;
                    headTr.appendChild(th);
                });
                table.appendChild(headTr);
                
                for(var i=0;i<resp.length;i++){
                    var row = table.insertRow(i+1);
                    var survey_name = row.insertCell(0);
                    var description = row.insertCell(1);
                    var create_date = row.insertCell(2);
                    var publish = row.insertCell(3);
                    var last_update = row.insertCell(4);
                    var total_resp = row.insertCell(5);
                    var csv_field = row.insertCell(6);
                    
                    // --- Total response btn --- //
                    var total_resp_btn = document.createElement('button');
                    total_resp_btn.value = resp[i].count;
                    total_resp_btn.innerHTML = resp[i].count;
                    total_resp_btn.id = resp[i].id;
                    total_resp_btn.className = 'total-resp-btn';
                    total_resp_btn.addEventListener("click",function(){
                        $.ajax({
                            url:"/viewSurvey",
                            type:"post",
                            data:{
                                survey_id:this.id
                            },
                            success:function(resp){
                                if(resp == "no result"){
                                    maincontent.html("no result to show");
                                }else{
                                    console.log(resp);
                                    var new_format_array = parseSurveyStatus(resp);
                                    
                                    console.log(new_format_array);
                                    
                                    // create main div
                                    var new_div = document.createElement('div');
                                    new_div.id = "main-div";
                                    new_div.style.position = "absolute";
                                    new_div.style.top = "50%";
                                    new_div.style.left = "50%";
                                    new_div.style.width = "50%";
                                    new_div.style.minWidth = "500px";
                                    new_div.style.overflowX = "hidden";
                                    new_div.style.height = "90%";
                                    new_div.style.zIndex = "100000";
                                    new_div.style.transform = "translate(-50%,-50%)";
                                    new_div.style.border = '1px solid black';
                                    new_div.style.backgroundColor = "white";
                                    
                                    // create div title
                                    var div_title = document.createElement("p");
                                    div_title.id = "status-title";
                                    div_title.innerHTML = "Question Response Status";
                                    
                                    new_div.append(div_title);
                                    
                                    // generate close button
                                    var close_btn = document.createElement('button');
                                    close_btn.id = "close-btn";
                                    close_btn.innerHTML = "x";
                                    close_btn.style.top="0px";
                                    close_btn.style.right= "0px";
                                    close_btn.style.position= "absolute";
                                    close_btn.style.backgroundColor="red"; 
                                    close_btn.style.zIndex = "100";
                                    close_btn.addEventListener("click",function(){
                                        this.parentElement.remove();
                                    });
                                    new_div.append(close_btn);
                                    
                                    // create chart div
                                    var chart_div = document.createElement('div');
                                    chart_div.style.width = "50%";
                                    new_div.append(chart_div);
                                    
                                    // create table div
                                    var table_div = document.createElement('div');
                                    chart_div.style.width = "50%";
                                    table_div.style.backgroundColor="blue";
                                    table_div.style.display = "inline-block";
                                    table_div.style.width = "50%";
                                    table_div.style.height= "100%";
                                    table_div.style.position = "absolute";
                                    table_div.style.right = '0px';
                                    table_div.style.top = '13px';
                                    new_div.append(table_div);
                                    
                                    // genertate charts
                                    for(var i=0; i<new_format_array.question_array.length;i++ ){
                                        var new_canvas = document.createElement("canvas");
                                        new_canvas.class= "answer-pie-chart";
                                        new_canvas.width = "100";
                                        new_canvas.height = "100";
                                        new_canvas.getContext("2d");
                                        chart_div.append(new_canvas);
                                        
                                        //generate random color list
                                        var chart_color_array = [];
                                        
                                        for(var y =0;y<new_format_array.answer_array[i].length;y++){
                                            chart_color_array.push(getRandomColor());
                                        }
                                        
                                        
                                        var my_chart = new Chart(new_canvas,{
                                            type:'doughnut',
                                           data:{
                                               labels: new_format_array.answer_array[i],
                                               data:new_format_array.answer_count[i],
                                               datasets:[{
                                                   backgroundColor: chart_color_array,
                                                   data:new_format_array.answer_count[i],
                                                   borderWidth: 1,
                                               }]

                                           },
                                           options: {
                                               legend:{
                                                   display:true,
                                                   position:"top",
                                                   labels:{
                                                       fontSize:15,
                                                       boxWidth: 20
                                                   },
                                                   
                                               },
                                               title:{
                                                 display:true,
                                                    text: "Question "+(i+1)+": "+new_format_array.question_array[i],
                                                    fontSize:20
                                               },
                                               

                                            }
                                        });
                                    }
                                    maincontent.append(new_div);
                                }
                            }
                        });
                    })
                    // --- CSV download button
                    var csv_download_btn = document.createElement('button');
                    csv_download_btn.innerHTML = "Download";
                    csv_download_btn.id = resp[i].id;
                    csv_download_btn.value = resp[i].survey_name
                    csv_download_btn.className = 'csv-download-btn';
                    
                    csv_download_btn.addEventListener("click",function(){
                        var survey_name = this.value;
                        $.ajax({
                            url:"/getSurveyData",
                            type:"post",
                            data:{
                                survey_id:this.id
                            },
                            success:function(resp){
                                console.log(resp);
                                var resp_2D_array = convert2DArray(resp);
                                console.log(convert2DArray(resp));
                                arrayToCsv(resp_2D_array);
                                console.log(arrayToCsv(resp_2D_array));
                                var csvString = arrayToCsv(resp_2D_array);
                                
                                var a = document.createElement('a');
                                a.href = 'data:attachment/csv,' + csvString;
                                a.target = '_blank';
                                a.download = survey_name + '.csv';
                                a.click();
                            }
                        })
                    });
                    
                    survey_name.innerHTML = resp[i].survey_name;
                    description.innerHTML = resp[i].description;
                    create_date.innerHTML = resp[i].start_date.replace(/T.*$/,"");
                    publish.innerHTML = resp[i].isopen;
                    last_update.innerHTML = resp[i].updated.replace(/T.*$/,"");
                    total_resp.appendChild(total_resp_btn);
                    csv_field.appendChild(csv_download_btn);
                }
                maincontent.html('');
                maincontent.append(table);
                
            }
        }
    })
});

