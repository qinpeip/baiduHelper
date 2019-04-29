const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } =  require('electron-updater')
const fs = require('fs')
const path = require('path')
const url = require('url')
let win = null
const isDevelopment = process.env.NODE_ENV === 'development'



function createWindow () {

  // 创建window对象
  win = new BrowserWindow({
    width: 662, // 宽
    height: 442, // 高
    frame: false, // 是否显示默认边框
    resizable: isDevelopment, // 是否可以缩放
    movable: true, // 是否可以拖动
  })
  // 加载html
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    })
  );
  // 打开开发者工具
  isDevelopment && win.webContents.openDevTools()
  // 当窗口关闭的时候会触发的事件
  win.on('closed', () => win = null)

  autoUpdater.on('error', function (error) {
    win.webContents.send('updateMessage', false)
  });
  autoUpdater.on('checking-for-update', function () {
    fs.writeFileSync('checking-for-update.txt', '正在检查更新')
    console.log('正在检查更新')
  });
  autoUpdater.on('update-available', function (info) { // 检查到新版本
    win.webContents.send('updateMessage', true)
  });
  autoUpdater.on('update-not-available', function (info) {
    fs.writeFileSync('update-not-available.txt', '正在使用最新版本')
    console.log('正在使用最新版本')
  });
  autoUpdater.on('update-downloaded', function() {
    autoUpdater.quitAndInstall();
  });
  autoUpdater.on('download-progress', function(data) {
    win.webContents.send('progressMessage', data)
    fs.writeFileSync('download-progress.txt', `下载新版本中${JSON.stringify(data)}`)
  });

  // win.webContents.send()
  ipcMain.on('checkForUpdates', () => {
    autoUpdater.checkForUpdates()
  })

}

// electorn 初始化后, 部分api才可以调用, 所以在初始化以后才执行创建窗口的函数
app.on('ready', createWindow)
