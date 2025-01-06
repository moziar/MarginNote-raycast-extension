# Raycast Extension of MarginNote
[ [简体中文](./README-ZH.md) ]

## Installation
### Use the `.zip` file
1. Download the `.zip` file from the [release page](https://github.com/moziar/MarginNote-raycast-extension/releases).
2. release the `.zip` file.
3. Use the Raycast Command `Import Extension` to install the extension.

### Build from source
1. Clone this repository.
2. make sure you've installed [node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm).
3. run `npm install @raycast/api` to install the Raycast API.
4. run `npm run build` to build the extension.
5. Use the Raycast Command `Import Extension` and choose the `dist` folder to install the extension.

## Usage
### First of All
There are options to help you automatically skip alerts for unsigned mnaddon when opening MarginNote through this extension.

1. Skip Alert: As mentioned above.
2. Waiting Time: Wait for MarginNote to open.
### Search Notebook
> **Note**
>
> Please install [Raycast Enhance](https://github.com/marginnoteapp/raycast-enhance/releases) addon and latest MarginNote 3 (^3.7.21). If the `Raycast Enhance` addon is still uncerfitied, maybe you need turn `Allow uncertified extensions` on in MarginNote.
> ![](https://testmnbbs.oss-cn-zhangjiakou.aliyuncs.com/pic/20221116020801.png?x-oss-process=base_webp)

Search notebook by name and Open directly. Support mindmap noteboook and flashcard notebook.
### Take Note
Usually to be used to excerpt some text from other apps and take note in MarginNote.

**features**
- Excerpt selected text automatically.
- Excerpt browser url automatically, support `Safari`, `Arc`, `Chrome`, `Edge`.

**settings**
- Show confetti when creating note successfully to celebrate.
- You can set 5 parents note url, and the new note will be created as a child note. Alias can be set by `alias=url`
> **Note**
>
> If you don't know how to get the note url, just follow the picture step by step.
>
> ![](https://testmnbbs.oss-cn-zhangjiakou.aliyuncs.com/pic/20221116020639.png?x-oss-process=base_webp)
- You can set common tags as many as you want.
### Restart MarginNote
Restart MarginNote quickly. It's helpful when you develop mnaddon.
## License

<a href="https://github.com/marginnoteapp/raycast/blob/main/LICENSE">MIT</a> © <a href="https://github.com/marginnoteapp"><img src="https://testmnbbs.oss-cn-zhangjiakou.aliyuncs.com/pic/mn.png?x-oss-process=base_webp" alt="MarginNote" width="80"></a>