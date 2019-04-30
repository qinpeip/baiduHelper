const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const { dialog } = require('electron').remote
import { runDownloadPage } from '../assets/js/downPage.js'
import baidu from '../../BaiduPCS-Go.exe';



if (!fs.existsSync(baidu) && process.env.NODE_ENV !== 'development') {
  let a = fs.readFileSync(`${__dirname}/${baidu}`)
  fs.writeFileSync(path.resolve(__dirname, `../../../${baidu}`), a)
}

let subProcess = spawn(baidu)

subProcess.on('error', (err) => {console.log('err', err)})

let message = ''
let isFirst = true
let timer = null
let isLoginSuccess = false
let isRunDownloadPage = false
let operations = []

function onData (data) {
  if (isRunDownloadPage) {
    runDownloadPage(transformStr(data.toString()), () => {
      isRunDownloadPage = false;
    })
  } else {
    if (isFirst) {
      isFirst = false
    } else {
      message += data
    }
  }
}


subProcess.stdout.setEncoding('utf8');
subProcess.stdout.on('data', onData)
subProcess.stderr.on('data', onData)
subProcess.on('close', (code) => {console.log(`子进程退出${code}`)})
subProcess.stdin.setEncoding('utf8');

subProcess.isRunOrder = false

subProcess.runOrder = async (order, isDownload = false) => {
  subProcess.isRunOrder = true
  return new Promise((resolve) => {
    subProcess.stdin.write(`${order}\n`);
    if (isDownload) {
      uploadOperationLog (order, '下载文件')
      isRunDownloadPage = isDownload
      return
    }
    if (!timer) {
      timer = setInterval(() => {
        if (message) {
          operations.push({order, message})
          uploadOperationLog()
          if (message.includes('No permission to do this operation')) {
            bugfix(4)
            message = null
            return
          }
          if (message.includes('保存配置成功') && order.includes('-appid')) {
            subProcess.stdin.write(`ls\n`);
            message = null
            return
          }
          if (message.includes('timeout awaiting response headers')) {
            subProcess.stdin.write(`${order}\n`)
            message = null
            return
          }
          if (message.includes('wsarecv: An existing connection was forcibly closed by the remote host.')) {
            dialog.showErrorBox('服务器错误', '远程主机强制关闭了现有连接。')
            message = null
            clearInterval(timer)
            timer = null
            return
          }
          if (isLoginSuccess && order === 'ls' && !/(---)$/.test(message.trim())) return

          subProcess.isRunOrder = false

          if (isLoginSuccess && /(---)$/.test(message.trim())) {
            resolve(splitFolder(transformStr(message)))
            message = null
            clearInterval(timer)
            timer = null
            return
          }
          if (message.includes('帐号登录成功')) isLoginSuccess = true
          resolve(transformStr(message))
          message = null
          clearInterval(timer)
          timer = null
        }
      }, 200)
    }
  })
}



function transformStr (data) {
  if (typeof data !== 'string') return []
  data = data.split('\n')
  data = data.filter(item => item.trim())
  if (data.some(item => item.includes('手机'))) {
    return {
      code: 100001,
      data:data
    }
  }
  if (data.some(item => item.includes('以查看验证码'))) {
    return {
      code: 100002,
      data:data
    }
  }
  if (data.some(item =>item.includes('远端服务器返回错误'))) {
    return {
      code: 400001,
      data: data
    }
  }
  return {
    code: 0,
    data: data
  }
}

function bugfix (code) {
  switch (code) {
    case 4:
      subProcess.stdin.write(`config set -appid 266719\n`);
      break;
  }
}

function splitFolder (sourceData) {
  let { code, data } = sourceData
  let obj = {}
  if (data[0].includes('BaiduPCS-Go')) {
    let index = data.findIndex(item => item.includes('当前工作目录')) || 0
    data = data.slice(index)
  }
  data = data.filter(item => !item.includes('---'))
  obj.code = code
  // 获取当前工作目录
  let currentCatalogIndxe = data.findIndex(item => item.includes('当前工作目录'))
  obj.currentCatalog = data[currentCatalogIndxe].replace('当前工作目录: ', '')
  data = data.filter(item => !item.includes('当前工作目录'))
  data = data.filter(item => !item.includes('null'))
  // 获取文件总数
  obj.totalMessage = data.find(item => item.includes('文件总数') && item.includes('目录总数'))
  data = data.filter(item => !item.includes('文件总数:')&&!item.includes('目录总数:'))
  data = data.filter(item =>!item.includes('#') && !item.includes('文件大小'))
  let list = data.map(item => {
    let tempArr = item.split(' ').filter(item =>item.trim())
    let obj = {}
    obj.index = tempArr[0]
    obj.isFolder = tempArr[1].includes('-')
    obj.size = obj.isFolder ? '-' : tempArr[1]
    obj.time = tempArr[2] + ' ' + tempArr[3]
    obj.name = tempArr.slice(4).join(' ')
    return obj
  })
  obj.list = list
  return obj
}


function uploadOperationLog () {
  const operationLogPath = 'C:/Users';
  operations.forEach(operation => {
    fs.stat(path.join(operationLogPath, 'baiduOperationLog.txt'), function (err, stat) {
      if (err) {
        let logs = `时间: ${new Date()} \n \n 输入指令: ${operation.order} \n\n 返回信息: ${operation.message}\n\n`;
        fs.writeFile(path.join(operationLogPath, 'baiduOperationLog.txt'), logs, () => {})
        return

      } else {
        fs.readFile(path.join(operationLogPath, 'baiduOperationLog.txt'), (err, data) => {
          if (err) return
          let logs = `时间: ${new Date()} \n \n 输入指令: ${operation.order} \n\n 返回信息: ${operation.message}\n\n`;
          fs.writeFile(path.join(operationLogPath, 'baiduOperationLog.txt'), data + logs, () => {})
        })
      }
    })
  })
}

subProcess.setLoginSuccess = function (data) {
  isLoginSuccess = data
}

export default subProcess
