import 'jquery-datetimepicker/build/jquery.datetimepicker.full.min.js';
$(document).ready(function(){
    var maincontent =  $("#main-content2");
    var page_changer = document.getElementById("page-changer")
    var modify_action_button = document.getElementById("mod-action-btn");
    var publish_action_button = document.getElementById("pub-action-btn");
    var delete_action_button = document.getElementById("delete-action-btn");
    var bar = document.getElementById("action_bar");
    var modifyBtn = document.getElementById("modify-btn");
    var loaded_array;
    var user_display_number = 10;
    var current_page = 1;
    var current_table;
    var current_page_number = document.getElementById("current-page-number");
    var search_input = document.getElementById("search-input");
    var table;
    var publish_fire_btn = document.getElementById("publish-fire-btn")
    var start_date_input = document.getElementById("start_date_input");
    var end_date_input = document.getElementById("end_date_input");
    
    // convert time
    function timeConvert(time){
        var date_obj = new Date(time);
        var date = date_obj.toLocaleDateString();
        var time  =date_obj.toLocaleTimeString();
        return date+" "+time
    }
    
    // sort array
    function sortArray(array,type,inverse = false){
        console.log(inverse);
        if(inverse == true){
            array.sort(function(a,b){
                if(a[type] < b[type] ){
                    return 1
                }
                if(a[type] > b[type]){
                    return -1
                }
                return 0;
            }),
            console.log(array);
            
        }else if(inverse == false){
            array.sort(function(a,b){
                if(a[type] < b[type] ){
                    return -1
                }
                if(a[type] > b[type]){
                    return 1
                }
                return 0;
            }),
            console.log(array);
        }
        createTable(array,1,10)
        
    }
    
    // search arry
    function searchArray(search_array,search_value,type){
        var matched_index = []
        var matched_obj_array = []
        var regEx = new RegExp('('+search_value+')','gm');
        for(var i=0; i<search_array.length;i++){
            if(regEx.test(search_array[i][type])==true){
               matched_index.push(i)
                console.log("Click")
            }
        }
        console.log(matched_index);
        for(var x=0;x<matched_index.length;x++){
            matched_obj_array.push(loaded_array[matched_index[x]]);
        }
        appendRows(matched_obj_array,table,1,10);
    }
    
    // load survey to Editor
    function loadSurveyObj(survey_obj){
        // assign top level variable with survey_obj
        global_survey_obj = survey_obj;
        // get editor
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
    
    // create page button
    function createPager(resp,display_number,table){
        if(resp.length>display_number){
            var total_page = Math.ceil((resp.length/display_number))
            for(var p=0;p<total_page;p++){
                var new_li = document.createElement("li")
                new_li.className = "page-item"
                page_changer.insertBefore(new_li,page_changer.children[page_changer.children.length-1])
                
                var new_a = document.createElement("a")
                new_a.className = "page-link";
                new_a.value = (p+1);
                new_a.href="#";
                new_a.innerHTML = (p+1)
                new_li.appendChild(new_a);
                new_a.addEventListener("click",function(){
                    current_page_number.innerHTML = this.innerHTML;
                   current_page = this.innerHTML
                   appendRows(loaded_array,table,this.value,user_display_number);
                })
            }
        }
    }
    
    // create table for modify
    function createTable (resp){
        console.log("list",resp);
        var table = document.createElement("table");
        table.className = "survey-list-table";
        table.id = "survey-list-table";
        var tHead = document.createElement("thead")
        var headTr = document.createElement('tr');
        var tableColumn = ['ID' ,'Name','Creator', 'Creation Date', 'Last Update','Active','Complete' ,'Start Date','End Date','Select' ]
        var tableColumValue = ["id","survey_name","creator","start_date","updated","isopen","been_published","start_date","end_date","selected"];
        var x = 0
        tableColumn.forEach(function(Element){
            var th = document.createElement('th');
            th.scope="col";
            th.id = tableColumValue[x];
            th.innerHTML = Element;
            th.inverse = true;
            th.init_HTML = Element
            if(Element == "ID"){
                th.innerHTML = Element + " &#8593"
            }
            th.addEventListener("click",function(){
                console.log($("th"))
                $("th").each(function(index){
                    this.innerHTML = this.init_HTML
                })
                this.innerHTML = this.init_HTML
                if(this.inverse == true){
                    this.inverse = false;
                    this.innerHTML = this.innerHTML + " &#8595"
                }else{
                    this.inverse = true;
                    this.innerHTML = this.innerHTML + " &#8593"
                }
                console.log("clicked",this.inverse)
                sortArray(loaded_array,this.id,this.inverse);
                appendRows(loaded_array,table,1,user_display_number)
                
                
            })
            headTr.appendChild(th);
            x++
        });
        tHead.appendChild(headTr);
        table.appendChild(tHead);
        
        return table;
    }
    
    // append row to table
    function appendRows(resp,table,pageNumber=1,display_number){
        $(table).find("tr:gt(0)").remove();
        var start_number = (pageNumber-1)*display_number
        var end_number = pageNumber*display_number
        console.log("start#",start_number);
        console.log("end#",end_number);
        var row_number = 0
        for(var i=start_number;i<end_number && i<resp.length;i++){
            var row = table.insertRow(row_number+1);
            row_number++
            row.scope="row"
            var survey_id = row.insertCell(0);
            var survey_name = row.insertCell(1);
            var creator = row.insertCell(2);
            var create_date = row.insertCell(3);
            var last_update = row.insertCell(4);
            var publish = row.insertCell(5);
            var been_pub = row.insertCell(6)
            var start_date = row.insertCell(7);
            var end_date = row.insertCell(8);
            var modify = row.insertCell(9);


            var modify_button = document.createElement('input');
            modify_button.type = 'radio';
            modify_button.name = 'modi_btn';
            modify_button.value = resp[i].id;
            modify_button.className = 'modify-button';
            
            survey_id.innerHTML = resp[i].id;
            creator.innerHTML = resp[i].creator;
            survey_name.innerHTML = resp[i].survey_name;
            create_date.innerHTML = timeConvert(resp[i].create_date);
            
            // if no start date 
            if(resp[i].start_date==null){
                start_date.innerHTML = "";
            }else{
                start_date.innerHTML = timeConvert(resp[i].start_date);
            }
            
            // if no end date
            if(resp[i].end_date==null){
                end_date.innerHTML = "";
            }else{
                end_date.innerHTML = timeConvert(resp[i].end_date);
            }
            
            // change color of  the cell if isopen equal to true
            var openvar ;
            if(resp[i].isopen){
                publish.style.backgroundColor = "#c4ffad";
                openvar = "Yes";
            }else{
                openvar = "No";
            }
            publish.innerHTML = openvar;
            last_update.innerHTML = timeConvert(resp[i].updated);
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
            if(resp[i].isopen){
                modify.style.backgroundColor = "#ffadad";
                modify_button.remove();
            }
            been_pub.innerHTML = published_var;
        }   
        
    }
    
    // top modify click event listener
    modify_action_button.addEventListener("click",function(){
       var selected_survey = document.querySelector('input[name="modi_btn"]:checked');
        $.ajax({
            url:"/adminPanel",
            type:"post",
            data:{
                type:"modify",
                survey_id: selected_survey.value
            },
            success: function(resp){
                if(resp.status == false){
                    showStatusBar(resp.msg,"red");
                }else{
                    console.log("SB",resp)
                    var survey_obj = resp;
                    $.ajax({
                        url:"/adminPage",
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

    // top publish button listener
    var datetime_picker_toggle = false
    publish_action_button.addEventListener("click",function(){
        // time date picker
        jQuery.datetimepicker.setLocale('en');
        $('#start_date_input').datetimepicker({
            format:'Y-m-d H:i',
            datepicker:true,
            step:5,
        });
        $('#end_date_input').datetimepicker({
            format:'Y-m-d H:i',
            datepicker:true,
            step:5,
        });
        
        // toggle time picker row display
        if(datetime_picker_toggle == false){
            document.getElementById("time_picker_div").style.display = "block";
            datetime_picker_toggle = true;
        }else{
            document.getElementById("time_picker_div").style.display = "none";
            datetime_picker_toggle = false;
        }
    });
    
    // top delete button listner
    delete_action_button.addEventListener("click",function(){
        var selected_survey = document.querySelector('input[name="modi_btn"]:checked');
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
    
    // prev-page listener
    $("#prev-page-btn").on("click",function(){
        if( 1 < current_page){
            current_page--
            current_page_number.innerHTML = current_page;
            appendRows(loaded_array,current_table,current_page,10)
        }
        
    })
    
    // next-page listener
    $("#next-page-btn").on("click",function(){
        if(current_page < page_changer.children.length-2){
            current_page++
            current_page_number.innerHTML = current_page;
            appendRows(loaded_array,current_table,current_page,10)
        }

    })
    
    // seach input keyup listener
    search_input.addEventListener("keyup",function(){
        console.log(search_input.value);
        searchArray(loaded_array,search_input.value,"survey_name")
    })
    
    // publish fire button listener
    publish_fire_btn.addEventListener("click",function(){
        var start_date = start_date_input.value
        var end_date = end_date_input.value
        console.log(start_date,end_date);
        var selected_survey = document.querySelector('input[name="modi_btn"]:checked');
        if(start_date_input.value == "" || end_date_input.value == ""){
            showStatusBar("Please select a Date","red")
        }else if(selected_survey == null){
            showStatusBar("Please select a survey","red")
        }else{
            $.ajax({
                url:"/adminPanel",
                type:"post",
                data:{
                    type:"schedule_publish",
                    start_date:start_date,
                    end_date:end_date,
                    survey_id: selected_survey.value,
                },
                success: function(resp){
                    if(resp.status == false){
                        showStatusBar(resp.msg,"red");
                    }else{
                        showStatusBar(resp.msg,);
//                        showStatusBar("survey "+resp.survey_name+" is publishing")
                    }
                    modifyBtn.click();
                }
            });
        }
    })

    // --- Initilize --- //
    current_page_number.innerHTML = 1;

    $.ajax({
        url:'/adminPanel',
        type:'post',
        data:{
            type:"view"
        },
        success:function(resp){
            console.log("THE RESP",resp);
            // --- create survey list table ---
            if(resp.status == "No survey" ){
                var new_div = document.createElement('div');
                new_div.id = "content-div";
                new_div.innerHTML = resp.message;
                maincontent.html(new_div);
            }else{
                loaded_array = resp;
                table = createTable(resp,1,10)
                current_table = table
                createPager(resp,10,table);
                maincontent.append(table);
                appendRows(loaded_array,table,1,10)
            }
        }
    });
})