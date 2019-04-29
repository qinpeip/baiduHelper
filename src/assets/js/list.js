import subProcess from '../../util/runBaidu';
import $ from './jquery'
import { remote } from 'electron';
const mainWindow = remote.getCurrentWindow()

const getList = async () => {
  let message = await subProcess.runOrder('ls')
  return message
}


export async function  runGenerateListPage () {
  // $('body').append(`<div class="progress"></div>`)
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
  let data = await getList()
  const { list } = data
  $('.catalog-list').on('click', 'li span a', async function () {
    let index = $(this).data('index')
    let isFolder = list[index].isFolder
    if (isFolder) {
      showProgress()
      let message = await subProcess.runOrder(`cd \"${list[index].name}\"`)
      if (message.code === 0) {
        closeProgress()
        let data = await getList()
        const { list } = data
        $('.catalog-list').remove()
        $('body').append($(createElement(list)))
        bindClickHandle()
      }
    } else {
      let message = await subProcess.runOrder(`d ${list[index].name}`, true)
      console.log(message)
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


