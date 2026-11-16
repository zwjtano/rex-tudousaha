# 玛卡综艺 · 最近更新

基于 MakkaPakka 的 `loadVarietyShows` 修改，保留作者署名和原有热度、高分查询。原模块来源：https://rex.778477.xyz/api/modules/06ee943c-b6b4-4e9c-832d-96154e69c959/raw

新增 `list_type=new`，无 90 天或其他日期范围限制。国内、韩国、日本、欧美每区从 TMDB 获取最多 60 档热门候选，逐个读取 `last_episode_to_air.air_date`，按日期倒序后分页，每页 20 档。未知或未来日期排在最后，不用首播日期冒充更新日期。缓存 30 分钟，详情并发上限 4。不是 TMDB 全库的最新更新榜；首次加载会比原版慢。

在 Rex 模块导入 JS：
https://raw.githubusercontent.com/zwjtano/rex-tudousaha/v1.1.0/makka-variety-new.js

集合订阅：
https://raw.githubusercontent.com/zwjtano/rex-tudousaha/v1.1.0/makka-collection.rex

首页包使用 `makka-variety-home.rex`，仅替换原首页四个综艺栏，其他栏目不变。先安装模块，再导入首页包。

已通过 JavaScript 语法检查、模拟 TMDB 的排序/分页/地区/缓存/失败重试测试、首页 ZIP 校验。尚未在 Rex 实机验证。

TMDB 接口文档：https://developer.themoviedb.org/reference/discover-tv
