// Based on MakkaPakka loadVarietyShows. Original attribution retained.
var WidgetMetadata = {
  "id": "tudousaha.makka.variety",
  "title": "玛卡综艺 · 最近更新",
  "author": "MakkaPakka；修改：土豆萨哈",
  "description": "基于玛卡巴卡综艺频道；每区最多60档候选按最近一集日期排序，无天数限制。",
  "version": "1.1.2",
  "requiredVersion": "0.0.1",
  "site": "https://github.com/zwjtano/rex-tudousaha",
  "modules": [
    {
      "id": "loadVarietyShows",
      "title": "综艺 · 最近更新",
      "functionName": "loadVarietyShows",
      "type": "video",
      "cacheDuration": 1800,
      "params": [
        {
          "name": "sort_by",
          "title": "地区",
          "type": "enumeration",
          "value": "cn",
          "enumOptions": [
            {
              "title": "国内",
              "value": "cn"
            },
            {
              "title": "韩国",
              "value": "kr"
            },
            {
              "title": "日本",
              "value": "jp"
            },
            {
              "title": "欧美",
              "value": "eu_us"
            }
          ]
        },
        {
          "name": "list_type",
          "title": "排序",
          "type": "enumeration",
          "value": "new",
          "enumOptions": [
            {
              "title": "最近更新",
              "value": "new"
            },
            {
              "title": "热度",
              "value": "hot"
            },
            {
              "title": "高分",
              "value": "top"
            }
          ]
        },
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "startPage": 1
        }
      ]
    }
  ]
};
function getGlobalGenreText(){return "综艺";}
async function loadMakkaOriginal(params = {}) {
    const page = parseInt(params.page) || 1;
    const region = params.sort_by || "cn";
    const list_type = params.list_type || "hot";

    const varietyGenres = "10764|10767";

    const varietyRegionMap = {
        "all": "", "cn": "CN", "kr": "KR", "jp": "JP",
        "tw": "TW", "hk": "HK", "eu_us": "US|GB|DE|FR|IT|ES|CA|AU"
    };
    const originCountry = varietyRegionMap[region] || "";

    let queryParams = { language: "zh-CN", page: page, with_genres: varietyGenres, include_adult: false };
    if (originCountry) queryParams.with_origin_country = originCountry;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    let tmrw = new Date(now); tmrw.setDate(tmrw.getDate() + 1);
    const tomorrowStr = tmrw.toISOString().split('T')[0];
    let fiveYearsAgo = new Date(now); fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const fiveYearsAgoStr = fiveYearsAgo.toISOString().split('T')[0];

    if (list_type === "today") {
        queryParams.sort_by = "popularity.desc"; queryParams["air_date.gte"] = todayStr; queryParams["air_date.lte"] = todayStr;
    } else if (list_type === "tomorrow") {
        queryParams.sort_by = "popularity.desc"; queryParams["air_date.gte"] = tomorrowStr; queryParams["air_date.lte"] = tomorrowStr;
    } else if (list_type === "hot") {
        queryParams.sort_by = "popularity.desc";
    } else if (list_type === "trend") {
        queryParams.sort_by = "popularity.desc"; queryParams["first_air_date.gte"] = fiveYearsAgoStr;
    } else if (list_type === "top") {
        queryParams.sort_by = "vote_average.desc"; queryParams["vote_count.gte"] = 15;
    }

    try {
        const res = await Widget.tmdb.get("/discover/tv", { params: queryParams });
        const items = res.results || [];
        if (items.length === 0) return page === 1 ? [{ id: "empty", type: "text", title: "暂无综艺数据" }] : [];
        return items.map(item => {
            const date = item.release_date || item.first_air_date || "";
            let genreLabel = getGlobalGenreText(item.genre_ids);
            if (genreLabel === "影视") genreLabel = "综艺";
            return {
                id: String(item.id), tmdbId: parseInt(item.id), type: "tmdb", mediaType: "tv", title: item.title || item.name,
                genreTitle: genreLabel, releaseDate: date,
                subTitle: `${date ? date.substring(0, 4) : "未知"}`,
                description: item.overview || "",
                posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
                backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : ""
            };
        });
    } catch (e) { return [{ id: "err", type: "text", title: "加载失败" }]; }
}


// TMDB has no global last-episode sorting. Sort a stable, cached pool of up to
// 60 popular candidates per region, then paginate that sorted pool.
var makkaRecentCache = {};
var makkaRecentPending = {};
async function makkaMapLimit(items, fn) {
    var output = new Array(items.length), cursor = 0;
    async function worker() {
        while (cursor < items.length) {
            var index = cursor++;
            output[index] = await fn(items[index]);
        }
    }
    await Promise.all(Array.from({length: Math.min(4, items.length)}, worker));
    return output;
}
async function makkaRecentPool(region) {
    var countries = {cn:'CN', kr:'KR', jp:'JP', eu_us:'US|GB|DE|FR|IT|ES|CA|AU'};
    var candidates = [], seen = {};
    for (var page = 1; page <= 3; page++) {
        var res = await Widget.tmdb.get('/discover/tv', {params:{language:'zh-CN',page:page,
            with_genres:'10764|10767',with_origin_country:countries[region],
            include_adult:false,sort_by:'popularity.desc'}});
        if (!res || !Array.isArray(res.results)) throw new Error('TMDB 列表响应无效');
        res.results.forEach(function(item){if(!seen[item.id]){seen[item.id]=true;candidates.push(item);}});
        if (!res.results.length || page >= res.total_pages) break;
    }
    var today = new Date().toISOString().slice(0,10), failures = 0;
    var items = await makkaMapLimit(candidates, async function(item){
        var date = '', poster = item.poster_path || '';
        try {
            var detail = await Widget.tmdb.get('/tv/'+item.id,{params:{language:'zh-CN'}});
            var episode = detail && detail.last_episode_to_air;
            if (episode && /^\d{4}-\d{2}-\d{2}$/.test(episode.air_date) && episode.air_date <= today) {
                date=episode.air_date;
                // Match the aired episode, never the highest (possibly unaired) season.
                if (Number.isInteger(episode.season_number) && episode.season_number >= 0 && Array.isArray(detail.seasons)) {
                    var season = detail.seasons.find(function(s){return s.season_number === episode.season_number;});
                    if (season && season.poster_path) poster = season.poster_path;
                }
            }
        } catch(e) { failures++; }
        return {id:String(item.id),tmdbId:Number(item.id),type:'tmdb',mediaType:'tv',title:item.name||item.title,
            genreTitle:'综艺',releaseDate:item.first_air_date||'',
            subTitle:date ? '更新 '+date : '更新日期未知',description:item.overview||'',
            posterPath:poster?'https://image.tmdb.org/t/p/w500'+poster:'',
            backdropPath:item.backdrop_path?'https://image.tmdb.org/t/p/w780'+item.backdrop_path:'',
            _updated:date,_popularity:Number(item.popularity)||0};
    });
    if (candidates.length && failures===candidates.length) throw new Error('更新日期查询失败，请重试');
    items.sort(function(a,b){return b._updated.localeCompare(a._updated)||b._popularity-a._popularity||Number(a.id)-Number(b.id);});
    return items.map(function(item){delete item._updated;delete item._popularity;return item;});
}
async function loadVarietyShows(params) {
    params = params || {};
    if (params.list_type && params.list_type !== 'new') return loadMakkaOriginal(params);
    var region = params.sort_by || 'cn';
    if (!['cn','kr','jp','eu_us'].includes(region)) throw new Error('未知综艺地区');
    var page = Math.max(1,parseInt(params.page,10)||1);
    if (page > 3) return [];
    var cached = makkaRecentCache[region];
    if (!cached || Date.now()-cached.time >= 1800000) {
        if (!makkaRecentPending[region]) {
            makkaRecentPending[region] = makkaRecentPool(region).then(function(items){
                makkaRecentCache[region]={time:Date.now(),items:items};return items;
            }).finally(function(){delete makkaRecentPending[region];});
        }
        await makkaRecentPending[region];
        cached = makkaRecentCache[region];
    }
    return cached.items.slice((page-1)*20,page*20);
}
