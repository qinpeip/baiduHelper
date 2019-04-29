
const fs = require('fs');
const path = require('path');

const localStoragePath = 'C:/Users'

if (!fs.existsSync(path.join(localStoragePath, 'baiduHelperData.json'))) {
  fs.writeFileSync(path.join(localStoragePath, 'baiduHelperData.json'), JSON.stringify({}), 'utf8')
}

let baiduHelperData = JSON.parse(fs.readFileSync(path.join(localStoragePath, 'baiduHelperData.json')))
function install (mainWindow) {
  mainWindow.localStorageSet = function (obj = undefined, key = null, value = null) {
    if (typeof obj === 'string' && key && !value) {
      value = key;
      key = obj;
      obj = {
        [key]: value
      }
    }
    if (key && value) {
      obj[key] = value
    }
    if (typeof obj !== 'object') throw new Error('参数传递错误!')
    baiduHelperData = {
      ...baiduHelperData,
      ...obj
    }
    fs.writeFileSync(path.join(localStoragePath, 'baiduHelperData.json'), JSON.stringify(baiduHelperData), 'utf8')
  }

  mainWindow.localStorageGet = function (key) {
    return baiduHelperData[key] || ''
  }

  mainWindow.localStorageRemove = function (key) {
    delete baiduHelperData[key]
    fs.writeFileSync(path.join(localStoragePath, 'baiduHelperData.json'), JSON.stringify(baiduHelperData), 'utf8')
  }
}

module.exports = {
  install
}
