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
    
    function createPager(resp,display_number,table){
        if(resp.length>display_number){
            var total_page = Math.ceil((resp.length/display_number))
            for(var p=0;p<total_page;p++){
                var new_li = document.createElement("li")
                new_li.className = "page-item"
                page_changer.insertBefore(new_li,page_changer.children[page_changer.children.length-1])
//                page_changer.appendChild(new_li);
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
    
    function createTable (resp){
        console.log("list",resp);
        var table = document.createElement("table");
        table.className = "survey-list-table";
        table.id = "survey-list-table";
        var tHead = document.createElement("thead")
        var headTr = document.createElement('tr');
        var tableColumn = ['ID' ,'Name','Creator', 'Create Date', 'Last Update','Publishing','Been Published' ,'Select' ]
        var tableColumValue = ["id","survey_name","creator","start_date","updated","isopen","been_published","selected"];
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
    
    function appendRows(resp,table,pageNumber=1,display_number){
        $(table).find("tr:gt(0)").remove();
        start_number = (pageNumber-1)*display_number
        end_number = pageNumber*display_number
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
            var modify = row.insertCell(7);

            var modify_button = document.createElement('input');
            modify_button.type = 'radio';
            modify_button.name = 'modi_btn';
            modify_button.value = resp[i].id;
            modify_button.className = 'modify-button';
            
            survey_id.innerHTML = resp[i].id;
            creator.innerHTML = resp[i].creator;
            survey_name.innerHTML = resp[i].survey_name;
            create_date.innerHTML = timeConvert(resp[i].start_date);
            // change color of  the cell if isopen equal to true
            var open_var;
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
    
    // Top Modify Button click event listener
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

    // Top Delete button listner
    publish_action_button.addEventListener("click",function(){
        var selected_survey = document.querySelector('input[name="modi_btn"]:checked');
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
    
    $("#prev-page-btn").on("click",function(){
        if( 1 < current_page){
            current_page--
            current_page_number.innerHTML = current_page;
            appendRows(loaded_array,current_table,current_page,10)
        }
        
    })
    
    $("#next-page-btn").on("click",function(){
        if(current_page < page_changer.children.length-2){
            current_page++
            current_page_number.innerHTML = current_page;
            appendRows(loaded_array,current_table,current_page,10)
        }

    })
    
    search_input.addEventListener("keyup",function(){
        console.log(search_input.value);
        searchArray(loaded_array,search_input.value,"survey_name")
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
