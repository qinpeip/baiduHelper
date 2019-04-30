import subProcess from '../../util/runBaidu';
import $ from './jquery'
import { remote, ipcRenderer } from 'electron';
const mainWindow = remote.getCurrentWindow()
let listData = []
async function getList() {
  let message = await subProcess.runOrder('ls')
  listData = message
  return message
}

 export async function runGenerateListPage () {
   if (subProcess.isRunOrder) return
  let data = await getList()
  const { list } = data
$('body').append($(createElement(list)))
  bindClickHandle()
  $('.go-back a').off('click').click(async () => {
    await subProcess.runOrder(`cd ../`)
    let data = await getList()
    const { list } = data
    $('.catalog-list').remove()
    $('body').append($(createElement(list)))
    bindClickHandle()
  })
  mainWindow.setSize(900, 500)
  mainWindow.center()
}

async function bindClickHandle() {
  const { list } = listData
  $('.catalog-list').on('click', 'li span a', async function () {
    let index = $(this).data('index')
    let isFolder = list[index].isFolder
    if (isFolder) {
      if (subProcess.isRunOrder) return
      showProgress()
      let message = await subProcess.runOrder(`cd \"${list[index].name}\"`)
      if (message.code === 0) {
        closeProgress()
        let data = await await getList()
        const { list } = data
        $('.catalog-list').remove()
        $('body').append($(createElement(list)))
        bindClickHandle()
      }
    } else {
      let downloadFilePath = mainWindow.localStorageGet('downloadFilePath')
      if (!downloadFilePath) {
        ipcRenderer.send('openDirectory')
        ipcRenderer.on('setsaveDirSuccess', async () => {
          let message = await subProcess.runOrder(`config set -savedir \"${downloadFilePath}\"`)
          if (message.code == 0) {
            let message = await subProcess.runOrder(`d ${list[index].name}`, true)
            console.log(message)
          }
        })
      } else {
        let message = await subProcess.runOrder(`config set -savedir \"${downloadFilePath}\"`)
        if (message.code == 0) {
          let message = await subProcess.runOrder(`d \"${list[index].name}\"`, true)
          console.log(message)
        }
      }
    }
  })
}

function createElement (data) {
  let template = '<ul class="catalog-list"><li><span>序号</span><span>文件大小</span><span>创建时间</span><span>名称</span><span>操作</span></li>'
  data.forEach(item => {
    let download = `<a href="#" data-index="${item.index}">下载</a>`
    let showDetail = `<a href="#" data-index="${item.index}">查看</a>`
    template += `<li><span>${item.index}</span><span>${item.size}</span><span>${item.time}</span><span>${item.name}</span><span>${item.isFolder ?showDetail: download}</span></li>`
  })
  template+='</ul>'
  return template
}



function showProgress () {
  $('body').append(`<div class="progress"></div>`)
}

function closeProgress () {
  $('.progress').remove()
}



