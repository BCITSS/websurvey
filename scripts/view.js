$(document).ready(function () {
    var maincontent = $("#main-content2");
    var page_changer = document.getElementById("page-changer")
    var current_page = 1;
    var user_display_number = 10;
    var current_table;
    var current_page_number = document.getElementById("current-page-number");
    var table;

    var modify_action_button = document.getElementById("mod-action-btn");
    var view_info_panel_toggle = true;
    
    var survey_total_card = document.getElementById("survey-total-card");
    var recent_total_card = document.getElementById("recent-total-card")
    var current_publish_card = document.getElementById("current-publish-card")

    var total_survey_number = document.getElementById("survey-total-number");
    var recent_resp_number = document.getElementById("recent-resp-number");
    var current_publish_title = document.getElementById("current-publish-title");
    var search_input = document.getElementById("search-input");
    var recent_survey_array;
    var all_survey_array;
    chart_div
    var chart_div = document.getElementById("chart-div");
    var status_chart_panel = document.getElementById("status-chart-panel")
    var view_info_panel = document.getElementById("view-info-panel");

    // get random color
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // convert array for chartjs
    function parseSurveyStatus(obj) {
        var question_array = [];
        var answer_array = [];
        var answer_count = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                question_array.push(key);
                var temp_array_1 = [];
                var temp_array_2 = [];
                for (var i = 0; i < obj[key].length; i++) {
                    temp_array_1.push(obj[key][i][0]);
                    temp_array_2.push(obj[key][i][1]);
                }
                answer_array.push(temp_array_1);
                answer_count.push(temp_array_2);
            }
        }
        return {
            "question_array": question_array,
            "answer_array": answer_array,
            "answer_count": answer_count
        };
    }

    // convert resp obj to 2D array
    function convert2DArray(array) {
        var twoDarray = [];

        for (var i = 0; i < array.length; i++) {
            var temp_array = [];
            var question_array = []
            for (var x = 0; x < array[i].response_result.length; x++) {
                // push question only onece
                if (i == 0) {
                    question_array.push(array[i].response_result[x].question_text)
                }

                if (array[i].response_result[x].answer_option_text == null) {
                    temp_array.push(array[i].response_result[x].short_answer_text)
                } else {
                    temp_array.push(array[i].response_result[x].answer_option_text)
                }

            }
            if (i == 0) {
                twoDarray.push(question_array);
            }
            twoDarray.push(temp_array)
        }
        return twoDarray;
    }

    // convert 2D array to CSV
    function arrayToCsv(array) {
        var csvRow = [];
        for (var i = 0; i < array.length; i++) {
            csvRow.push(array[i].join(','));
        }
        var csvString = csvRow.join("\r\n");

        return csvString;
    }

    // create survey info table
    function createTable(resp, pageNumber, display_number) {
        var table = document.createElement("table");
        table.className += "survey-list-table table table-bordered table-dark table-hover ";
        table.id = "survey-view";
        table.setAttribute('border', '1');
        var tHead = document.createElement("thead")
        var headTr = document.createElement('tr');
        var tableColumn = ['ID', 'Name', 'Creator', 'Creation Date', 'Last Update', 'Total Responses', 'CSV']
        var tableColumValue = ["id", "survey_name", "creator", "start_date", "updated", "total_response", "csv"];
        var x = 0
        tableColumn.forEach(function (Element) {
            var th = document.createElement('th');
            th.scope = "col";
            th.id = tableColumValue[x];
            th.innerHTML = Element;
            th.inverse = true;
            th.init_HTML = Element
            if (Element == "ID") {
                th.innerHTML = Element + " &#8593"
            }
            th.addEventListener("click", function () {
                $("th").each(function (index) {
                    this.innerHTML = this.init_HTML
                })
                this.innerHTML = this.init_HTML
                if (this.inverse == true) {
                    this.inverse = false;
                    this.innerHTML = this.innerHTML + " &#8595"
                } else {
                    this.inverse = true;
                    this.innerHTML = this.innerHTML + " &#8593"
                }
                var array = sortArray(all_survey_array, this.id, this.inverse);
                createTable(array, 1, 10)
                appendRows(all_survey_array, table, 1, user_display_number)


            })
            headTr.appendChild(th);
            x++
        });
        tHead.appendChild(headTr);
        table.appendChild(tHead);

        return table;
    }
    
    // update recent info card
    function getRecentDate(day_duration) {
        var days = day_duration // days to subtract
        var today = new Date();
        console.log(days);
        // get date from substract day_duration
        var new_date = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
        var dd = new_date.getDate();
        var mm = new_date.getMonth() + 1;
        var yyyy = new_date.getFullYear()

        var date = yyyy + "-" + mm + "-" + dd

        $.ajax({
            url: '/adminPanel',
            type: 'post',
            data: {
                type: "view_status_with_date",
                before_date: date
            },
            success: function (resp) {
                var recent_resp_num;

                if(resp == "invalid input"){
                    showStatusBar("Invalid input of day")
                }else if (resp.response_result == "no result") {
                    document.getElementById("recent-day-input").value = 5;
//                    showStatusBar("No Responses","red")
                    recent_resp_num = 0
//                    getRecentDate(5);
                } else {
                    recent_resp_num = resp.length
                    recent_resp_number.innerHTML = recent_resp_num
                    recent_survey_array = resp

                    upRecentResp();
                }
            }
        })
    }

    function updateInfoCard(obj) {


        function sumResponse(obj) {
            var total_number = 0
            obj.forEach(function (Element) {
                total_number += parseInt(Element.count)
            })
            return total_number;
        }

        function findPublishingSurvey(obj) {
            var return_survey = null;
            obj.forEach(function (survey) {
                if (survey.isopen == true) {
                    return_survey = survey
                }
            })
            return return_survey;
        }
        // update totoal survey card 
        total_survey_number.innerHTML = obj.length

        // update current publishing 
        var current_publishing_survey = findPublishingSurvey(obj)
        var view_info_panel = document.getElementById("view-info-panelview-info-panel");
        if (current_publishing_survey == null) {
            current_publish_title.innerHTML = "NO SURVEY"
        } else {
            current_publish_title.innerHTML = current_publishing_survey.survey_name
        }

        // update recent resp card
        getRecentDate(5)
    }

    function cleanPager(pager) {
        for (var i = 0; i < pager.childNodes.length; i++) {
            if (pager.childNodes[i].id == "prev-page-btn" || pager.childNodes[i].id == "next-page-btn") {

            } else {
                pager.childNodes[i].remove();
                i--
            }
        }
    }

    function createPager(resp, display_number, table, page_changer) {
        if (resp.length > display_number) {
            var total_page = Math.ceil((resp.length / display_number))
            for (var p = 0; p < total_page; p++) {
                var new_li = document.createElement("li")
                new_li.className = "page-item"
                page_changer.insertBefore(new_li, page_changer.children[page_changer.children.length - 1])
                //                page_changer.appendChild(new_li);
                var new_a = document.createElement("a")
                new_a.className = "page-link";
                new_a.value = (p + 1);
                new_a.href = "javascript:void(0)";
                new_a.innerHTML = (p + 1)
                new_li.appendChild(new_a);
                new_a.addEventListener("click", function () {
                    current_page_number.innerHTML = this.innerHTML;
                    current_page = this.innerHTML
                    appendRows(all_survey_array, table, this.value, user_display_number);
                })
            }
        }
    }

    function sortArray(array, type, inverse = false) {
        if (inverse == true) {
            array.sort(function (a, b) {
                    if (a[type] < b[type]) {
                        return 1
                    }
                    if (a[type] > b[type]) {
                        return -1
                    }
                    return 0;
                })

        } else if (inverse == false) {
            array.sort(function (a, b) {
                if (a[type] < b[type]) {
                    return -1
                }
                if (a[type] > b[type]) {
                    return 1
                }
                return 0;
            })
        }
        
        console.log("SS",array)
        return array;

    }
    
    function changeChartView(){
        document.getElementById("search-box-component").style.display = "none"
        document.getElementById("pager-component").style.display = "none"
        document.getElementById("main-content2").style.display = "none"
        document.getElementById("main-content3").style.display = "block"
        document.getElementById("main-content4").style.display = "none"

    }
    
    function changeSurveyView(){
        document.getElementById("search-box-component").style.display = "block"
        document.getElementById("pager-component").style.display = "block"
        document.getElementById("main-content2").style.display = "block"
        document.getElementById("main-content3").style.display = "none"
        document.getElementById("main-content4").style.display = "none"

    }
    
    function changeRecentView(){
        document.getElementById("search-box-component").style.display = "none"
        document.getElementById("pager-component").style.display = "none"
        document.getElementById("main-content2").style.display = "none"
        document.getElementById("main-content3").style.display = "none"
        document.getElementById("main-content4").style.display = "block"
    }
    
    // create total response button 
    function createTotalButton(resp, i) {
        // --- Total response btn --- //
        var total_resp_btn = document.createElement('button');
        total_resp_btn.value = resp[i].count;
        total_resp_btn.innerHTML = resp[i].count;
        total_resp_btn.id = resp[i].id;
        total_resp_btn.className = 'total-resp-btn';
        total_resp_btn.addEventListener("click", function () {
            $.ajax({
                url: "/viewSurvey",
                type: "post",
                data: {
                    survey_id: this.id
                },
                success: function (resp) {

                    if (resp == "no result") {
                        view_info_panel.html("no result to show");
                    } else {
                        // disable info panel
                        changeChartView();
                        
                        var new_format_array = parseSurveyStatus(resp);

                        $("#panel-title").html("RESPONSE CHART");
                        chart_div.innerHTML = ""
                        for(var i=0; i<new_format_array.question_array.length;i++ ){
                            var canvas_div = document.createElement("div");
                            canvas_div.className = "canvas-div"
                            
                            var new_canvas = document.createElement("canvas");
                            new_canvas.class= "answer-pie-chart";
                            new_canvas.width = "10";
                            new_canvas.height = "10";
                            new_canvas.getContext("2d");
                            
                            canvas_div.append(new_canvas);
                            chart_div.append(canvas_div);

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
                    }
                }
            });
        })
        return total_resp_btn;
    }

    function appendRows(resp, table, pageNumber = 1, display_number) {
        $(table).find("tr:gt(0)").remove();
        start_number = (pageNumber - 1) * display_number
        end_number = pageNumber * display_number
        var row_number = 0
        for (var i = start_number; i < end_number && i < resp.length; i++) {
            var row = table.insertRow(row_number + 1);
            row_number++
            var survey_id = row.insertCell(0)
            var survey_name = row.insertCell(1);
            var creator = row.insertCell(2);
            var create_date = row.insertCell(3);
            var last_update = row.insertCell(4);
            var total_resp = row.insertCell(5);
            var csv_field = row.insertCell(6);

            // create total button
            var total_resp_btn = createTotalButton(resp, i);
            // CSV download button
            var csv_download_btn = createCSVDownloadButton(resp, i);


            survey_id.innerHTML = resp[i].id;
            survey_name.innerHTML = resp[i].survey_name;
            creator.innerHTML = resp[i].creator;
            create_date.innerHTML = timeConvert(resp[i].create_date);
            last_update.innerHTML = timeConvert(resp[i].updated);
            total_resp.appendChild(total_resp_btn);
            csv_field.appendChild(csv_download_btn);
        }
    }

    function searchArray(search_array, search_value, type) {
        var matched_index = []
        var matched_obj_array = []
        var regEx = new RegExp('(' + search_value + ')', 'gm');
        for (var i = 0; i < search_array.length; i++) {
            if (regEx.test(search_array[i][type]) == true) {
                matched_index.push(i)
            }
        }
        for (var x = 0; x < matched_index.length; x++) {
            matched_obj_array.push(all_survey_array[matched_index[x]]);
        }
        appendRows(matched_obj_array, table, 1, 10);
    }

    function createCSVDownloadButton(resp, i) {
        var csv_download_btn = document.createElement('button');
        csv_download_btn.innerHTML = "Download";
        csv_download_btn.id = resp[i].id;
        csv_download_btn.value = resp[i].survey_name
        csv_download_btn.className = 'csv-download-btn';

        csv_download_btn.addEventListener("click", function () {
            var survey_name = this.value;
            $.ajax({
                url: "/getSurveyData",
                type: "post",
                data: {
                    survey_id: this.id
                },
                success: function (resp) {

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

    // convert time
    function timeConvert(time) {
        var date_obj = new Date(time);
        var date = date_obj.toLocaleDateString();
        var time = date_obj.toLocaleTimeString();
        return date + " " + time
    }
    function toggleViewInfoPanel(){
        var view_info_panel = document.getElementById("view-info-panel");
        if (view_info_panel_toggle == false) {
            view_info_panel.style.display = "block"
            view_info_panel_toggle = true
        } else {
            view_info_panel.style.display = "none"
            view_info_panel_toggle = false
        }
    }
    
    // update recent resp status
    function upRecentResp () {
        maincontent.html("");
        cleanPager(page_changer)
        
        console.log(recent_survey_array);
        var chart_data = convertLineChart(recent_survey_array);
        
        function convertLineChart(obj){
            var new_obj = {};
            var data = [];
            var label = [];
            var count = 0
            for(var i=0; i< obj.length;i++){
                if(i == 0){
                    var prev_survey_name = obj[i].survey_name
                }else{
                    var prev_survey_name = obj[i-1].survey_name
                }
                                
                if(prev_survey_name == obj[i].survey_name && i !== obj.length-1){
                    count++
                }else{
                    label.push(prev_survey_name);
                    data.push(count)
                    count = 1;
                }
            }
            new_obj.data = data;
            new_obj.label = label;
            
            console.log(new_obj);
            return new_obj;
        }
        
        // Create Bar Chart
        var chart_color_array = [];

        for(var y =0;y<chart_data.data.length;y++){
            chart_color_array.push(getRandomColor());
        }
        
        // Clean line chart canvas
        $("#line-chart-div").html("");
        var new_canvas = document.createElement("canvas");
        new_canvas.id = "line-chart";
        new_canvas.width = "400";
        new_canvas.height = "400";
        
        $("#line-chart-div").append(new_canvas);
        
        var ctx = document.getElementById("line-chart").getContext("2d");

        var respLineChart =  new Chart(ctx,{
            type: 'bar',
            data: {
                labels: chart_data.label,
                datasets:[{
                    label:"Number of Responses",
                    backgroundColor: chart_color_array,
                    data:chart_data.data,
                    borderWidth:1
                    
                }],
                
            },
            options: {
                title:{
                    text:"MY CHART"
                },
                scales: {
                    xAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Survey Name'
						}
				    }],
                    yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Response Number'
						},
                        ticks: {
                            beginAtZero:true
                        }
					}]
                }
            }
        })
        
        // Clean Table
        $("#recent_resp_table").html("");
        
        // Create Table on right        
        var tHead = document.createElement("thead")
        var headTr = document.createElement('tr');
        var tableColumn = ['Survey Name','Response Time']
        var tableColumValue = ['survey_name','response_time'];
        var x = 0
        recent_table = document.getElementById("recent_resp_table").appendChild(tHead);
        tableColumn.forEach(function (Element) {
            var th = document.createElement('th');
            th.scope = "col";
            th.id = tableColumValue[x];
            th.innerHTML = Element;
            th.inverse = true;
            th.init_HTML = Element
            
            headTr.appendChild(th);
            x++
        });
        tHead.appendChild(headTr);
        
        
        $(recent_table).find("tr:gt(0)").remove();
        row_number = 0;
        for (var i = 0; i < recent_survey_array.length; i++) {
            var row = recent_table.insertRow(row_number + 1);
            row_number++
            var survey_id = row.insertCell(0)
            var survey_name = row.insertCell(1);


            survey_id.innerHTML = recent_survey_array[i].survey_name;
            survey_name.innerHTML = timeConvert(recent_survey_array[i].response_time);
        }
        
        $("#panel-title").html("RECENT RESPONSES");
    }

    // EventListners 
    survey_total_card.addEventListener("click", function () {
        cleanPager(page_changer)
        maincontent.html("");
        
        changeSurveyView();
        
        table = createTable(all_survey_array, 10);

        createPager(all_survey_array, 10, table, page_changer);
        maincontent.append(table);

        appendRows(all_survey_array, table, 1, 10)

        $("#panel-title").html("TOTAL SURVEYS");
        toggleViewInfoPanel();
    })

    recent_total_card.addEventListener("click",function(){
        upRecentResp();
        changeRecentView();
        toggleViewInfoPanel()
    })
    
    $("#recent-day-input").on("change",function(){
        getRecentDate(document.getElementById("recent-day-input").value)
        upRecentResp();
//        toggleViewInfoPanel();
    })

    $("#prev-page-btn").on("click", function () {
        if (1 < current_page) {
            current_page--
            current_page_number.innerHTML = current_page;
            appendRows(all_survey_array, table, current_page, 10)
        }
    })

    $("#next-page-btn").on("click", function () {
        if (current_page < page_changer.children.length - 2) {
            current_page++
            current_page_number.innerHTML = current_page;
            appendRows(all_survey_array, table, current_page, 10)
        }
    })

    search_input.addEventListener("keyup", function () {
        searchArray(all_survey_array, search_input.value, "survey_name")
    })
    
    $("#back_survey_button").on("click",function(){
        changeSurveyView()
    })


    // --- Initilize --- //
    function initialize(){
        current_page_number.innerHTML = 1;
        $.ajax({
            url: '/adminPanel',
            type: 'post',
            data: {
                type: "view_status"
            },
            success: function (resp) {
                if (resp.survey_result == "no result") {
                    var new_div = document.createElement("div");
                    new_div.innerHTML = "No survey in your department";
                    maincontent.html(new_div);
                } else {
                    all_survey_array = resp
                    updateInfoCard(resp);
                }
            }
        })
        toggleViewInfoPanel();
    }
    
    initialize();
})
