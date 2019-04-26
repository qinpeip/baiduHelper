const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
let win = null
function createWindow () {

  // 创建window对象
  win = new BrowserWindow({width: 662, height: 442, frame: false})
  // 加载html
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    })
  );
  // 打开开发者工具
  // win.webContents.openDevTools()
  // 当窗口关闭的时候会触发的事件
  win.on('closed', () => win = null)
}

// electorn 初始化后, 部分api才可以调用, 所以在初始化以后才执行创建窗口的函数
app.on('ready', createWindow)
