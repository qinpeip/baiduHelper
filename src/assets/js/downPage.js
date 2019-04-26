import $ from './jquery';
export function runDownloadPage (data, fn) {
  $('.catalog-list').remove()
  $('.download-message').remove()
  let messageEle = `<div class="download-message flex flex-center flex-column">`
  data.data.forEach(item => {
    messageEle += `<p>${item}</p>`
  })
  messageEle+= '</div>'
  $('body').append($(messageEle))
  $('.go-back a').off('click')
  if ((data.data[data.data.length - 1]).includes('任务结束')) {
    $('.go-back a').click(() => {
      fn()
    })
  }
}







