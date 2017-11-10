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

function loadSurveyObj(survey_obj){
    //document.getElementById("survey-title").value = "yes";
    
    
}

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
            
            // modify button click event listener
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
                        console.log(resp);
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
                            }
                        });
                    }
                });
            });
            bar.append(modify_action_button);
            
            // --- create survey list table ---
            var table = document.createElement("table");
            table.id = "survey-list-table";
            table.setAttribute('border','1');
            var headTr = document.createElement('tr');
            var tableColumn = ['survey name','description', 'create date', 'publish', 'last update','modify' ]
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
                    var publish = row.insertCell(3);
                    var last_update = row.insertCell(4);
                    var modify = row.insertCell(5);

                    var modify_button = document.createElement('input');
                    modify_button.type = 'radio';
                    modify_button.name = 'modi_btn';
                    modify_button.value = resp[i].id;
                    modify_button.class = 'modify-button';

                    survey_name.innerHTML = resp[i].survey_name;
                    description.innerHTML = resp[i].description;
                    create_date.innerHTML = resp[i].start_date.replace(/T.*$/,"");
                    publish.innerHTML = resp[i].isopen;
                    last_update.innerHTML = resp[i].updated.replace(/T.*$/,"");
                    modify.appendChild(modify_button);
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
            type:"view"
        },
        success:function(resp){
            console.log(resp)
        }
    })
})

