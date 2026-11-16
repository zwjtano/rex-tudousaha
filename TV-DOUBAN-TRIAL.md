# 土豆萨哈 · 豆瓣剧集更新试用版

四个地区剧集栏改为平台剧场的豆瓣热榜，排序选择最近更新（updated）。
大陆 tv_domestic、韩国 tv_korean、日本 tv_japanese、欧美 tv_american。
原华语栏暂改名大陆剧集，因为此榜不覆盖港台。最近更新优先用榜单 lastUpdateDate，缺失时回退首播日期，并非严格的最新一集排序。

首页仍叫土豆萨哈。综艺、电影、动漫、剧集类型分类和综合豆瓣热门剧集栏保持原样。
导入 tudousaha-douban-updated-home.rex；依赖既有玛卡巴卡平台剧场模块及 v1.1.0 综艺修改版，无需更新综艺。

已校验四栏映射、其他栏目不变、ZIP/JSON 完整性，尚未 Rex 实机验证。
