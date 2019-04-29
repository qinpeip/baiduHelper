const mainWindow = require('electron').remote.getCurrentWindow();
import { ipcRenderer } from 'electron'
import '../css/bduss.css'
import '../css/base.css'
import '../css/list.css'
import '../css/progress.css'

// 图片资源
import back from '../image/back.png';
import baiduIcon from '../image/baidu_icon.png'

import $ from './jquery.js'
import { runGenerateListPage } from './list.js'
import subProcess from '../../util/runBaidu';
import './bduss'
import { showUpdateProgress } from './update.js';

// 发送检查更新事件
console.log('发送检查事件')
ipcRenderer.send('checkForUpdates')

ipcRenderer.on('updateMessage', (e, message) => {
  if (message) {
    showUpdateProgress()
  } else {
    $('.progress-mask').remove()
  }
})

ipcRenderer.on('progressMessage', (e, data) => {
  $('.bytesPresecond').html(data.percent.toFixed(2) + '%')
  $('.update-progress-child').css({width: `${data.percent}%`})
  $('.progress-dian').toggle()
})

const submitBtn = $('.submit button')
const accout = $('.account input')
const password = $('.password input')


$('.baidu_back').attr({src: back})
$('.baidu_icon').attr({src: baiduIcon})




$('.close').click(() => mainWindow.close())

$('.hidden').click(() => mainWindow.minimize())

let loginStep = 0


let cmd = ''

$(submitBtn).click(async () =>{
  if (!$(accout).val().trim()) {
    $('.error_message p').show().html('账号不能为空')
    return
  }
  if (!$(password).val().trim()) {
    $('.error_message p').show().html('密码不能为空')
    return
  }
  let isHidden = $('.valid').is(':hidden')
 if (!isHidden && !$('.valid input').val().trim()) {
   $('.error_message p').show().html('验证码不能为空')
   return
 }
 switch(loginStep) {
   case 0:
     cmd = `login --username ${$(accout).val()} --password ${$(password).val()}`;
     let message = await subProcess.runOrder(cmd)
     console.log(message)
     loginStep++
     switch (message.code) {
       case 100001:
         $('.valid').show().css({display: 'flex', flexDirection: 'column', height: '60px'})
         let template = `<option value="1">${message.data[2]}</option><option value="2">${message.data[3]}</option>`
         $('.valid .valid_select').show().html(template)
         $('.valid img').hide()
         break
       case 100002:
         $('.valid').show().css({display: 'flex'})
         $('.valid img').attr({src: message.data[4]})
         $('.valid .valid_select').hide()
         break
     }
     break
   case 1:
     if (!$('.valid').is(':hidden')) {
       cmd = $('.valid input').val()
       let message = await subProcess.runOrder(cmd)
       console.log(message)
     }
 }
})

 function checkListPage() {
  $('.baidu-container').remove()
  $('.baidu-bduss-container').remove()
  $('.download-message').remove()
  runGenerateListPage()
  $('.go-back').show()
}
