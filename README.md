# 土豆萨哈 · Rex 分区综艺榜

将现成榜单展示为国内、韩国、日本、欧美四个综艺海报栏。

## 导入

1. 在 Rex 模块管理中导入订阅链接：
   https://raw.githubusercontent.com/zwjtano/rex-tudousaha/main/manifest.json
2. 从 Releases 下载 `tudousaha-home.rex`，导入首页配置。
3. 配套首页其他栏目仍依赖玛卡巴卡合集：https://rex.778477.xyz/api/collections/untitled.rex

模块直链：https://raw.githubusercontent.com/zwjtano/rex-tudousaha/main/variety-charts.js

## 数据与行为

- 国内：玛卡巴卡维护的骨朵综艺榜，保留榜单顺序。
- 海外：玛卡巴卡维护的豆瓣海外榜，通过 TMDB `origin_country` 分为韩国、日本、欧美；按榜单更新日期倒序，缺失时使用首播日期。
- 原榜单缺少某地区节目时显示暂无内容，不用历史热门内容补齐。
- 欧美范围在脚本中明确列出；不包含日本、韩国、澳大利亚。
- 国家信息查询失败会报错，避免静默展示残缺结果。每批最多4个查询。
- 数据依赖上游榜单及 TMDB，不保证完整覆盖所有平台，也不表示用户媒体库有资源。

## 验证状态

已通过语法、模拟国家分组、排序、去重、分页、空榜、错误处理及首页 ZIP/JSON 校验；尚未在 Rex 客户端实机验证。若首页未自动绑定，请手动选择“土豆萨哈 · 分区综艺榜 → 分区综艺榜”。

## 来源

榜单 JSON：https://github.com/MakkaPakka518/List/tree/main/data

本仓库只发布自建分组模块和配置，不包含影视资源或第三方模块源码。

## v1.0.1 兼容修正

补齐订阅 icon、脚本 site 和模块 description；元数据使用展开的 WidgetMetadata 赋值格式。提供 manifest.json 订阅入口。尚需 Rex 实机确认。
