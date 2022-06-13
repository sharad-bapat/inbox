var country = "";
var language = "";
getCountry();
if (country && language) {
    console.log(`Country:${country}, Language: ${language}`);
}
function getCountry() {
    country = navigator.languages[0].split("-")[1]
    language = navigator.languages[0].split("-")[0]
}

onPageLoad();
window.addEventListener('hashchange', function () {
    loading();
    //$(".offcanvas-backdrop").remove();
    //$(".offcanvas").toggle();
   // $('body').removeAttr('style','');
    if (!location.hash || location.hash == "#" || location.hash == "") {
        window.location = "#latest";
    }
    console.log(location.hash);
    load();
}, false);


function onPageLoad() {
    loading();
    if (!location.hash || location.hash == "#" || location.hash == "") {
        window.location = "#latest";
    }
    load();
}

function load() {
    loading();
    if (location.hash == "#latest") {
        getLatest().then((data => { populate_Latest_Top(data) }));
    } else if (location.hash == "#top") {
        getTop().then((data => { populate_Latest_Top(data) }));
    }
    else if (location.hash == "#searchTrends") {
        getGoogleSearchTrends().then((data => { populateGoogleSearchTrends(data) }));
    }
    else if (location.hash == "#wikiTrends") {
        getWikiData().then((data => { populateWiki(data) }));
    }
    else if (location.hash == "#realtimeTrends") {
        getRealtimeTrends().then((data => { populateRealtimeTrends(data) }));
    }
    else if (location.hash == "#hdx") {
        getHDX().then((data => { populateHDX(data) }));
    }
}


function loading() {
    $(".scroller").html("");
    $(".scroller").html(`
        <div class="d-flex align-items-center">
            <strong>Loading...</strong>
            <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
        </div>
    `);
}




function normalizeGDELT(results) {
    arr = []
    for (index in results) {
        if (results[index].articles) {
            results[index].articles.forEach(item => {
                var item_index = arr.findIndex(x => x.link == item.url);
                if (item_index === -1) {
                    var mDate = item.seendate.slice(0, 4) + "-" + item.seendate.slice(4, 6) + "-" + item.seendate.slice(6, 8)
                        + " " + item.seendate.slice(9, 11) + ":" + item.seendate.slice(11, 13)
                        + ":" + item.seendate.slice(13, 15);
                    var unixtime = Date.parse(mDate);
                    arr.push({ "title": item.title.replaceAll(" - ", "-").replaceAll(" %", "%").replaceAll(" .", "."), "created": unixtime, "link": item.url, "source": item.domain, "thumbnail": item.socialimage })
                }
            });
        }
    }
    arrr = arr.sort(function (a, b) {
        return b.created - a.created;
    });
    return arrr
}
function normalizeRedditData(results) {
    arr = []
    for (index in results) {
        results[index].data.children.forEach(item => {
            var item_index = arr.findIndex(x => x.link == item.data.url);
            if (item.data.url.includes("youtube") || item.data.url.includes("youtu.be") || item.data.url.includes("twitter.com") || item.data.url.includes("redd.it") || item.data.url.includes("reddit.com") || item.data.url.includes("imgur.com") || item.data.url.includes("gfycat.com")) {
                //do nothing
            } else {
                if (item_index === -1) {
                    arr.push({
                        "title": item.data.title,
                        "created": item.data.created,
                        "link": item.data.url,
                        "source": item.data.domain,
                        "thumbnail": item.data.thumbnail,
                    })
                }
            }
        });
    }
    arrr = arr.sort(function (a, b) {
        return b.created - a.created;
    });
    return arrr;
}

function getLatest() {
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("LatestNews")) {
            urls = ["https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&sort=hybridrel&format=json&maxrecords=20&query=sourcelang:eng%20sourcecountry:India&timespan=1h",
                "https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&sort=datedesc&format=json&maxrecords=5&query=sourcelang:eng%20domainis:foxnews.com",
                "https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&sort=datedesc&format=json&maxrecords=5&query=sourcelang:eng%20domainis:cnn.com",
                "https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&sort=datedesc&format=json&maxrecords=5&query=sourcelang:eng%20domainis:forbes.com",
                "https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&sort=datedesc&format=json&maxrecords=5&query=sourcelang:eng%20domainis:yahoo.com",
                "https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&sort=datedesc&format=json&maxrecords=5&query=sourcelang:eng%20domainis:thediplomat.com",
            ]
            async.mapLimit(urls, 11, async function (url) { try { const response = await fetch(url); return response.json() } catch (err) { return {} } }, (err, results) => { response = normalizeGDELT(results); setLocalStorage("LatestNews", response, 5 * 60000); resolve(response) })
            } else {
                resolve(getLocalStorage("LatestNews"));
            }
        } catch (err) { reject(err) }
    })
}
function getTop() {
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("TopNews")) {
                urls = [`https://www.reddit.com/r/worldnews+technology+business+finance+science+news+technews+economy/top/.json?t=day&limit=100`,
                    'https://www.reddit.com/r/worldnews+technology+business+finance+science+news+technews+economy/top/.json?t=hour&limit=100',
                    'https://www.reddit.com/r/worldnews+technology+business+finance+science+news+technews+economy/hot/.json?&t=day&limit=100',
                    'https://www.reddit.com/r/worldnews+technology+business+finance+science+news+technews+economy/hot/.json?&t=hour&limit=100']
                async.mapLimit(urls, 4, async function (url) { try { const response = await fetch(url); return response.json() } catch (err) { return {} } }, (err, results) => { response = normalizeRedditData(results); setLocalStorage("TopNews", response, 15 * 60000); resolve(response) })
            } else {
                resolve(getLocalStorage("TopNews"));
            }
        } catch (err) { reject(err) }
    })
}
function populate_Latest_Top(data) {
    $(".scroller").html(``);
    if (!location.hash || location.hash == "#" || location.hash == "" || location.hash.toLowerCase() == "#latest") {
        var $listItem = $(`<h5 class="mb-2 fw-bold text-dark">Latest News</h5>`);
    } else {
        var $listItem = $(`<h5 class="mb-2 fw-bold text-dark">Top News</h5>`);
    }   
    $(".scroller").append($listItem);
    try {       
        $.each(data, function (k, v) {
            let imgsrc = v.thumbnail ? v.thumbnail : ``
            var $listItem = $(`                    
            <li class="list-group-item mb-1">  
                    <img src="https://icon.horse/icon/${v.source.replace("www.", "")}" alt="${v.source}" width='24px' height="24px" style="object-fit: cover" onerror='imgError(this)' class="me-1"/>
                    <span class="mb-0 mt-0 fw-bold">${v.title} - <a href="${v.link}" class="" target="_blank">${v.source}</a></span>                   
            </li>
            `);
            //var $listItem = $(`                    
            //<li class="list-group-item mb-1">                                        
            //    <div class="d-flex gap-2 w-100 justify-content-start">
            //        <img src="https://icon.horse/icon/${v.source.replace("www.", "")}" alt="${v.source}" width='24px' height="24px" style="object-fit: cover" onerror='imgError(this)' class="me-1"/>
            //        <div>
            //            <h6 class="mb-0 mt-0 fw-bold">${v.title}</h6> 
            //            <p class="mb-0 mt-0 small"><a href="${v.link}" class="" target="_blank">${v.source}</a></p> 
            //        </div>                    
            //    </div>
            //</li>
            //`);
            //$listItem.on("click", function (e) {
            //    $("#modalTitle").html("");
            //    $("#modalBody").html("");
            //    getArticleExtract(v.link);
            //});
            $(".scroller").append($listItem);
        })
    } catch (err) {

    }
}

// Trending Searches
function getGoogleSearchTrends() {
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("GoogleSearchTrends")) {
                urls = ["https://trends.google.com/trends/api/dailytrends?hl=en-IN&geo=IN&ns=15",                    
                ]
                async.mapLimit(urls, 1, async function (url) {
                    try {
                        const response = await fetch("https://sbcors.herokuapp.com/" + url)
                        return response.text()
                    } catch (err) {
                        return ")]}',"
                    }
                }, (err, results) => {
                    // all = [];
                    arr = [];
                    results.forEach(item => {
                        arr.push(JSON.parse(item.replace(")]}',", "")))
                    })
                    // response = 	arr.filter((v,i,a)=>a.findIndex(t=>(t.title === v.title))===i)
                    setLocalStorage("GoogleSearchTrends", arr, 60 * 60000);
                    resolve(arr);
                })

            } else {
                resolve(getLocalStorage("GoogleSearchTrends"));
            }
        } catch (err) { reject(err) }
    })
}
function populateGoogleSearchTrends(data) {
    $(".scroller").html(``);
    var arr = [];
    $.each(data, function (k, v) {
        $.each(v.default.trendingSearchesDays, function (i, j) {
            $.each(j.trendingSearches, function (a, b) {
                arr.push({
                    "title": b.title,
                    "traffic": b.formattedTraffic,
                    "articles": b.articles,
                    "image": b.image.imageUrl,
                    "date": Date.parse(j.formattedDate),
                    "formattedDate": j.formattedDate

                })
            })

        })
    });
    arr = arr.sort(function (a, b) {
        return b.date - a.date;
    });
    var $listItem = $(`<h4 class="mt-4 fw-bold text-main ms-2">Trending Searches</h4>`);
    $(".scroller").append($listItem);
    $.each(arr, function (k, v) {
        let imgsrc = v.image ? `<img src="${v.image}" alt="" width="96" height="96" class="rounded sqimg d-flex justify-content-end" onerror='imgError(this)' />` : ``
        let article0imgsrc = v.articles[0].image ? v.articles[0].image.imageUrl : ``
        var $listItem = $(`
        <li class="list-group-item border-bottom mb-0" style="cursor:pointer"> 
                <div class="d-flex gap-2 w-100 justify-content-between">
                    <div>  
                        <p class="mb-0 mt-1 small">${v.formattedDate} | ${v.traffic} Searches</p>
                        <!--<img src="${article0imgsrc}" alt="" width="72" height="72" class="rounded" onerror='imgError(this)' />-->
                        <p class="mb-0 mt-0 fw-bold">${v.title.query}</p>
                        <p class="mt-0 mb-0">${v.articles[0].snippet}</p>
                        <details>
                            <summary><span class="mt-0 ">Explore</span></summary>
                            <ul class="list-group list-group-flush mt-3 ms-3" id="${k}GoogleSearchTrends">
                            </ul> 
                        </details>                   
                    </div>                  
                </div>   
        </li>`);
        $(".scroller").append($listItem);
        $.each(v.articles.slice(1), function (a, b) {
            let imgsrc1 = b.image ? b.image.imageUrl : ``
            var $listItem = $(
                `<div class="d-flex gap-2 w-100 justify-content-between mb-2">
                    <details>
                        <summary><span class="">${b.title}</span></summary>
                        <div class="d-flex gap-2 w-100 justify-content-between mb-2 mt-2">
                            <p class="small fw-bold">${b.snippet} <span class="text-muted"><a href="${b.url}" target="_blank" style="color:blue;text-decoration:underline">Read full article at ${b.source}</span></p>                                      
                        </div>                                                                           
                    </details>
                </div>`);
            $(`#${k}GoogleSearchTrends`).append($listItem);
        });
    })
}

// Trending Wiki
function getWikiData() {
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("WikiData")) {
                const start = Date.now()
                var MyDate = new Date();
                year = MyDate.getFullYear();
                month = ('0' + (MyDate.getMonth() + 1)).slice(-2);
                day = ('0' + (MyDate.getDate())).slice(-2);
                let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`;
                urls = [url]
                async.mapLimit(urls, 1, async function (url) {
                    try {
                        const response = await fetch(url)
                        return response.json()
                    } catch (err) {
                        return {}
                    }

                }, (err, results) => {
                    if (err) { console.log(err); } else {
                        wiki = {}
                        arr = []
                        $.each(results[0].mostread.articles, function (k, v) {
                            arr.push({ title: v.displaytitle, thumbnail: v.thumbnail, extract: v.extract, description: v.description, views: v.views, link: v.content_urls.desktop.page });
                        });
                        wiki.mostread = arr;
                        otd = []
                        $.each(results[0].onthisday, function (k, v) {
                            pages = []
                            $.each(v.pages, function (i, j) {
                                let thumbnail = j.thumbnail ? j.thumbnail.source : ``
                                pages.push({
                                    title: j.displaytitle,
                                    thumbnail: thumbnail,
                                    extract: j.extract,
                                    description: j.description,
                                    link: j.content_urls.desktop.page
                                })
                            });
                            otd.push({
                                title: v.text,
                                year: v.year,
                                pages: pages
                            });
                        });
                        wiki.otd = otd;
                        wiki.image = {
                            "thumbnail": results[0].image.thumbnail.source,
                            "artist": results[0].image.artist.text,
                            "description": results[0].image.description.text,
                        }
                        var thumbnail = results[0].tfa.thumbnail ? results[0].tfa.thumbnail.source : ``
                        wiki.tfa = {
                            "title": results[0].tfa.displaytitle,
                            "thumbnail": thumbnail,
                            "content": results[0].tfa.extract,
                            "description": results[0].tfa.description.text,
                            "link": results[0].tfa.content_urls.desktop.page,
                        }
                        setLocalStorage("WikiData", wiki, 60 * 60000);
                        resolve(wiki)
                    }

                })
            } else {
                resolve(getLocalStorage("WikiData"));
            }
        } catch (err) { reject(err) }
    })
}
function populateWiki(data) {
    $(".scroller").html(``);
    var $listItem = $(`<h4 class="mt-4 mb-4 fw-bold ms-2">Most Read Articles, Featured and On this day</h4>`);
    $(".scroller").append($listItem);
    $(".scroller").append(`
    <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active" id="mostread-tab" data-bs-toggle="tab" data-bs-target="#mostread" type="button" role="tab" aria-controls="mostread" aria-selected="true">Most Read</button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="featured-tab" data-bs-toggle="tab" data-bs-target="#featured" type="button" role="tab" aria-controls="featured" aria-selected="false">Featured</button>
        </li>     
        <li class="nav-item" role="presentation">
        <button class="nav-link" id="otd-tab" data-bs-toggle="tab" data-bs-target="#otd" type="button" role="tab" aria-controls="otd" aria-selected="false">OTD</button>
    </li>   
    </ul>
    <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="mostread" role="tabpanel" aria-labelledby="mostread-tab"></div>
        <div class="tab-pane fade" id="featured" role="tabpanel" aria-labelledby="featured-tab"></div> 
        <div class="tab-pane fade" id="otd" role="tabpanel" aria-labelledby="otd-tab"></div>       
    </div>
    `);
    var mostread = data.mostread
    $.each(mostread, function (k, v) {
        let imgsrc = v.thumbnail ? v.thumbnail.source : ``
        var $listItem = $(`                    
        <li class="list-group-item border-0 border-bottom mb-1" >                                        
            <div class="d-flex gap-2 w-100 justify-content-between">
                <div>
                    <p class="mb-0 mt-1 small">Views: ${v.views.toLocaleString("en-GB")}</p>
                    <p class="mb-0 mt-0 fw-bold">${v.title} <span class="small">(${v.description})</span></p>
                </div>
            </div>
            <div>
                <details>
                    <summary><span class="smaller">Read more about ${v.title}</span></summary>
                    <p class="mb-0 mt-1 small">${v.extract}</p>
                    <p class="mb-0 mt-1 small"><a href="${v.link}" target="_blank">Read full article on Wikipedia</a></p>
                </details>
            </div>
        </li>
        `);
        $("#mostread").append($listItem);
    });
    var image = data.image
    let imgsrc = image.thumbnail ? image.thumbnail : ``
    var $listItem = $(`                    
                    <li class="list-group-item  mt-4 mb-1">   
                        <div class="card" style="width:100%;">                            
                            <div class="card-body">
                                <p class="mt-0 fw-bold">${image.description}</p> 
                                <p class="mt-1 mb-0 small fw-bold">Artist: ${image.artist}</p>
                            </div>
                            <img src="${imgsrc}" class="card-img-top" alt="" onerror='imgError(this)' />                                   
                            </div>                            
                        </div>
                    </li>
                    `);
    $("#featured").append($listItem);
    var tfa = data.tfa
    let taimgsrc = tfa.thumbnail ? tfa.thumbnail : ``
    var $listItem = $(`                    
                    <li class="list-group-item mb-1">   
                        <div class="card mt-4" style="width:100%;">  
                            <div class="card-body"> 
                                <h5 class="mt-0 fw-bold">${tfa.title}</h5> 
                                <p class="mt-1 mb-0 small fw-bold">${tfa.content}</p>
                            </div> 
                            <img src="${taimgsrc}" class="card-img-top" alt="" onerror='imgError(this)' />
                            </div>
                        </div>
                    </li>
                    `);
    $("#featured").append($listItem);


    $.each(data.otd, function (k, v) {
        var details = ""
        $.each(v.pages, function (i, j) {
            details += `<div class="d-flex gap-2 w-100 justify-content-between my-1">
            <div>
                <details class="ms-4" style="cursor:pointer"><summary class="mb-0 mt-0">${j.title} (<small>${j.description}</small>)                          
                </summary>
                <p class="mb-0 mt-0 small">${j.extract}</p>  
                <p class="mb-0 mt-0 small"><a href="${j.link}" target="_blank">Read full article on Wikipedia</a></p>   
                </details>                                                        
            </div>           
        </div>`
        });
        var $listItem = $(`                    
        <li class="list-group-item border-bottom mb-1" >                                        
            <div class="d-flex gap-2 w-100 justify-content-between">
                <div>
                    <p class="mb-0 mt-1">${v.year}</p> 
                    <details class="top-details" style="cursor:pointer"><summary class="mb-0 mt-0 fw-bold">${v.title}             
                    </summary>
                        ${details}
                    </details>                                                        
                </div>
               
            </div>	
           
        </li>
        `);
        $("#otd").append($listItem);
    });
}

// Realtime Trends
function getRealtimeTrends() {
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("GoogleTrends")) {
                const start = Date.now()                
                var param = "";
                if (country && language) {
                    param = `hl=${language}-${country}&tz=0&fi=0&fs=0&geo=${country}&ri=300&rs=20&sort=0`
                    urls = [
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=h`,
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=e`,
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=t`,
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=b`,
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=s`,
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=m`,
                    ]
                } else {
                    urls = [
                        "https://trends.google.com/trends/api/realtimetrends?cat=h",
                        "https://trends.google.com/trends/api/realtimetrends?cat=e",
                        "https://trends.google.com/trends/api/realtimetrends?cat=t",
                        "https://trends.google.com/trends/api/realtimetrends?cat=b",
                        "https://trends.google.com/trends/api/realtimetrends?cat=s",
                        "https://trends.google.com/trends/api/realtimetrends?cat=m",
                    ]
                }             
                async.mapLimit(urls, 6, async function (url) {
                    try {
                        const response = await fetch("https://sbcors.herokuapp.com/" + url)
                        return response.text()
                    } catch (err) {
                        return "{)]}'}"
                    }

                }, (err, results) => {
                    if (err) { console.log(err); }
                    else {
                        // all = [];
                        arr = [];
                        articles = []
                        for (index in results) {
                            try {
                                if (results[index]) {
                                    response = JSON.parse(results[index].replace(")]}'", ""));
                                    response.storySummaries.trendingStories.forEach(item => { arr.push(item) });
                                }
                            } catch (err) {
                                console.trace(err);
                            }
                        }
                        response = arr.filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i)
                        setLocalStorage("GoogleTrends", response, 60 * 60000);
                        resolve(response);
                    };
                })

            } else {
                resolve(getLocalStorage("GoogleTrends"));
            }
        } catch (err) { reject(err) }
    })
}
function populateRealtimeTrends(data) {
    $(".scroller").html(``);
    var $listItem = $(`<h4 class="mt-4 fw-bold ms-2">Realtime trends</h4>`);
    $(".scroller").append($listItem);
    $.each(data, function (k, v) {       
        var $listItem = $(`
        <li class="list-group-item border-bottom mb-0" style="cursor:pointer"> 
                <div class="d-flex gap-2 w-100 justify-content-between">
                    <div>                                                                              
                        <details>
                            <summary class="mt-0 fw-bold">${v.title}</summary>
                            <ul class="list-group list-group-flush mt-3" id="${k}googleTrends">
                            </ul> 
                        </details>                   
                    </div>
                   
                </div>   
        </li>`);
        $(".scroller").append($listItem);
        $.each(v.articles, function (a, b) {
            var $listItem = $(
                `<div class="d-flex gap-2 w-100 justify-content-between mb-2 ms-2">
                            <details>
                                <summary><span class="">${b.articleTitle}</span></summary>
                                <div class="d-flex gap-2 w-100 justify-content-between mt-2">
                                    <p class="small fw-bold">${b.snippet} <span class="text-muted"><a href="${b.url}" target="_blank" style="color:blue;text-decoration:underline">Read full article at ${b.source}</span></p>                                      
                                </div>                                                                           
                             </details> 
                            </div>`);
            $(`#${k}googleTrends`).append($listItem);
        });
    })
}


async function fetchURL(url) {
    const response = await fetch(url);
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        return { success: 1, urlfetched: url, data: data }
    } catch (err) {
        return { success: 0, urlfetched: url, error: err, response: text }
    }
}

function imgErrorloadicon(image, hostname) {
    $(image).hide();
}

//HDX
function getHDX() {

    return new Promise((resolve, reject) => {
        var urls = ["https://data.humdata.org/api/3/action/package_search?&rows=100"]
        async.mapLimit(urls, 1, async function (url) {
            try {
                const response = await fetch(url)
                return response.json()
            } catch (err) {
                console.log(err.response);
            }
        }, (err, results) => {
            if (err) { console.log(err); reject(err)} else {
                resolve(results);

                     }

        })
    })
    
}
function populateHDX(results) {
    $(".scroller").html(``);
    var $listItem = $(`<h4 class="mt-4 fw-bold ms-2">HDX</h4>`);
    $(".scroller").append($listItem);
    $.each(results, function (k, v) {
        if (k == 0) {
            $.each(results[0].result.results, function (k, v) {
                var timediff = new Date(v.last_modified).toLocaleString();
                let title = v.title ? v.title : ``
                let notes = v.notes ? v.notes : ``
                let org = v.dataset_source ? v.dataset_source : ``
                var $listItem = $(`
                        <li class="list-group-item mb-1">
                            <div class="d-flex gap-2 w-100 justify-content-between">
                                <div>
                                    <p class="mb-0 mt-1 opacity-75 small">${org}</p>   
                                    <h5 class="mb-0 mt-0 fw-bold">${title}</h5>  
                                    <p class="mb-0 mt-2 small">${notes.slice(0, 200)}...</p>
                                    <p class="mb-0 mt-1 opacity-75 small">${timediff}</p>
                                </div>
                            </div>                                                                             
                        </li>`);
                $listItem.on("click", function (e) {
                    //    
                });
                $(".scroller").append($listItem);
            });
        }
    })
}