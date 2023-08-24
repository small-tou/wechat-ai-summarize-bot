# 微信群聊总结助手 Nodejs 版

[EN Ver: WeChat Group Chat Summary Assistant Nodejs Version](./README_EN.md)

## 项目介绍

本项目是基于微信机器人的微信群聊总结助手，可以帮助群主或管理员自动收集群聊中的聊天记录，并使用 AI 进行总结，最终将其发送到指定的群聊中。

> 这可能是最简单配置可以把完整功能跑起来的项目，因为尝试了几个项目，都不是很能搞得定，所以用 JS 简单封装了下

效果预览

<img src="https://github.com/aoao-eth/wechat-summarize-bot/assets/897401/f3220210-3b7e-411f-8e2e-801f82a0b5da" width="300" />

## 运行

1. 安装依赖

```bash
npm install
```

2. 设置 env 环境变量

```bash
cp .env.example .env
```

.env 中有两个变量，这两个变量代表两个平台，接下来会分别介绍如何获取这两个变量的值。

3. 获取 PADLOCAL_API_KEY

注册 http://pad-local.com 获取一个七天试用的账号，创建应用，然后在 .env 中填入 api key

```bash
PADLOCAL_API_KEY=puppet_padlocal_xxxxxx
```

4. 获取 DIFY_API_KEY

注册 https://dify.ai 账号
创建一个“文本生成”应用，创建完成后，在应用的“访问 api”菜单中，点击“api 秘钥”，点击生成新的秘钥 ，然后在 .env 中填入此秘钥

```bash
DIFY_API_KEY=xxxxxx
```

之后，在提示词编排中，在下拉框中选择模型“Claude-2”，平台免费送了一些免费的调用次数约200次，然后在 Prompt 内容中填入：

```
你是一个中文的群聊总结的助手，你可以为一个微信的群聊记录，提取并总结每个时间段大家在重点讨论的话题内容。

请帮我将给出的群聊内容总结成一个今日的群聊报告，包含不多于10个的话题的总结（如果还有更多话题，可以在后面简单补充）。每个话题包含以下内容：
- 话题名(50字以内，带序号，同时附带热度，以🔥数量表示）
- 参与者(不超过5个人，将重复的人名去重)
- 时间段(从几点到几点)
- 过程(50到200字左右）
- 评价(50字以下)

另外有以下要求：
1. 为每个话题结束添加分隔符 ------------
2. 使用中文冒号

最终标题《亲爱的，这是对今天大家群聊的总结报告》

以下是群聊内容
```
点击右上角“发布”。
![](./static/1.jpg)

5. 设置支持命令触发总结的群名
```bash
MONITOR_ROOMS=群名（目前只支持一个）
```

6. 运行微信监控程序

```bash
npm run watch
```

此时会弹出一个二维码，使用微信扫码登录，登录成功后，程序将持续抓取所有群聊的聊天记录，聊天记录会保存在本地文件中，位置在 data/日期文件夹/群名.txt 中，不会上传到任何第三方。

7. 手动运行总结程序
   在每天结束的时候，手动对某个群的内容进行总结

```bash
npm run summarize ./data/2023-08-23/xxx.txt
```

## 友情链接

- [智囊 AI] https://zhinang.ai/chat
- [Dify.ai] https://dify.ai
- [PadLocal] http://pad-local.com
