import $ from "./jquery";
import {runGenerateListPage} from "./list";
import subProcess from '../../util/runBaidu'
const minWindow = require('electron').remote.getCurrentWindow()

$('.submit-bduss button').click(async () => {
  if (!$('#bduss').val().trim()) {
      $('.baidu-bduss-container .error_message p').show().html('请输入bduss')
    return
  }
  let message = await subProcess.runOrder(`login --bduss=${$('#bduss').val()}`)
  if (message.code === 0) {
    minWindow.localStorageSet('bduss', $('#bduss').val())
    $('.baidu-container').remove()
    $('.baidu-bduss-container').remove()
    $('.download-message').remove()
    runGenerateListPage()
    $('.go-back').show()
  }
})
