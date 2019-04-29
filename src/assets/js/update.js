import $ from './jquery';

export function showUpdateProgress () {
  let template = `<div class="progress-mask flex flex-center">
  <div class="progress-content">
  <span class="tip">检测到新版本,正在下载...<span class="progress-dian">...</span></span>
  <span class="update-progress">
  <span class="update-progress-child"></span>
</span>
  <span class="bytesPresecond">0%</span>
</div>
</div>`
  $('body').append(template)
}
