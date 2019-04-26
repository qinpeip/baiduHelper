import $ from "./jquery";
import {runGenerateListPage} from "./list";
import subProcess from '../../util/runBaidu'

$('.submit-bduss button').click(async () => {
  if (!$('#bduss').val().trim()) {
      $('.baidu-bduss-container .error_message p').show().html('请输入bduss')
    return
  }
  let message = await subProcess.runOrder(`login --bduss=${$('#bduss').val()}`)
  if (message.code === 0) {
    $('.baidu-container').remove()
    $('.baidu-bduss-container').remove()
    $('.download-message').remove()
    runGenerateListPage()
    $('.go-back').show()
  }
})
