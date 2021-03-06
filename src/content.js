var unsafeWindow

setTimeout(function () {
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.innerHTML =
    "document.body.setAttribute('data-msg_desc', msg_desc );document.body.setAttribute('data-msg_title', msg_title);document.body.setAttribute('data-msg_cdn_url', msg_cdn_url);"
  document.head.appendChild(script)
  document.head.removeChild(script)
}, 50)

console.log('accounts', accounts)
function getPost() {
  var post = {}
  post.title = document.body.getAttribute('data-msg_title')
  post.content = $('#js_content').html()
  post.thumb = document.body.getAttribute('data-msg_cdn_url')
  post.desc = document.body.getAttribute('data-msg_desc')
  post.link = window.location.href
  console.log(post)
  return post
}

var isSinglePage = window.location.href.indexOf('mp.weixin.qq.com/s') > -1
if (isSinglePage) {
  //   setTimeout(() => {
  //     getPost();
  //   }, 3000);
  var div = $(
    "<div class='sync-btn' style='position: fixed; left: 0; right: 0;top: 68px;width: 950px; margin-left: auto;margin-right: auto;'></div>"
  )
  div.append(
    '<div  data-toggle="modal" data-target="#exampleModalCenter" style=\'    font-size: 14px;border: 1px solid #eee;width: 105px; text-align: center; box-shadow: 0px 0px 1px rgba(0,0,0, 0.1);border-radius: 5px;padding: 5px; cursor: pointer;    background: rgb(0, 123, 255);color: white;\'>同步该文章</div>'
  )

  function afterGet() {
    var post = getPost()
    var html = ''
    accounts = allAccounts
    var supportAccounts = allAccounts.filter((item) => {
      if (!item.supportTypes) return true
      return item.supportTypes.indexOf('html') > -1
    })

    supportAccounts.forEach((account, index) => {
      html +=
        `
            <div class="form-check mb-1">
  <input class="form-check-input" type="checkbox" value="` +
        account.uid +
        `" name="submit_check" id="defaultCheck` +
        index +
        `">
  <label class="form-check-label" for="defaultCheck` +
        index +
        `">
  <img src="` +
        (account.icon
          ? account.icon
          : chrome.extension.getURL('images/wordpress.ico')) +
        `" class="icon" height="20" style="vertical-align: -3px;height: 20px !important"> 
  ` +
        account.title +
        `
  </label>
</div>
            `
    })

    var con =
      `
        <div class="media">
        <img class="align-self-center mr-3" src="` +
      post.thumb +
      `" width="150" alt="Generic placeholder image">
        <div class="media-body">
          <h5 class="mt-0" style="font-weight:bold">` +
      post.title +
      `</h5>
          <p>` +
      post.desc +
      `</p>
        </div>
      </div>

      <hr>
      <h6>账号</h6>
      <div id="syncd-users">
      ` +
      html +
      `
      </div>

        `

    $('#exampleModalCenter .modal-body').html('')
    $('#exampleModalCenter .modal-body').append(con)
    console.log('clicka')
  }
  div.click(function () {
    getAccounts(() => {
      afterGet()
    })
  })
  $('#page-content').append(div)
}

var html = `
<!-- Modal -->
<div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document" style="color: #444;">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLongTitle">同步文章</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="closesyncmodl">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal" style="font-size: 13px;    line-height: 1.5;">取消</button>
        <button type="button" class="btn btn-primary" style="font-size: 13px;    line-height: 1.5;">同步</button>
      </div>
    </div>
  </div>
</div>
`

$('body').append(html)

chrome.runtime.onMessage.addListener(function (request, sender, sendResponseA) {
  console.log('content.js revice', request)
  try {
    console.log('revice', request)
    if (request.method == 'taskUpdate') {
      buildStatusHtml(request.task)
    }
  } catch (e) {
    console.log(e)
  }
})

function buildStatusHtml(taskStatus) {
  var isNotFirstAppend = $('.alld-pubaccounts').length

  var list = taskStatus.accounts.map((account) => {
    var msg =
      (account.status == 'uploading'
        ? ` <div class="lds-dual-ring"></div>` +
          (account.msg ? account.msg : `同步中`)
        : ``) +
      (account.status == 'failed'
        ? `同步失败, 错误内容：` + account.error
        : ``) +
      (account.status == 'done' && account.editResp
        ? `同步成功 <a
                      href="` +
          account.editResp.draftLink +
          `"
                      style="margin-left: 5px"
                      target="_blank"
                      >查看草稿</a
                    >`
        : ``)
    if (isNotFirstAppend) {
      var obj = $('.' + account.type + '-message')
      if (obj.length) {
        obj.html(msg)
      }
      return msg
    }
    return (
      `<div class="account-item taskStatus">
                 ` +
      (account.icon
        ? ` <img src="` +
          account.icon +
          `" class="icon"
      width="20"
      height="20"
      style="vertical-align: -6px;height: 20px !important"
    />`
        : '') +
      `<span class="name-block">` +
      account.title +
      `</span><span
                  style="margin-left: 15px"
                  class="` +
      account.type +
      `-message ` +
      account.status +
      ` message"
                >
                  ` +
      msg +
      `</span></div>`
    )
  })
  var html =
    `
  <div class="alld-pubaccounts">
  ` +
    list.join('\n') +
    `</div>`

  console.log(list, html)

  // $("#syncd-users").html("");
  if (isNotFirstAppend) {
    // taskStatus.accounts.map(account => {
    // });
  } else {
    $('#syncd-users').html(html)
  }
}

$('#exampleModalCenter .btn-primary').click(function (e) {
  var listAccount = $('input[name="submit_check"]')
  var saccounts = []
  for (let index = 0; index < listAccount.length; index++) {
    const element = listAccount[index]
    if (element.checked) {
      var aa = accounts.filter((t) => {
        return t.uid == element.value
      })
      console.log(accounts, element.value)
      saccounts.push(aa[0])
    }
  }

  if (!saccounts.length) {
    alert('请选择账号')
    return e.stopPropagation()
  }

  chrome.extension.sendMessage(
    {
      action: 'addTask',
      task: {
        post: getPost(),
        accounts: saccounts,
      },
    },
    function (resp) {
      console.log('addTask return', resp)
    }
  )

  $('#syncd-users').html('等待发布...')
  // $("#closesyncmodl").click();
})

var allAccounts = []
var accounts = []

function getAccounts(cb) {
  chrome.extension.sendMessage(
    {
      action: 'getAccount',
    },
    function (resp) {
      allAccounts = resp
      cb && cb()
    }
  )
}

// getAccounts();

var isEditorPage =
  window.location.href.indexOf('mp.weixin.qq.com/cgi-bin/appmsg') > -1
if (isEditorPage) {
  // intiEditor();
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = chrome.extension.getURL('autoformat.js')
  script.setAttribute('data-url', chrome.runtime.getURL('templates.html'))
  // document.head.appendChild(script)
  // document.head.removeChild(script);
}
