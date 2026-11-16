WidgetMetadata = {
  "id": "tudousaha.variety.charts",
  "title": "土豆萨哈 · 分区综艺榜",
  "description": "骨朵国内榜与豆瓣海外榜，按TMDB国家信息分组。",
  "author": "土豆萨哈",
  "version": "1.0.1",
  "requiredVersion": "0.0.1",
  "modules": [
    {
      "id": "countryCharts",
      "title": "分区综艺榜",
      "functionName": "countryCharts",
      "type": "video",
      "cacheDuration": 1800,
      "params": [
        {
          "name": "region",
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
              "value": "western"
            }
          ]
        },
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "startPage": 1
        }
      ],
      "description": "国内使用骨朵热榜；海外按TMDB国家信息拆分豆瓣榜单，按更新日期排列。",
      "requiresWebView": false
    }
  ],
  "site": "https://github.com/zwjtano/rex-tudousaha",
  "iconurl": "https://github.com/zwjtano.png"
};

var chartBase='https://raw.githubusercontent.com/MakkaPakka518/List/refs/heads/main/data/';
var chartRegions={kr:['KR'],jp:['JP'],western:['US','CA','GB','FR','DE','IT','ES','SE','NO','DK','FI','NL','BE','CH','AT','IE','PT','PL','IS']};
async function chartJson(file){var r=await Widget.http.get(chartBase+file);var d=r && r.data!==undefined?r.data:r;return typeof d==='string'?JSON.parse(d):d;}
function chartImage(p,size){return !p?'':/^https?:\/\//.test(p)?p:'https://image.tmdb.org/t/p/'+size+p;}
function chartVideo(x){var id=Number(x.tmdbId||x.id);return {id:String(id),tmdbId:id,type:'tmdb',mediaType:'tv',title:x.title||x.name||'未命名节目',posterPath:chartImage(x.posterPath,'w500'),backdropPath:chartImage(x.backdropPath,'w780'),releaseDate:x.releaseDate||'',rating:Number(x.rating)||0,description:(x.lastUpdateDate?'榜单标记更新：'+x.lastUpdateDate+'\n':'')+(x.description||''),genreTitle:x.genreTitle||'综艺'};}
async function countryCharts(params){params=params||{};var region=params.region||'cn';if(region!=='cn'&&!chartRegions[region])throw Error('不支持的地区');var page=Math.max(1,parseInt(params.page,10)||1);var d=await chartJson(region==='cn'?'guduo-hot.json':'douban-hot.json');var list=region==='cn'?d&&d.categories&&d.categories['综艺']:d&&d.show_foreign;if(!Array.isArray(list))throw Error('榜单数据格式异常');var seen={};list=list.filter(function(x){var id=Number(x.tmdbId||x.id);if(!Number.isInteger(id)||id<=0||seen[id])return false;seen[id]=true;return true;});
if(region!=='cn'){
 var matched=[];var failures=0;
 for(var offset=0;offset<list.length;offset+=4){var batch=await Promise.all(list.slice(offset,offset+4).map(async function(x){try{var detail=await Widget.tmdb.get('/tv/'+Number(x.tmdbId||x.id),{params:{language:'zh-CN'}});var countries=detail&&detail.origin_country;if(!Array.isArray(countries)||!countries.length)throw Error('缺少国家信息');return countries.some(function(c){return chartRegions[region].indexOf(c)>=0;})?x:null;}catch(e){failures++;return null;}}));matched=matched.concat(batch.filter(Boolean));}
 if(failures)throw Error('有 '+failures+' 个节目国家信息查询失败，请稍后刷新，避免显示不完整榜单');
 list=matched.sort(function(a,b){var da=Date.parse(a.lastUpdateDate||a.releaseDate)||0,db=Date.parse(b.lastUpdateDate||b.releaseDate)||0;return db-da;});
}
if(!list.length&&page===1)return [{id:'empty-'+region,type:'text',title:'当前榜单暂无该地区节目',description:'只展示现成榜单收录的节目，不用历史热度榜补齐。'}];
return list.slice((page-1)*24,page*24).map(chartVideo);
}
