const { remote } = require('electron')
const mainWindow = remote.getCurrentWindow();
const dialog = remote.dialog;
import fs from 'fs';
import path from 'path';
import { ipcRenderer } from 'electron'
import '../css/bduss.css'
import '../css/base.css'
import '../css/list.css'
import '../css/progress.css'

// 图片资源
import back from '../image/back.png';
import baiduIcon from '../image/baidu_icon.png'

import $ from './jquery.js'
import subProcess from '../../util/runBaidu';
import { runGenerateListPage } from './list'
import './bduss'
import { showUpdateProgress } from './update.js';

// 发送检查更新事件
ipcRenderer.send('checkForUpdates')

ipcRenderer.on('updateMessage', (e, message) => {
  if (message) {
    showUpdateProgress(message)
  } else {
    $('.progress-mask').remove()
  }
})

ipcRenderer.on('progressMessage', (e, data) => {
  $('.bytesPresecond').html(data.percent.toFixed(2) + '%')
  $('.update-progress-child').css({width: `${data.percent}%`})
  $('.progress-dian').toggle()
})



$('.baidu_back').attr({src: back})
$('.baidu_icon').attr({src: baiduIcon})




$('.close').click(() => mainWindow.close())

$('.hidden').click(() => mainWindow.minimize())

// 先配置appid
async function setAppid () {
  let message = await subProcess.runOrder('config set -appid 266719')
  if (message.data.some(item => item.includes('保存配置成功'))) {
    verifyIsLogin() // 配置appid成功后尝试自动登录
  } else {
    dialog.showErrorBox('错误', '内部配置错误, 请重新启动!')
  }
}

// 当message被赋值以后  表示baiduPCS启动完毕了
subProcess.messageChangeHandle = async function (data) {
  subProcess.removeMessage() // 清空message的信息
  subProcess.messageChangeHandle = null; // 删除该方法, 防止多次触发
  setAppid()
}

// 第一次打开验证是否已登录
async function verifyIsLogin () {
  if (fs.existsSync(path.join(process.cwd(), './pcs_config.json'))) {
    let loginUsedata = JSON.parse(fs.readFileSync(path.join(process.cwd(), './pcs_config.json')))
    if (loginUsedata.baidu_user_list && loginUsedata.baidu_user_list[0] && loginUsedata.baidu_user_list[0].bduss) {
      setTimeout(() => {checkListPage()}, 200)
    } else {
      // 尝试自动登录
      autoLogin()
    }
  } else {
    // 尝试自动登录
    autoLogin()
  }
}

async function autoLogin () {
  let bduss = mainWindow.localStorageGet('bduss')
  if (bduss) {
    let message = await subProcess.runOrder(`login --bduss=${bduss}`)
    if (message.code === 0) {
      checkListPage()
    }
  }
}

function checkListPage () {
  subProcess.setLoginSuccess(true)
  $('.baidu-container').remove()
  $('.baidu-bduss-container').remove()
  $('.download-message').remove()
  runGenerateListPage()
  $('.go-back').show()
}
// verifyIsLogin()
