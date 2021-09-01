
var table = $("#datatable").DataTable({
    dom: 'Bftip',
    lengthChange: !1,
});
var latest_news = [];
var top_stories = [];
var top_events = [];
var world_news_reddit = [];
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
            table.rows.add(data).draw();
        })
        .catch((error) => {
            console.log(error);
        });
    localStorage.clear();
    set_favourties();
    get_favourites_domains(get_favourites());
    get_latest_news();
    get_world_news_reddit();
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
    table.clear().draw();
    table.rows.add(top_stories).draw()
});
function get_top_stories() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: "https://emm.newsbrief.eu/emmMap/tunnel?sid=emmMap&?stories=top&language=en",
            contentType: "text/plain",
            dataType: 'json',
            success: function (data) {
                top_stories = [];
                if (typeof data.items !== 'undefined') {
                    $('#a_top_stories_count').append(`(${data.items.length})`);
                    $.each(data.items, function (key, value) {
                        // 2021-08-30T22:26+0200
                        // 2021 7 -3 T2
                        // `<details class="mb-1"><summary>${value.title}</summary><p class="p-1">${value.description}</span> | ${da}-${mo}-${ye}</p>`,
                        var d = new Date(value.pubDate.substr(0, 4), value.pubDate.substr(5, 2) - 1, value.pubDate.substr(8, 2));
                        let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                        let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                        let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                        console.log(`${da}-${mo}-${ye}`);
                        top_stories.push([`<a onclick="javascript:update_article('${value.mainItemLink}')" href="#"><i class="bi bi-link-45deg"></i></a>`,
                        `<a onclick="javascript:update_article('${value.mainItemLink}')" href="#">${value.mainItemSource.value}</a>`,
                        `${value.title}`,
                        `${value.mainItemSource.country}`,
                        ]);
                    });
                    resolve(top_stories);
                }
            },
            error: function (e) { reject(e) }
        });
    })
}

$('#a_latest').on('click', function (e) {
    e.preventDefault();
    table.clear().draw();
    table.rows.add(latest_news).draw()
});
function get_latest_news() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: "https://api.gdeltproject.org/api/v2/doc/doc?query=sourcelang:eng&mode=artlist&maxrecords=25&sort=datedesc&timespan=60minutes&format=json",
            contentType: "text/plain",
            dataType: 'json',
            success: function (data) {
                // data = JSON.parse(data);  
                latest_news = []
                var newArray = [];
                var ht = '';
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
                        latest_news.push([`<a onclick="javascript:update_article('${value.url}')" href="#"><i class="bi bi-link-45deg"></i></a>`,
                        `<a onclick="javascript:update_article('${value.url}')" href="#">${value.domain}</a>`,
                        `${value.title}`,
                        `${country}`,
                        ]);
                    });
                }
                resolve(latest_news);
            },
            error: function (e) { reject(e); }
        });
    })
}

$('#a_world_news_reddit').on('click', function (e) {
    e.preventDefault();
    table.clear().draw();
    table.rows.add(world_news_reddit).draw()
});
function get_world_news_reddit() {
    $.ajax({
        type: 'GET',
        url: "https://www.reddit.com/r/worldnews/top/.json?sort=top&t=hour",
        contentType: "text/plain",
        dataType: 'json',
        success: function (data) {
            world_news_reddit = []
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
                world_news_reddit.push([`<a onclick="javascript:update_article('${value.data.url}')" href="#"><i class="bi bi-link-45deg"></i></a>`,
                `<a onclick="javascript:update_article('${value.data.url}')" href="#">${value.data.domain}</a>`,
                `${value.data.title}`,
                `${hours}:${minutes}:${seconds}`,
                ]);
            });
        },
        error: function (e) {
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });
}

$('#a_india_news').on('click', function (e) {
    e.preventDefault();
    table.clear().draw();
    table.rows.add(india_news).draw()
});
function get_india_news() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: "https://api.gdeltproject.org/api/v2/doc/doc?query=sourcelang:eng%20sourcecountry:india&mode=artlist&maxrecords=250&sort=datedesc&format=json",
            contentType: "text/plain",
            dataType: 'json',
            success: function (data) {
                // data = JSON.parse(data);  
                india_news = []
                var newArray = [];
                if (typeof data.articles !== 'undefined') {
                    // console.log(data.articles);
                    $.each(data.articles, function (key, value) {
                        var exists = false;
                        $.each(newArray, function (k, val2) {
                            if (value.title.toUpperCase().substring(0, 25) == val2.title.toUpperCase().substring(0, 25)) { exists = true };
                        });
                        if (exists == false && value.title != "") { newArray.push(value); }
                    });
                    $('#a_india_news_count').append(`(${newArray.length})`);
                    $.each(newArray, function (key, value) {
                        var d = new Date(value.seendate.substr(0, 4), value.seendate.substr(4, 2) - 1, value.seendate.substr(6, 2), value.seendate.substr(9, 2));
                        let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                        let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                        let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                        india_news.push([`<a href="${value.url}" target="_blank"><i class="bi bi-link-45deg"></i></a>`,
                        `<a href="${value.url}" target="_blank">${value.domain}</a>`,
                        `<details class="mb-1"><summary>${value.title}</summary><p class="p-1">${value.language}&nbsp;|&nbsp;${da}-${mo}-${ye}</span></p>`,
                        `${value.sourcecountry}`,
                        ]);
                    });
                }
                resolve(india_news);
            },
            error: function (e) { reject(e); }
        });
    })
}

$('#a_india_marathi_news').on('click', function (e) {
    e.preventDefault();
    table.clear().draw();
    table.rows.add(india_marathi_news).draw()
});
function get_india_marathi_news() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: "https://api.gdeltproject.org/api/v2/doc/doc?query=sourcelang:marathi&mode=artlist&maxrecords=250&sort=datedesc&format=json",
            contentType: "text/plain",
            dataType: 'json',
            success: function (data) {
                // data = JSON.parse(data);  
                india_marathi_news = []
                var newArray = [];
                if (typeof data.articles !== 'undefined') {
                    // console.log(data.articles);
                    $.each(data.articles, function (key, value) {
                        var exists = false;
                        $.each(newArray, function (k, val2) {
                            if (value.title.toUpperCase().substring(0, 25) == val2.title.toUpperCase().substring(0, 25)) { exists = true };
                        });
                        if (exists == false && value.title != "") { newArray.push(value); }
                    });
                    $('#a_india_marathi_news_count').append(`(${newArray.length})`);
                    $.each(newArray, function (key, value) {
                        var d = new Date(value.seendate.substr(0, 4), value.seendate.substr(4, 2) - 1, value.seendate.substr(6, 2), value.seendate.substr(9, 2));
                        let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                        let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                        let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                        india_marathi_news.push([`<a href="${value.url}" target="_blank"><i class="bi bi-link-45deg"></i></a>`,
                        `<a href="${value.url}" target="_blank">${value.domain}</a>`,
                        `<details class="mb-1"><summary>${value.title}</summary><p class="p-1">${value.language}&nbsp;|&nbsp;${da}-${mo}-${ye}</span></p>`,
                        `${value.sourcecountry}`,
                        ]);
                    });
                }
                resolve(india_marathi_news);
            },
            error: function (e) { reject(e); }
        });
    })
}

$('#a_latest_events').on('click', function (e) {
    e.preventDefault();
    table.clear().draw();
    table.rows.add(latest_events).draw()
});
function get_latest_events() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: "https://emm.newsbrief.eu/emmMap/tunnel?sid=emmMap&?stories=events&language=en",
            contentType: "text/plain",
            dataType: 'json',
            success: function (data) {
                latest_events = [];
                if (typeof data.items !== 'undefined') {
                    $('#a_latest_events_count').append(`(${data.items.length})`);
                    $.each(data.items, function (key, value) {
                        // 2021-08-30T22:26+0200
                        // 2021 7 -3 T2
                        var d = new Date(value.pubDate.substr(0, 4), value.pubDate.substr(5, 2) - 1, value.pubDate.substr(8, 2));
                        let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                        let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                        let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                        console.log(`${da}-${mo}-${ye}`);
                        latest_events.push([`<a href="${value.mainItemLink}" target="_blank"><i class="bi bi-link-45deg"></i></a>`,
                        `<a href="${value.mainItemLink}" target="_blank">${value.mainItemSource.value}</a>`,
                        `<details class="mb-1"><summary>${value.title}</summary><p class="p-1">1${value.description}</span> | ${da}-${mo}-${ye}</p>`,
                        `${value.mainItemSource.country}`,
                        ]);
                    });
                    resolve(latest_events);
                }
            },
            error: function (e) { reject(e) }
        });
    })
}

$('#a_domain_news').on('click', function (e) {
    e.preventDefault();
    table.clear().draw();
    table.rows.add(domain_news).draw()
});
function get_favourites_domains(domain) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: `https://api.gdeltproject.org/api/v2/doc/doc?query=domainis:${domain}&mode=artlist&maxrecords=250&sort=datedesc&format=json`,
            contentType: "text/plain",
            dataType: 'json',
            success: function (data) {
                // data = JSON.parse(data);  
                domain_news = []
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
                    $('#a_domain_news_count').append(`(${newArray.length})`);
                    $.each(newArray, function (key, value) {
                        var d = new Date(value.seendate.substr(0, 4), value.seendate.substr(4, 2) - 1, value.seendate.substr(6, 2), value.seendate.substr(9, 2));
                        let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                        let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                        let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                        domain_news.push([`<a onclick="javascript:update_article('${value.url}')" href="#"><i class="bi bi-link-45deg"></i></a>`,
                        `<a onclick="javascript:update_article('${value.url}')" href="#">${value.domain}</a>`,
                        `${value.title}`,
                        `${value.sourcecountry}`,
                        ]);
                    });
                }
                resolve(domain_news);
            },
            error: function (e) { reject(e); }
        });
    })
}

function update_article(url) {
    var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
        keyboard: false
    });
    $(".modal-title").html("Loading...");
    $("#article_text").html(`<div class="d-flex justify-content-center">
                            <div class="spinner-grow text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>`);
    myModal.show();
    $.ajax({
        type: 'GET',
        url: "https://api.outline.com/v3/parse_article?source_url=" + url,
        success: function (data) {
            $(".modal-title").html(data.data.title);
            $("#article_text").html(data.data.html);
            $("p").css({"class":"fs-5 text"})
            $("img").css({"style":"height:300px; width: auto; object-fit: cover"});
            // $("img").hide();
        },
        error: function (e) {
            $("#article_text").html(e);
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });
}

function getFeaturedSlider() {
    $.ajax({
        type: 'GET',
        url: "https://api.gdeltproject.org/api/v2/doc/doc?query=domainis:bbc.com%20sourcelang:eng&mode=artlist&maxrecords=5&sort=datedesc&format=json",
        contentType: "text/plain",
        dataType: 'json',
        success: function (data) {
            //console.log(data);
            //data = JSON.parse(data);
            var newArray = [];
            var ht = '';
            if (typeof data.articles !== 'undefined') {
                $.each(data.articles, function (key, value) {
                    var exists = false;
                    $.each(newArray, function (k, val2) {
                        if (value.title.toUpperCase().substring(0, 25) == val2.title.toUpperCase().substring(0, 25)) { exists = true };
                    });
                    if (exists == false && value.title != "") { newArray.push(value); }
                });
                $.each(newArray, function (key, value) {
                    var d = new Date(value.seendate.substr(0, 4), value.seendate.substr(4, 2) - 1, value.seendate.substr(6, 2));
                    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                    let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);

                    ht = ht.concat(
                        `<div class="item" style="background-image:url(${value.socialimage})">
                        <div class="featured-post">
                            <div class="post-content">
                                <a class="post-cat" href="${value.domain}">${value.domain}</a>
                                <h2 class="post-title title-extra-large">
                                    <a href="${value.url}" style="background: rgb(200, 200, 200);background: rgba(200, 200, 200, 0.5);">${value.title}</a>
                                </h2>
                                <span class="post-date">${da}-${mo}-${ye}</span>
                            </div>
                        </div>
                        <!--/ Featured post end -->

                    </div><!-- Item 1 end -->`
                    );
                });
                // $("#breakingNewsTicker").html(ht);
                $("#featured-slider").html(ht);
                $("#featured-slider").owlCarousel({

                    loop: true,
                    animateOut: 'fadeOut',
                    autoplay: false,
                    autoplayHoverPause: true,
                    nav: true,
                    margin: 0,
                    dots: false,
                    mouseDrag: true,
                    touchDrag: true,
                    slideSpeed: 500,
                    navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
                    items: 1,
                    responsive: {
                        0: {
                            items: 1
                        },
                        600: {
                            items: 1
                        }
                    }

                });

                // console.log(ht)    ;
                // updateslide()

            }
        },
        error: function (e) {
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });
}
function getNDTV() {
    $.ajax({
        type: 'GET',
        url: "https://api.gdeltproject.org/api/v2/doc/doc?query=domainis:ndtv.com%20sourcelang:eng&mode=artlist&maxrecords=1&sort=datedesc&format=json",
        contentType: "text/plain",
        dataType: 'json',
        success: function (data) {
            //console.log(data);
            //data = JSON.parse(data);
            var newArray = [];
            var ht = '';
            if (typeof data.articles !== 'undefined') {
                $.each(data.articles, function (key, value) {
                    var exists = false;
                    $.each(newArray, function (k, val2) {
                        if (value.title.toUpperCase().substring(0, 25) == val2.title.toUpperCase().substring(0, 25)) { exists = true };
                    });
                    if (exists == false && value.title != "") { newArray.push(value); }
                });
                $.each(newArray, function (key, value) {
                    var d = new Date(value.seendate.substr(0, 4), value.seendate.substr(4, 2) - 1, value.seendate.substr(6, 2));
                    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                    let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);

                    ht = ht.concat(
                        `<div class="post-thumb">
                        <a href="${value.url}"><img class="img-fluid" src="${value.socialimage}"
                                alt="" /></a>
                    </div>
                    <div class="post-content">
                        <a class="post-cat" href="${value.url}">${value.domain}</a>
                        <h2 class="post-title title-large">
                            <a href="${value.url}" style="background: rgb(200, 200, 200);background: rgba(200, 200, 200, 0.5);">${value.title}</a>
                        </h2>
                        <span class="post-date">${da}-${mo}-${ye}</span>
                    </div><!-- Post content end -->
                    `
                    );
                });
                // $("#breakingNewsTicker").html(ht);
                $("#fs1").append(ht);

            }
        },
        error: function (e) {
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });
}
function getCNN() {
    $.ajax({
        type: 'GET',
        url: "https://api.gdeltproject.org/api/v2/doc/doc?query=domainis:cnn.com%20sourcelang:eng&mode=artlist&maxrecords=1&sort=datedesc&format=json",
        contentType: "text/plain",
        dataType: 'json',
        success: function (data) {
            //console.log(data);
            //data = JSON.parse(data);
            var newArray = [];
            var ht = '';
            if (typeof data.articles !== 'undefined') {
                $.each(data.articles, function (key, value) {
                    var exists = false;
                    $.each(newArray, function (k, val2) {
                        if (value.title.toUpperCase().substring(0, 25) == val2.title.toUpperCase().substring(0, 25)) { exists = true };
                    });
                    if (exists == false && value.title != "") { newArray.push(value); }
                });
                $.each(newArray, function (key, value) {
                    var d = new Date(value.seendate.substr(0, 4), value.seendate.substr(4, 2) - 1, value.seendate.substr(6, 2));
                    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                    let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);

                    ht = ht.concat(
                        `<div class="post-thumb">
                        <a href="${value.url}"><img class="img-fluid" src="${value.socialimage}"
                                alt="" /></a>
                    </div>
                    <div class="post-content">
                        <a class="post-cat" href="${value.url}">${value.domain}</a>
                        <h2 class="post-title title-medium">
                            <a href="${value.url}" style="background: rgb(200, 200, 200);background: rgba(200, 200, 200, 0.5);">${value.title}</a>
                        </h2>
                        <span class="post-date">${da}-${mo}-${ye}</span>
                    </div><!-- Post content end -->
                    `
                    );
                });
                // $("#breakingNewsTicker").html(ht);
                $("#fs2").append(ht);

            }
        },
        error: function (e) {
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });
}
function getNYtimes() {
    $.ajax({
        type: 'GET',
        url: "https://api.gdeltproject.org/api/v2/doc/doc?query=domain:nytimes.com%20sourcelang:eng&mode=artlist&maxrecords=1&sort=datedesc&format=json",
        contentType: "text/plain",
        dataType: 'json',
        success: function (data) {
            //console.log(data);
            //data = JSON.parse(data);
            var newArray = [];
            var ht = '';
            if (typeof data.articles !== 'undefined') {
                $.each(data.articles, function (key, value) {
                    var exists = false;
                    $.each(newArray, function (k, val2) {
                        if (value.title.toUpperCase().substring(0, 25) == val2.title.toUpperCase().substring(0, 25)) { exists = true };
                    });
                    if (exists == false && value.title != "") { newArray.push(value); }
                });
                $.each(newArray, function (key, value) {
                    var d = new Date(value.seendate.substr(0, 4), value.seendate.substr(4, 2) - 1, value.seendate.substr(6, 2));
                    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                    let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);

                    ht = ht.concat(
                        `<div class="post-thumb">
                        <a href="${value.url}"><img class="img-fluid" src="${value.socialimage}"
                                alt="" /></a>
                    </div>
                    <div class="post-content">
                        <a class="post-cat" href="${value.url}">${value.domain}</a>
                        <h2 class="post-title title-medium">
                            <a href="${value.url}" style="background: rgb(200, 200, 200);background: rgba(200, 200, 200, 0.5);">${value.title}</a>
                        </h2>
                        <span class="post-date">${da}-${mo}-${ye}</span>
                    </div><!-- Post content end -->
                    `
                    );
                });
                // $("#breakingNewsTicker").html(ht);
                $("#fs3").append(ht);

            }
        },
        error: function (e) {
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });
}

function get_tech_gadget_list() {
    $.ajax({
        type: 'GET',
        url: "https://api.gdeltproject.org/api/v2/doc/doc?query=(%22macbook%22 OR %22gadgets%22 OR %22android%22 OR %22samsung%22)%20sourcelang:eng&mode=artlist&maxrecords=4&sort=hybridrel&format=json&timespan=24h",
        contentType: "text/plain",
        dataType: 'json',
        success: function (data) {
            // data = JSON.parse(data);
            var newArray = [];
            var ht = '';
            var mt = '';
            if (typeof data.articles !== 'undefined') {
                // console.log(data.articles);
                $.each(data.articles, function (key, value) {
                    var exists = false;
                    $.each(newArray, function (k, val2) {
                        if (value.title.toUpperCase().substring(0, 25) == val2.title.toUpperCase().substring(0, 25)) { exists = true };
                    });
                    if (exists == false && value.title != "") { newArray.push(value); }
                });
                $.each(newArray, function (key, value) {
                    var d = new Date(value.seendate.substr(0, 4), value.seendate.substr(4, 2) - 1, value.seendate.substr(6, 2), value.seendate.substr(9, 2));
                    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                    let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                    if (key == 0) {
                        mt = mt.concat(
                            `	<div class="post-block-style clearfix">
                            <div class="post-thumb">
                                <a href="${value.url}">
                                    <img class="img-fluid" src="${value.socialimage}" alt="News" onerror="this.onerror=null;this.src='images/default.jpg';"
                                     />
                                </a>
                            </div>
                            <a class="post-cat" href="index.html#">Robotics</a>
                            <div class="post-content">
                                <h2 class="post-title">
                                    <a href="${value.url}">${value.title}</a>
                                </h2>
                                <div class="post-meta">
                                    <span class="post-author"><a href="${value.url}">J${value.domain}</a></span>
                                    <span class="post-date">${da}-${mo}-${ye}</span>
                                </div>                               
                            </div><!-- Post content end -->
                        </div><!-- Post Block style end -->`
                        );
                    }
                    else {
                        ht = ht.concat(
                            `<li class="clearfix">
                            <div class="post-block-style post-float clearfix">
                                <div class="post-thumb">
                                    <a href="${value.url}">
                                        <img class="img-fluid"
                                            src="${value.socialimage}" alt="News" onerror="this.onerror=null;this.src='images/default.jpg';" />
                                    </a>
                                </div><!-- Post thumb end -->
    
                                <div class="post-content">
                                    <h2 class="post-title title-small">
                                        <a href="${value.url}">${value.title}</a>
                                    </h2>
                                    <div class="post-meta">
                                        <span class="post-date">${da}-${mo}-${ye}</span>
                                    </div>
                                </div><!-- Post content end -->
                            </div><!-- Post block style end -->
                        </li><!-- Li 1 end -->`

                        );
                    }

                });
                $("#tech_gadget").html(mt);
                $("#tech_gadget_list").html(ht);
            }
        },
        error: function (e) {
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });

}

function get_tech_games_list() {
    $.ajax({
        type: 'GET',
        url: "https://api.gdeltproject.org/api/v2/doc/doc?query=(%22video games%22%20OR%20%22gaming%22%20OR%20%22microsoft xbox%22%20OR%20%22nintendo%22%20OR%20%22playstation%22)%20sourcelang:eng&mode=artlist&maxrecords=4&sort=hybridrel&format=json&timespan=24h",
        contentType: "text/plain",
        dataType: 'json',
        success: function (data) {
            // console.log(data);
            // data = JSON.parse(data);
            var newArray = [];
            var ht = '';
            var mt = '';
            if (typeof data.articles !== 'undefined') {
                // console.log(data.articles);
                $.each(data.articles, function (key, value) {
                    var exists = false;
                    $.each(newArray, function (k, val2) {
                        if (value.title.toUpperCase().substring(0, 25) == val2.title.toUpperCase().substring(0, 25)) { exists = true };
                    });
                    if (exists == false && value.title != "") { newArray.push(value); }
                });
                $.each(newArray, function (key, value) {
                    var d = new Date(value.seendate.substr(0, 4), value.seendate.substr(4, 2) - 1, value.seendate.substr(6, 2), value.seendate.substr(9, 2));
                    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                    let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                    if (key == 0) {
                        mt = mt.concat(
                            `	<div class="post-block-style clearfix">
                            <div class="post-thumb">
                                <a href="${value.url}">
                                    <img class="img-fluid" src="${value.socialimage}" alt="News" onerror="this.onerror=null;this.src='images/default.jpg';"
                                        alt="" />
                                </a>
                            </div>
                            <a class="post-cat" href="index.html#">Robotics</a>
                            <div class="post-content">
                                <h2 class="post-title">
                                    <a href="${value.url}">${value.title}</a>
                                </h2>
                                <div class="post-meta">
                                    <span class="post-author"><a href="${value.url}">J${value.domain}</a></span>
                                    <span class="post-date">${da}-${mo}-${ye}</span>
                                </div>                               
                            </div><!-- Post content end -->
                        </div><!-- Post Block style end -->`
                        );
                    }
                    else {
                        ht = ht.concat(
                            `<li class="clearfix">
                            <div class="post-block-style post-float clearfix">
                                <div class="post-thumb">
                                    <a href="${value.url}">
                                        <img class="img-fluid"
                                            src="${value.socialimage}" alt="News" onerror="this.onerror=null;this.src='images/default.jpg';" />
                                    </a>
                                </div><!-- Post thumb end -->
    
                                <div class="post-content">
                                    <h2 class="post-title title-small">
                                        <a href="${value.url}">${value.title}</a>
                                    </h2>
                                    <div class="post-meta">
                                        <span class="post-date">${da}-${mo}-${ye}</span>
                                    </div>
                                </div><!-- Post content end -->
                            </div><!-- Post block style end -->
                        </li><!-- Li 1 end -->`

                        );
                    }

                });
                $("#tech_games").html(mt);
                $("#tech_games_list").html(ht);
            }
        },
        error: function (e) {
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });

}

function get_tech_robotics_list() {
    $.ajax({
        type: 'GET',
        url: "https://api.gdeltproject.org/api/v2/doc/doc?query=(%22robotics%22%20OR%20%22robots%22%)%20sourcelang:eng&mode=artlist&maxrecords=4&sort=hybridrel&format=json&timespan=24h",
        contentType: "text/plain",
        dataType: 'json',
        success: function (data) {
            console.log(data);
            // data = JSON.parse(data);
            var newArray = [];
            var ht = '';
            var mt = '';
            if (typeof data.articles !== 'undefined') {
                // console.log(data.articles);
                $.each(data.articles, function (key, value) {
                    var exists = false;
                    $.each(newArray, function (k, val2) {
                        if (value.title.toUpperCase().substring(0, 25) == val2.title.toUpperCase().substring(0, 25)) { exists = true };
                    });
                    if (exists == false && value.title != "") { newArray.push(value); }
                });
                $.each(newArray, function (key, value) {
                    var d = new Date(value.seendate.substr(0, 4), value.seendate.substr(4, 2) - 1, value.seendate.substr(6, 2), value.seendate.substr(9, 2));
                    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                    let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                    if (key == 0) {
                        mt = mt.concat(
                            `	<div class="post-block-style clearfix">
                            <div class="post-thumb">
                                <a href="${value.url}">
                                    <img class="img-fluid" src="${value.socialimage}" alt="News" onerror="this.onerror=null;this.src='images/default.jpg';"
                                        alt="" />
                                </a>
                            </div>
                            <a class="post-cat" href="index.html#">Robotics</a>
                            <div class="post-content">
                                <h2 class="post-title">
                                    <a href="${value.url}">${value.title}</a>
                                </h2>
                                <div class="post-meta">
                                    <span class="post-author"><a href="${value.url}">J${value.domain}</a></span>
                                    <span class="post-date">${da}-${mo}-${ye}</span>
                                </div>                               
                            </div><!-- Post content end -->
                        </div><!-- Post Block style end -->`
                        );
                    }
                    else {
                        ht = ht.concat(
                            `<li class="clearfix">
                            <div class="post-block-style post-float clearfix">
                                <div class="post-thumb">
                                    <a href="${value.url}">
                                        <img class="img-fluid"
                                            src="${value.socialimage}" alt="News" onerror="this.onerror=null;this.src='images/default.jpg';" />
                                    </a>
                                </div><!-- Post thumb end -->
    
                                <div class="post-content">
                                    <h2 class="post-title title-small">
                                        <a href="${value.url}">${value.title}</a>
                                    </h2>
                                    <div class="post-meta">
                                        <span class="post-date">${da}-${mo}-${ye}</span>
                                    </div>
                                </div><!-- Post content end -->
                            </div><!-- Post block style end -->
                        </li><!-- Li 1 end -->`

                        );
                    }

                });
                $("#tech_robotics_list").html(ht);
                $("#tech_robotics").html(mt);
            }
        },
        error: function (e) {
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });

}

function getMoreNews() {
    $.ajax({
        type: 'GET',
        url: "https://emm.newsbrief.eu/emmMap/tunnel?sid=emmMap&?stories=top&language=en",
        contentType: "text/plain",
        dataType: 'json',
        success: function (data) {
            //console.log(data);
            //data = JSON.parse(data);
            var newArray = [];
            var ht = '<div class="item">';
            if (typeof data.items !== 'undefined') {
                $.each(data.items.slice(0, 5), function (key, value) {
                    // var d = new Date(value.pubDate.substr(0, 4), value.pubDate.substr(4, 2) - 1, value.pubDate.substr(6, 2), value.pubDate.substr(9, 2));
                    // let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                    // let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                    // let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                    // console.log(`${da}-${mo}-${ye}`);
                    ht = ht.concat(
                        `
                        <div class="post-block-style post-float-half clearfix">
                            <div class="post-content">
                                <h2 class="post-title">
                                    <a href="${value.mainItemLink}">${value.title}</a>
                                </h2>
                                <div class="post-meta">                                    
                                    <span class="post-date">${value.pubDate}</span>
                                </div>
                                <p>${value.description}</p>
                            </div><!-- Post content end -->
                        </div><!-- Post Block style 1 end -->
                        <div class="gap-30"></div>
                   `
                    );
                });
                ht = ht.concat(`</div><!-- Item 1 end -->`)
                ht = ht.concat(`<div class="item">`)
                $.each(data.items.slice(5, 10), function (key, value) {
                    // var d = new Date(value.pubDate.substr(0, 4), value.pubDate.substr(4, 2) - 1, value.pubDate.substr(6, 2), value.pubDate.substr(9, 2));
                    // let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                    // let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                    // let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                    // console.log(`${da}-${mo}-${ye}`);
                    ht = ht.concat(
                        `
                        <div class="post-block-style post-float-half clearfix">
                            <div class="post-content">
                                <h2 class="post-title">
                                    <a href="${value.mainItemLink}">${value.title}</a>
                                </h2>
                                <div class="post-meta">                                    
                                    <span class="post-date">${value.pubDate}</span>
                                </div>
                                <p>${value.description}</p>
                            </div><!-- Post content end -->
                        </div><!-- Post Block style 1 end -->
                        <div class="gap-30"></div>
                   `
                    );
                });
                ht = ht.concat(`</div><!-- Item 1 end -->`)
                ht = ht.concat(`<div class="item">`)
                $.each(data.items.slice(10, 15), function (key, value) {
                    // var d = new Date(value.pubDate.substr(0, 4), value.pubDate.substr(4, 2) - 1, value.pubDate.substr(6, 2), value.pubDate.substr(9, 2));
                    // let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                    // let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                    // let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                    // console.log(`${da}-${mo}-${ye}`);
                    ht = ht.concat(
                        `
                        <div class="post-block-style post-float-half clearfix">
                            <div class="post-content">
                                <h2 class="post-title">
                                    <a href="${value.mainItemLink}">${value.title}</a>
                                </h2>
                                <div class="post-meta">                                    
                                    <span class="post-date">${value.pubDate}</span>
                                </div>
                                <p>${value.description}</p>
                            </div><!-- Post content end -->
                        </div><!-- Post Block style 1 end -->
                        <div class="gap-30"></div>
                   `
                    );
                });
                ht = ht.concat(`</div><!-- Item 1 end -->`)
                ht = ht.concat(`<div class="item">`)
                $.each(data.items.slice(15, data.items.length), function (key, value) {
                    // var d = new Date(value.pubDate.substr(0, 4), value.pubDate.substr(4, 2) - 1, value.pubDate.substr(6, 2), value.pubDate.substr(9, 2));
                    // let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                    // let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                    // let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                    // console.log(`${da}-${mo}-${ye}`);
                    ht = ht.concat(
                        `
                        <div class="post-block-style post-float-half clearfix">
                            <div class="post-content">
                                <h2 class="post-title">
                                    <a href="${value.mainItemLink}">${value.title}</a>
                                </h2>
                                <div class="post-meta">                                    
                                    <span class="post-date">${value.pubDate}</span>
                                </div>
                                <p>${value.description}</p>
                            </div><!-- Post content end -->
                        </div><!-- Post Block style 1 end -->
                        <div class="gap-30"></div>
                   `
                    );
                });
                ht = ht.concat(`</div><!-- Item 1 end -->`)
                // $("#breakingNewsTicker").html(ht);
                $("#more-news-slide").html(ht);
                $("#more-news-slide").owlCarousel({

                    loop: false,
                    autoplay: false,
                    autoplayHoverPause: true,
                    nav: false,
                    margin: 30,
                    dots: true,
                    mouseDrag: false,
                    slideSpeed: 500,
                    navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
                    items: 1,
                    responsive: {
                        0: {
                            items: 1
                        },
                        600: {
                            items: 1
                        }
                    }

                });

            }
        },
        error: function (e) {
            console.log("There was an error with your request...");
            console.log("error: " + JSON.stringify(e));
        }
    });

}


