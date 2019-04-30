import $ from './jquery';

export function showUpdateProgress (data) {
  let template = `<div class="progress-mask flex flex-center flex-column">
  <div class="progress-content flex flex-center">
  <span class="tip">检测到新版本,正在下载...<span class="progress-dian">...</span></span>
  <span class="update-progress">
  <span class="update-progress-child"></span>
</span>
  <span class="bytesPresecond">0%</span>
</div>
<div class="update-message">
</div>
</div>`
  let messageEle = ''
  JSON.parse(data.releaseNotes).forEach((item, index) => {
    messageEle += `<div><span>${index}:</span>&nbsp;<span>${item}</span></div>`
  })
  $('body').append(template)
  $('.update-message').append(messageEle)
}
