# Raycast Extension of MarginNote
[ [English](./README.md) ]

## Installation
### use the `.zip` file
1. 从[发布页面](https://github.com/moziar/MarginNote-raycast-extension/releases)下载 `.zip` 文件。
2. 解压 `.zip` 文件。
3. 使用 Raycast 命令 `Import Extension` 来安装扩展。

### Build from source
1. 克隆这个仓库。
2. 确保你已经安装了 [node.js](https://nodejs.org/en/download/) 和 [npm](https://www.npmjs.com/get-npm)。
3. 运行 `npm install @raycast/api` 来安装 Raycast API。
4. 运行 `npm run build` 来构建扩展。
5. 使用 Raycast 命令 `Import Extension` 并选择 `dist` 文件夹来安装扩展。

## Usage
### First of All
有两个选项可以帮助您在通过此扩展打开 MarginNote 时自动跳过未签名插件的警告。

1. Skip Alert
2. Waiting Time: 等待 MarginNote 启动，取决于你电脑 MN 的启动时间.

### Search Notebook
> **Note**
>
> 需要安装 [Raycast Enhance](https://github.com/marginnoteapp/raycast-enhance/releases) 插件和最新版本 MarginNote 4。

通过名字搜索笔记本，并且直接打开。支持脑图笔记本和卡片组笔记本。

### Take Note
通常用于从其他应用程序中摘录一些文本，并在 MarginNote 中记录。

**特性**
- 自动摘录选中文字。
- 自动摘录网站链接，支持 `Safari`, `Arc`, `Chrome`, `Edge`.

**设置**
- Show confetti: 成功创建笔记时展示五彩纸屑庆祝成功。
- 你可以设置 5 个父卡片链接，新创建的笔记将作为父卡片的子卡片。可以通过 `别名=链接` 的方式设置父卡片的别名。
- 你还可以设置任意多的常用标签，方便直接选择。

### Restart MarginNote
快速重新启动 MarginNote，这对你开发 MN 插件很有帮助。

## License

<a href="https://github.com/marginnoteapp/raycast/blob/main/LICENSE">MIT</a> © <a href="https://github.com/marginnoteapp"><img src="https://testmnbbs.oss-cn-zhangjiakou.aliyuncs.com/pic/mn.png?x-oss-process=base_webp" alt="MarginNote" width="80"></a>