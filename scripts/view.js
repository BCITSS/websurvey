$(document).ready(function(){
    var maincontent =  $("#main-content2");
    var page_changer = document.getElementById("page-changer")
    var modify_action_button = document.getElementById("mod-action-btn");
    var view_info_panel_toggle = false;
    
    var survey_total_card = document.getElementById("survey-total-card")
    var resp_total_card = document.getElementById("resp-total-card")
    var recent_total_card = document.getElementById("recent-total-card")
    var current_publish_card = document.getElementById("current-publish-card")
    
    var total_survey_number = document.getElementById("survey-total-number");
    var resp_total_number = document.getElementById("resp-total-number");
    var recent_resp_number = document.getElementById("recent-resp-number");
    var current_publish_title = document.getElementById("current-publish-title");
    
    var recent_survey_array;
    var all_survey_array;
    
    
    // get random color
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    // convert time
    function timeConvert(time){
        var date_obj = new Date(time);
        var date = date_obj.toLocaleDateString();
        var time  =date_obj.toLocaleTimeString();
        return date+" "+time
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
    function convert2DArray(array){
        var twoDarray = [];
        for(var i=0;i<array.length;i++){
            for(var x=0;x<array[i].response_result.length;x++){
                var temp_array = [];
                temp_array.push(array[i].response_result[x].question_text);
                temp_array.push(array[i].response_result[x].answer_option_text);
                twoDarray.push(temp_array);
            }
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
    // create table
    function createTableWithPage(resp,display_number){
        if(resp.length>display_number){
            var total_page = Math.ceil((resp.length/display_number))
            for(var p=0;p<total_page;p++){
                var new_li = document.createElement("li")
                new_li.className = "page-item"
                page_changer.appendChild(new_li);
                var new_a = document.createElement("a")
                new_a.className = "page-link";
                new_a.value = (p+1);
                new_a.href="#";
                new_a.innerHTML = (p+1)
                new_li.appendChild(new_a);
                new_a.addEventListener("click",function(){
                    createTable(resp,this.value,display_number);
                })
            }
        }
        
    }
    
    function createTable(resp,pageNumber,display_number){
        var table = document.createElement("table");
        table.className += "survey-list-table table table-bordered table-dark table-hover ";
        table.id = "survey-view";
        table.setAttribute('border','1');
        var headTr = document.createElement('tr');
        var tableColumn = ['ID','Name','Creator', 'Create Date', 'Publishing', 'Last Update','Total Responses','CSV' ]
        tableColumn.forEach(function(Element){
            var th = document.createElement('th');
            th.innerHTML = Element;
            headTr.appendChild(th);
        });
        table.appendChild(headTr);
        
        start_number = (pageNumber-1)*display_number
        end_number = pageNumber*display_number
        var row_number = 0
        for(var i=start_number;i<end_number && i<resp.length;i++){
            var row = table.insertRow(row_number+1);
            row_number++
            var survey_id = row.insertCell(0)
            var survey_name = row.insertCell(1);
            var creator = row.insertCell(2);
            var create_date = row.insertCell(3);
            var publish = row.insertCell(4);
            var last_update = row.insertCell(5);
            var total_resp = row.insertCell(6);
            var csv_field = row.insertCell(7);

            // create total button
            var total_resp_btn = createTotalButton(resp,i);
            // CSV download button
            var csv_download_btn = createCSVDownloadButton(resp,i);


            survey_id.innerHTML = resp[i].id;
            survey_name.innerHTML = resp[i].survey_name;
            creator.innerHTML = resp[i].creator;
            create_date.innerHTML = timeConvert(resp[i].start_date);
            publish.innerHTML = resp[i].isopen;
            last_update.innerHTML = timeConvert(resp[i].updated);
            total_resp.appendChild(total_resp_btn);
            csv_field.appendChild(csv_download_btn);
        }
        maincontent.html('');
        maincontent.append(table);
    }
    
    function getResponse(){
        
    }
    
    // create total response button 
    function createTotalButton(resp,i){
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
                        var new_format_array = parseSurveyStatus(resp);

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
        return total_resp_btn;
    }
    
    function createCSVDownloadButton(resp,i){
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

                    arrayToCsv(resp_2D_array);

                    var csvString = arrayToCsv(resp_2D_array);

                    var a = document.createElement('a');
                    a.href = 'data:attachment/csv,' + csvString;
                    a.target = '_blank';
                    a.download = survey_name + '.csv';
                    a.click();
                }
            })
        });
        return csv_download_btn;
    }
    
    function updateInfoCard(obj){
        
        function sumResponse(obj){
            var total_number = 0
            obj.forEach(function(Element){
                total_number += parseInt(Element.count)
            })
            return total_number;
        }
        
        
        function getRecentDate(obj,day_duration){
            var days = day_duration // days to subtract
            var today = new Date();
            
            // get date from substract day_duration
            var new_date = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
            var dd = new_date.getDate();
            var mm = new_date.getMonth()+1;
            var yyyy = new_date.getFullYear()
            
            var date = yyyy+"-"+mm+"-"+dd
            console.log("my date",date)
            
            $.ajax({
                url:'/adminPanel',
                type:'post',
                data:{
                    type:"view_status_with_date",
                    before_date:date
                },
                success:function(resp){
                    var recent_resp_num = sumResponse(resp)
                    recent_resp_number.innerHTML = recent_resp_num
                    recent_survey_array = resp
                }
            })
        }
        
        function findPublishingSurvey(obj){
            console.log(obj)
            var return_survey = null;
            obj.forEach(function(survey){
                console.log(survey.isopen)
                if(survey.isopen == true){
                    return_survey = survey
                }
            })
            return return_survey;
        }
        // update totoal survey card 
        total_survey_number.innerHTML = obj.length
        
        // update total resp card 
        var total_response = sumResponse(obj)
        resp_total_number.innerHTML = total_response
        findPublishingSurvey(obj)
        
        // update current publishing 
        var current_publishing_survey = findPublishingSurvey(obj)
        console.log("cPS",current_publishing_survey)
        var view_info_panel = document.getElementById("view-info-panelview-info-panel");
        if(current_publishing_survey == null){
            current_publish_title.innerHTML = "NO SURVEY"
        }else{
            current_publish_title.innerHTML = current_publishing_survey.survey_name
        }
        
        // update recent resp card
        getRecentDate(obj,5)
    }
    
    // EventListners 
    survey_total_card.addEventListener("click",function(){
        createTableWithPage(all_survey_array,10);
        createTable(all_survey_array,1,10);
        $("#panel-title").html("TOTAL SURVEYS");
        console.log(view_info_panel_toggle == false)
        var view_info_panel = document.getElementById("view-info-panel");
        if(view_info_panel_toggle == false){
            view_info_panel.style.display = "block"
            view_info_panel_toggle = true
        }else{
            view_info_panel.style.display = "none"
            view_info_panel_toggle = false
        }
        
    })
    
    resp_total_card.addEventListener("click",function(){
        $("#panel-title").html("Total Response")
    })
    
    
    recent_total_card.addEventListener("click",function(){
        
    })
    
    // --- Initilize --- //
    $.ajax({
        url:'/adminPanel',
        type:'post',
        data:{
            type:"view_status"
        },
        success:function(resp){
            if(resp.survey_result == "no result"){
                var new_div = document.createElement("div");
                new_div.innerHTML = "No survey in your department";
                maincontent.html(new_div);
            }else{
                all_survey_array = resp
//                createTableWithPage(resp,10);
//                createTable(resp,1,10);
                updateInfoCard(resp);
                
            }
        }
    })
})