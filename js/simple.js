
var table = $("#datatable").DataTable({
    dom: 'Bftip',
    lengthChange: !1,
});

var top_stories_html = '';
var latest_news_html = '';
var top_events = [];
var world_news_reddit_html = '';
var india_news = [];
var india_marathi_news = [];
var top_publications = [];
var latest_events = [];
var domain_news = [];

$(document).ready(function () {    
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    $("#ts-date").append(today.toDateString());
    get_top_stories()
        .then((data) => {
            console.log(data);
            $("#article_list").html(data);
        })
        .catch((error) => {
            console.log(error);
        });
    // localStorage.clear();
    // set_favourties();
    // get_favourites_domains(get_favourites());
     get_latest_news();
    // get_world_news_reddit();
    // get_india_news();    

    // get_india_marathi_news();
    // get_latest_events();
});

function set_favourties() {
    localStorage.setItem('domain', 'bbc.co.uk');
}

function get_favourites() {
    return localStorage.getItem('domain');
}

function remove_favourites() {
    localStorage.removeItem('domain');
}



$('#a_top_stories').on('click', function (e) {
    e.preventDefault();    
    $("#article_list").html(top_stories_html);
});
function get_top_stories() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: "https://emm.newsbrief.eu/emmMap/tunnel?sid=emmMap&?stories=top&language=en",
            contentType: "text/plain",
            dataType: 'json',
            success: function (data) {                
                top_stories_html = '';
                if (typeof data.items !== 'undefined') {
                    $('#a_top_stories_count').append(`(${data.items.length})`);
                    $.each(data.items, function (key, value) {
                        // 2021-08-30T22:26+0200
                        // 2021 7 -3 T2
                        // `<details class="mb-1"><summary>${value.title}</summary><p class="p-1">${value.description}</span> | ${da}-${mo}-${ye}</p>`,
                        var d = new Date(value.pubDate.substr(0, 4), value.pubDate.substr(5, 2) - 1, value.pubDate.substr(8, 2));
                        let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                        let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
                        let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);                        
                        top_stories_html = top_stories_html.concat(`
                            <li class="list-group-item px-1" onclick="javascript:update_article('${value.mainItemLink}')" style="cursor: pointer; padding:none !important;">
                            <i class="bi bi-link-45deg text-primary"></i><strong style="text-decoration: underline;" class="text-primary">${value.mainItemSource.value}</strong>&nbsp;${value.title.slice(0,100)}                            
                            </li>
                        `);                        
                    });
                    resolve(top_stories_html);
                }
            },
            error: function (e) { reject(e) }
        });
    })
}

$('#a_latest').on('click', function (e) {
    e.preventDefault();
    table.clear().draw();
    $("#article_list").html(latest_news_html);
});
function get_latest_news() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: "https://api.gdeltproject.org/api/v2/doc/doc?query=sourcelang:eng&mode=artlist&maxrecords=250&sort=datedesc&format=json",
            contentType: "text/plain",
            dataType: 'json',
            success: function (data) {
                // data = JSON.parse(data);  
                latest_news_html = ''
                var newArray = [];                
                if (typeof data.articles !== 'undefined') {
                    // console.log(data.articles);
                    // `<details class="mb-1"><summary>${value.title}</summary><p class="p-1">${value.language}&nbsp;|&nbsp;${da}-${mo}-${ye}</span></p>`,
                    $.each(data.articles, function (key, value) {
                        var exists = false;
                        $.each(newArray, function (k, val2) {
                            if (value.title.toUpperCase().substring(0, 25) == val2.title.toUpperCase().substring(0, 25)) { exists = true };
                        });
                        if (exists == false && value.title != "") { newArray.push(value); }
                    });
                    $('#a_latest').append(`(${newArray.length})`);
                    $.each(newArray, function (key, value) {
                        var country = '';
                        if (value.sourcecountry == "United States") {
                            country = "US";
                        } else if (value.sourcecountry == "United Kingdom") {
                            country = "UK";
                        } else if (value.sourcecountry == "South Africa") {
                            country = "SA";
                        } else {
                            country = value.sourcecountry;
                        }
                        var d = new Date(value.seendate.substr(0, 4), value.seendate.substr(4, 2) - 1, value.seendate.substr(6, 2), value.seendate.substr(9, 2));
                        let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                        let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                        let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                        latest_news_html = latest_news_html.concat(`                        
                        <li class="list-group-item px-1" onclick="javascript:update_article('${value.url}')" style="cursor: pointer;">
                        <i class="bi bi-link-45deg"></i><strong>${value.domain}</strong><br>
                        ${value.title.slice(0,100)}
                        </li>
                        `);                        
                    });
                }
                resolve(latest_news_html);
            },
            error: function (e) { reject(e); }
        });
    })
}


$('#a_world_news_reddit').on('click', function (e) {
    e.preventDefault();
    $("#article_list").html(world_news_reddit_html);    
});
function get_world_news_reddit() {
    $.ajax({
        type: 'GET',
        url: "https://www.reddit.com/r/worldnews/top/.json?sort=top&t=hour",
        contentType: "text/plain",
        dataType: 'json',
        success: function (data) {
            world_news_reddit_html = '';
            $('#a_world_news_reddit_count').append(`(${data.data.children.length})`);
            $.each(data.data.children, function (key, value) {
                var title = '';
                title = value.data.title.slice(0, 100);
                var date = new Date(value.data.created * 1000);
                // let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
                // let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
                // let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
                // Hours part from the timestamp
                var hours = date.getHours();
                if (hours < 10) {
                    hours = "0" + hours.toString();
                }
                // Minutes part from the timestamp
                var minutes = date.getMinutes();
                if (minutes < 10) {
                    minutes = "0" + minutes.toString();
                }
                // Seconds part from the timestamp
                var seconds = date.getSeconds();
                if (seconds < 10) {
                    seconds = "0" + seconds.toString();
                }
                var flair_text = '';
                if (value.data.link_flair_text == "null") {
                    flair_text = 'N/A';
                }
                world_news_reddit_html = world_news_reddit_html.concat(`                        
                <li class="list-group-item px-1" onclick="javascript:update_article('${value.data.url}')" style="cursor: pointer;">
                <i class="bi bi-link-45deg"></i><strong>${value.data.domain}</strong><br>
                ${value.data.title.slice(0,100)}
                </li>
                `);
            });
        },
        error: function (e) {
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });
}

function update_article(url) {
    $("#article_text").html(`<div class="d-flex justify-content-center">
    <div class="spinner-grow text-primary" role="status">
    <span class="visually-hidden">Loading...</span>
    </div>
</div>`);
    $.ajax({
        type: 'GET',
        url: "https://api.outline.com/v3/parse_article?source_url=" + url,
        success: function (data) {  
            $("#article_text").html('');
            $("#article_text").append(`<strong class="mb-1">${data.data.title}</strong><br>`);
            $("#article_text").append(`<img src="https://www.google.com/s2/favicons?sz=16&domain=${data.data.domain}"  alt=""/>&nbsp;<strong>${data.data.domain}</strong> | ${data.data.date}<hr style="margin:0.1rem !important">`);                            
            $("#article_text").append(`<div class="mt-3">${data.data.html}</div>`);          
            $("img").css({"style":"height:200px; width: 200px; object-fit: cover"});
            // $("img").hide();
        },
        error: function (e) {
            $("#article_text").html(e);
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });
}



