/**
 * フォーム制御JS
 *
 * Author : Takeshi Tomida <tomipetit@gmail.com>
 * Create : 2017.08
 * Ver 1.0
 * 
 * required jquery, underscore
 */

import FormValueChk from './formValueChk'
import StrReplace from './strReplace'
import _ from 'underscore'
import sanitaize from './sanitaize'
import 'jquery.easing'

export default class {
  constructor(params) {
    const that = this
    this.config = Object.assign({}, this.defaults(), params)
    this.config.rendarAreaObj = $(this.config.rendarAreaId)
    this.config.inputAreaObj = this.config.rendarAreaObj.find(
      this.config.inputAreaId
    )
    this.config.confirmAreaObj = this.config.rendarAreaObj.find(
      this.config.confirmAreaId
    )
    this.config.submitAreaObj = this.config.rendarAreaObj.find(
      this.config.submitAreaId
    )

    this.config.inputAreaObj.find('.input-check-container').each(function () {
      that.setValidate($(this));
      if ($(this).hasClass('validate-skip')) {
        $(this).attr('data-errcnt', 0)
      }

      // 入力済み項目のチェック
      if(that._valueInputChk($(this))){
        that.inputChk($(this))
      }
    })

    // メールアドレスの確認入力表示
    $('input[name=email]').on('keyup.preview blur.preview', function () {
      if ($(this).val()) {
        $('.mail-preview')
          .show()
          .html(sanitaize.encode($.trim($(this).val())))
          .prev()
          .show()
      } else {
        $('.mail-preview')
          .hide()
          .prev('dt')
          .hide()
      }
    })

    // プライバシーポリシー
    $(this.config.privacyChkArea)
      .find('input[type="checkbox"]')
      .on('change', function () {
        const resp = FormValueChk.action('privacy', {
          obj: $(this)
        })
        that.renderErrorMessage(
          $(that.config.privacyChkArea),
          resp.reason ? [resp.reason] : []
        )
        that.inputChkAllCnt()
      })

    // 必須状態のテキスト入力項目表示制御
    this.config.inputAreaObj
      .find('fieldset')
      .find('input,textarea,select')
      .each(function () {
        if (
          $(this)
            .closest('.input-check-container')
            .attr('data-chk')
            .match(/required/)
        ) {
          $(this).addClass('confirm-area')
        }
      })

    this.config.submitAreaObj.find('.button-draft').on('click', function () {
      that.submitAction('draft')
      return false;
    })

    // 確認画面遷移ボタンのアクション定義
    this.config.submitAreaObj.find('.button-confirm').on('click', function () {
      if (!that.submitCheckAction()) {
        return false;
      }
      const respObj = that.rendarConfirm()
      // スクロール処理
      let targetY = respObj.offset().top
      $('html,body').scrollTop(targetY)
      return false
    })

    // 戻るボタンのアクション定義
    this.config.submitAreaObj.find('.button-back').on('click', function () {
      that.config.inputAreaObj
        .show()
        .next('.form-confirm')
        .remove()

      // スクロール処理
      let targetY = that.config.inputAreaObj.offset().top
      $('html,body').scrollTop(targetY)

      that.config.submitAreaObj.find('.button-confirm,.button-draft').show()
      that.config.submitAreaObj.find('.button-back,.button-submit').hide()

      // スクロール処理
      $(window).scrollTop(0)
      location.hash = 'contact-input'
      return false
    })

    // 送信ボタンのアクション定義
    this.config.submitAreaObj.find('.button-submit').on('click', function () {
      if (!that.config.isConfirm && !that.submitCheckAction()) {
        return false;
      }
      if (that.config.submitType == 'form-default') {
        return true;
      }

      $(this).prop('disabled', true)
      that.submitAction()
      return false
    })

    if (this.config.tokenChkFlg) {
      this.setToken()
    }
    //this.inputChkAll(false)
  }

  defaults() {
    return {
      rendarAreaId: '#contact',
      inputAreaId: '#contact-input',
      confirmAreaId: '#contact-confirm',
      privacyChkArea: '.privacy-area',
      submitAreaId: '#area-submit',
      errorCntClass: 'error-count',
      confirmHtml: '',
      completeHtml: '',
      completePath: null,
      tokenPath: '/api/token',
      submitPath: location.pathname,
      submitType: 'ajax', // ajax or form or form-default
      privacyChkFlg: true,
      tokenChkFlg: true,
      isConfirm: true,
      addValuesName: [],
      renderErrorCnt: true,
    }
  }

  setValidate(container) {
    let that = this;
    switch (
    container
      .attr('data-type')
      .replace(/:.*?$/, '')
    ) {
      case 'radio':
        // 入力内容チェックのアクション定義（ラジオボタン）
        container
          .find('input[type="radio"]')
          .on('change.chk', function () {
            const targetArea = $(this).closest('.input-check-container')
            that.inputChk(targetArea)
            that.inputChkAllCnt()
          })
        break
      case 'checkbox':
        // 入力内容チェックのアクション定義（チェックボックス）
        container
          .find('input[type="checkbox"]')
          .on('change.chk', function () {
            const targetArea = $(this).closest('.input-check-container')
            that.inputChk(targetArea)
            that.inputChkAllCnt()
          })
        break
      case 'text':
      case 'textarea':
      case 'select':
        // 入力時の文字列変換のアクション定義
        container
          .find('input,textarea')
          .on('blur.replace', function () {
            const targetArea = $(this).closest('.input-check-container')
            that.inputReplace(targetArea)
          })
        // 入力内容チェックのアクション定義（テキスト）
        container
          .find('input,textarea,select')
          .on('blur.chk change.chk keyup.chk', function (e) {
            const targetArea = $(this).closest('.input-check-container')
            that.inputChk(targetArea)
            that.inputChkAllCnt()
          })
        break
      case 'file':
        container
          .find('input[type="file"]')
          .on('change.chk', function (e) {
            const targetArea = $(this).closest('.input-check-container')
            that.inputChk(targetArea)
            that.inputChkAllCnt()
          })
        break;
      case 'hidden':
        container
          .find('input[type="hidden"]')
          .on('change.chk', function (e) {
            const targetArea = $(this).closest('.input-check-container')
            that.inputChk(targetArea)
            that.inputChkAllCnt()
          })
        break;
      default:
    }
  }
  setToken() {
    $.ajax({
      url: this.config.tokenPath,
      type: 'GET',
      dataType: 'json'
    })
      .done(resp => {
        this.setCookie('contactFormToken', resp.token, 3600)
      })
      .fail(function () {
        alert('接続エラーが発生しました。')
      })
  }
  submitCheckAction() {
    const resp = this.inputChkAll()
    if (resp.length) {
      let obj = this.config.inputAreaObj
        .find('.item')
        .not('.nosend')
        .find('.error-message')
        .first()
        .closest('.item')

      let targetY = obj.offset().top
      $('html,body').animate(
        {
          scrollTop: targetY
        },
        500,
        'easeOutQuint'
      )
      this.inputChkAllCnt()
      return false;
    }
    this.config.submitAreaObj.find('.' + this.config.errorCntClass).remove()
    return true;
  }

  /**
   * 入力値の取得
   *
   * @param none
   * @return object
   *
   *   @type object "(name値)" : { f_kind_1,f_maker_1…
   *     1製品単位でのパラメータ
   *
   *     @param boolean "hide" 表示非表示
   *     @param string "value" 選択値
   *     @param string "valueRender" 選択項目の見出し名
   *     @param string "name" 設問の見出し名
   *   }
   */
  getInputValues() {
    const that = this
    let inputValues = {}

    this.config.inputAreaObj
      .find('.item')
      .not('.nosend')
      .each(function () {
        const itemName = sanitaize.encode(
          that.getSurfaceText($(this).find('label'))
        )
        const inputObj = $(this).find('.input-check-container')
        inputObj.each(function () {
          let resp = that.getInputValue(this)

          if (resp.key in inputValues) {
            inputValues[resp.key].value.push(resp)
          } else {
            inputValues[resp.key] = {
              name: itemName + (resp.name || ''),
              value: [resp]
            }
          }
        })
      })

    return inputValues
  }
  getInputValue(element) {
    const that = this
    let tmpObj = {}
    let targetObj
    let fix

    tmpObj.hide = $(element).hasClass('hide') ? true : false // 非表示項目かどうか
    switch (
    $(element)
      .attr('data-type')
      .replace(/:.*?$/, '')
    ) {
      case 'radio': // ラジオボタン
        {
          tmpObj.key = $(element)
            .find('input[type=radio]')
            .first()
            .attr('name')
          targetObj = $(element).find('input[type=radio][name=' + tmpObj.key + ']:checked')
          fix = that.getFix(targetObj)
          tmpObj.value = targetObj.val()
          tmpObj.valueRender = tmpObj.value
            ? fix.prefix +
            $.trim(targetObj.parent('label').text()) +
            fix.suffix
            : ''
          break
        }
      case 'text': // テキスト
        {
          const textType = $(element)
            .attr('data-type')
            .match(/:/)
            ? $(element)
              .attr('data-type')
              .replace(/^.*?:/, '')
            : 'text'
          targetObj = $(element).find(`input[type=${textType}]`)
          fix = that.getFix(targetObj)
          tmpObj.key =
            '' +
            targetObj
              .first()
              .attr('name')
              .replace(/\[\]$/, '')

          tmpObj.value = sanitaize.encode($.trim(targetObj.val()))
          tmpObj.valueRender = tmpObj.value
            ? fix.prefix + tmpObj.value + fix.suffix
            : ''

          if (
            $(targetObj).hasClass('other-text') &&
            targetObj.attr('data-name')
          ) {
            tmpObj.name = '(' + targetObj.attr('data-name') + ')'
          }
          break
        }
      case 'textarea': // テキストエリア
        {
          targetObj = $(element)
            .find('textarea')
            .first()
          fix = that.getFix(targetObj)
          tmpObj.key = targetObj.attr('name').replace(/\[\]$/, '')
          tmpObj.value = sanitaize.encode($.trim(targetObj.val()))
          tmpObj.valueRender = tmpObj.value
            ? fix.prefix + tmpObj.value + fix.suffix
            : ''
          if (
            $(targetObj).hasClass('other-text') &&
            targetObj.attr('data-name')
          ) {
            tmpObj.name = '(' + targetObj.attr('data-name') + ')'
          }
          break
        }
      case 'select': // セレクト
        {
          targetObj = $(element)
            .find('select')
            .first()
          fix = that.getFix(targetObj)
          tmpObj.key = targetObj.attr('name').replace(/\[\]$/, '')
          tmpObj.value = sanitaize.encode($.trim(targetObj.val()))
          tmpObj.valueRender = tmpObj.value
            ? fix.prefix +
            $.trim(targetObj.find('option:selected').text()) +
            fix.suffix
            : ''
          break
        }
      case 'checkbox': // チェックボックス
        {
          targetObj = $(element).find('input[type=checkbox]')
          fix = that.getFix(targetObj)
          tmpObj.key = targetObj
            .first()
            .attr('name')
            .replace(/\[\]$/, '')
          tmpObj.value = []
          tmpObj.valueRender = []
          targetObj.each(function () {
            let value = $(element).prop('checked') ? targetObj.val() : null
            if (value) {
              tmpObj.value.push(value)
              tmpObj.valueRender.push(
                value
                  ? $.trim(
                    $(element)
                      .parent('label')
                      .text()
                  )
                  : ''
              )
            }
          })
          break
        }
      case 'file': // ファイル
        {
          targetObj = $(element).find('input[type=file]')
          fix = that.getFix(targetObj)
          tmpObj.key = targetObj
            .first()
            .attr('name')
            .replace(/\[\]$/, '')

          tmpObj.value = sanitaize
            .encode($.trim(targetObj.val()))
            .split('\\')
            .pop()
          tmpObj.valueRender = tmpObj.value

          if ($(element).attr('data-type').replace(/^.+:/, '') == 'image') {
            tmpObj.imgPath = targetObj.attr('data-path')
          }
          break
        }
      case 'hidden': // hidden
        {
          targetObj = $(element).find(`input[type=hidden]`)
          tmpObj.key =
            '' +
            targetObj
              .first()
              .attr('name')
              .replace(/\[\]$/, '')

          tmpObj.value = sanitaize.encode($.trim(targetObj.val()))
          tmpObj.valueRender = tmpObj.value
          if ($(element).attr('data-type').replace(/^.+:/, '') == 'image') {
            tmpObj.imgPath = tmpObj.value
          }
          if ($(element).attr('data-type').replace(/^.+:/, '') == 'video') {
            tmpObj.videoPath = tmpObj.value
          }
          break
        }
    }

    return tmpObj
  }
  getFix(obj) {
    return {
      prefix: obj.prev('.prefix').text(),
      suffix: obj.next('.suffix').text()
    }
  }
  /**
   * 確認画面書き出し
   *
   * @param none
   * @return jqueryDomObject 生成した確認表示用DOM
   */
  rendarConfirm() {
    const that = this
    let inputValues = {}
    this.config.submitAreaObj.find('.button-confirm,.button-draft').hide()
    this.config.submitAreaObj.find('.button-back,.button-submit').show()
    location.hash = 'contact-confirm'
    $('html,body').scrollTop(0)
    // 入力値を取得して非表示項目を除外
    let html = this.createConfirmHtml(this.getInputValues())

    const $confirmObj = $(html).addClass('form-confirm')
    this.config.inputAreaObj.after($confirmObj)

    return $confirmObj
  }

  createConfirmHtml(values) {
    let inputValues = {}
    $.each(values, (key, item) => {
      let values = []
      $.each(item.value, function (valKey, val) {
        if (val.hide) {
          return true
        }
        if ('imgPath' in val && val.imgPath) {
          val.valueRender = `<figure><img src="${val.imgPath}"></figure>`
        }
        if ('videoPath' in val && val.videoPath) {
          val.valueRender = `<video src="${val.videoPath}" controls></video>`
        }
        values.push(val)
      })
      inputValues[key] = {
        name: item.name,
        values
      }
    })
    // 表示の初期化
    this.config.inputAreaObj
      .hide()
      .next('.form-confirm')
      .remove()

    // 確認表示用DOM生成
    _.templateSettings = {
      interpolate: /\{\{=([^}]*)\}\}/g,
      evaluate: /\{\{(?!=)(.*?)\}\}/g,
      escape: /\{\{-([^}]*)\}\}/g
    }
    const compiledTmpl = _.template(this.config.confirmHtml)
    return compiledTmpl({
      items: inputValues
    })
  }

  /**
   * 送信処理
   *
   * @param none
   * @return none
   */
  submitAction(mode = null) {
    let token;
    if (this.config.tokenChkFlg) {
      token = this.getCookie('contactFormToken')
    }
    switch (this.config.submitType) {
      case 'ajax': {
        let data = this.createSendValAjax()
        if(!mode){
          data.published = 1;
        }
        $.ajax({
          type: 'POST',
          url: this.config.submitPath,
          data: data,
          dataType: 'json',
          cache: false,
        })
          .done(resp => {
            this.rendarComplete(resp)
            
            this.config.submitAreaObj.find('.button-submit').prop('disabled', false)
          })
          .fail((jqXHR, textStatus, errorThrown) => {
            console.log(textStatus)
          })
        break
      }
      case 'form': {
        let formObj = this.config.inputAreaObj.find('form');
        if (this.config.tokenChkFlg) {
          formObj.append(
            $('<input />', {
              name: 'token',
              value: token,
              type: 'hidden'
            })
          )
        }
        formObj.find('input[type="hidden"][name="published"]').val(1);
        formObj.submit()
        break
      }
    }
  }
  createSendValAjax() {
    let tmp = this.getInputValues()
    console.log(tmp)
    let data = {
      mode: 'send',
    }
    if (this.config.tokenChkFlg) {
      data.token = token;
    }
    Object.keys(tmp).map(key => {
      data[key] = tmp[key].value.map(val => val.value).join(',')
    })
    // 追加分のパラメータ
    this.config.addValuesName.forEach(key => {
      data[key] = $(`input[name=${key}]`).val()
    })
    console.log(data)
    return data
  }

  /**
   * 完了画面書き出し
   *
   * @param none
   * @return jqueryDomObject 生成した確認表示用DOM
   */
  rendarComplete() {
    // 表示の初期化
    if (this.config.completePath) {
      location.replace(this.config.completePath)
      return
    } else {
      $('html,body').scrollTop(0)
      location.hash = 'contact-complete'
      this.config.inputAreaObj.remove()
      this.config.confirmAreaObj.remove()
      this.config.submitAreaObj.remove()
      this.config.rendarAreaObj.append(this.config.completeHtml)
    }
  }

  /**
   * 全チェック
   *
   * @param none
   * @return array [
   *   エラー項目の情報
   *
   * @type array "item" 各設問でのinputChkの戻り値
   */
  inputChkAll(renderFlg = true) {
    const that = this
    let tmpList = []
    this.config.inputAreaObj
      .find('.input-check-container')
      .not('.hide')
      .not('.validate-skip')
      .each(function () {
        const resp = that.inputChk($(this), renderFlg)
        tmpList = [...tmpList, ...resp]
      })

    // プライバシー項目のチェック
    if (this.config.privacyChkFlg) {
      const resp = FormValueChk.action('privacy', {
        obj: $(this.config.privacyChkArea).find('input[type="checkbox"]')
      })
      this.renderErrorMessage(
        $(this.config.privacyChkArea),
        resp.reason ? [resp.reason] : []
      )
      this.inputChkAllCnt()
      if (!resp.result) {
        tmpList.push(resp.reason)
      }
    }

    return tmpList
  }

  /**
   * 全体の件数チェック
   *
   * @param none
   * @return int エラー件数
   */
  inputChkAllCnt(renderFlg = true) {
    const that = this
    let allCnt = 0
    $('.input-check-container[data-chk]')
      .not('.hide')
      .each(function () {
        if (!$(this).attr('data-errcnt')) {
          if (
            $(this)
              .attr('data-chk')
              .match(/required/)
          ) {
            // 任意項目はカウント除外
            allCnt++
          }
        } else if (Number($(this).attr('data-errcnt')) > 0) {
          allCnt++
        }
      })

    // プライバシー項目のチェック
    if (this.config.privacyChkFlg) {
      const privacyChk = FormValueChk.action('privacy', {
        obj: $(that.config.privacyChkArea).find('input[type="checkbox"]')
      })
      if (!privacyChk.result) {
        allCnt++
      }
    }

    // エラー件数の表示と遷移ボタン表示切り替え
    this.config.submitAreaObj.find('.' + this.config.errorCntClass).remove()
    if (allCnt) {
      if(this.config.renderErrorCnt && renderFlg){
        const errCntHtml =
          '<p><span>' + allCnt + '項目</span>の入力/選択が完了しておりません</p>'
        this.config.submitAreaObj.append(
          $(errCntHtml).addClass(this.config.errorCntClass)
        )
      }
      this.config.submitAreaObj.find('.submit input').prop('disabled', true)
    } else {
      this.config.submitAreaObj.find('.submit input').prop('disabled', false)
    }

    return allCnt
  }

  /**
   * 個別入力チェック
   *
   * @param jQueryDomObject targetArea 項目をラップしている"input-check-container"クラスのjQueryDOMオブジェクト
   * @return array エラーメッセージリスト
   */
  inputChk(targetArea, renderFlg = true) {
    const that = this
    let chkObj = {}
    let chkList
    let errList = []

    if (!targetArea.attr('data-chk')) {
      return errList
    }
    targetArea.removeClass('validate-skip')
    chkList = targetArea.attr('data-chk').split(',')
    chkObj.label = this.getSurfaceText(
      targetArea.closest('.item').find('label')
    )
    switch (targetArea.attr('data-type').replace(/:.*?$/, '')) {
      case 'radio': {
        chkList = chkList.map(function (val) {
          // requiredチェックの形式変更
          return val.replace('required', 'requiredRadioBox')
        })
        chkObj.obj = this._getChkObj(targetArea, 'radio')
        break
      }
      case 'checkbox': {
        chkList = chkList.map(function (val) {
          // requiredチェックの形式変更
          return val.replace('required', 'requiredCheckBox')
        })
        chkObj.obj = this._getChkObj(targetArea, 'checkbox')
        break
      }
      case 'text':
        {
          chkObj.textType = targetArea.attr('data-type').match(/:/)
            ? targetArea.attr('data-type').replace(/^.*?:/, '')
            : 'text'
          chkObj.obj = this._getChkObj(targetArea, 'text')
          const label = targetArea
            .find(`input[type=${chkObj.textType}]`)
            .attr('data-name')
          if (label) {
            chkObj.label = label
          }
          break
        }
      case 'textarea': {
        chkObj.obj = this._getChkObj(targetArea, 'textarea')
        const label = targetArea.find('textarea').attr('data-name')
        if (label) {
          chkObj.label += '(' + label + ')'
        }
        break
      }
      case 'select': {
        chkList = chkList.map(function (val) {
          // requiredチェックの形式変更
          return val.replace('required', 'requiredSelect')
        })
        chkObj.obj = this._getChkObj(targetArea, 'select')
        const label = targetArea.find('select').attr('data-name')
        if (label) {
          chkObj.label += '(' + label + ')'
        }
        break
      }
      case 'file': {
        chkObj.textType = targetArea.attr('data-type').match(/:/)
          ? targetArea.attr('data-type').replace(/^.*?:/, '')
          : 'file'
        chkObj.obj = this._getChkObj(targetArea, 'file')
        const label = targetArea.find('input[type="file"]').attr('data-name')
        if (label) {
          chkObj.label = label
        }
        break
      }
      case 'hidden':
        {
          chkObj.textType = 'hidden'
          chkObj.obj = this._getChkObj(targetArea, 'hidden')
          const label = targetArea
            .find(`input[type=hidden]`)
            .attr('data-name')
          if (label) {
            chkObj.label = label
          }
          break
        }
    }

    $.each(chkList, function () {
      const resp = FormValueChk.action(this, chkObj)
      if (!resp.result) {
        errList.push(resp.reason)
      }
    })
    targetArea.attr('data-errcnt', errList.length) // 項目毎のエラー件数を書き出し

    if(renderFlg){
      that.renderErrorMessage(targetArea, errList)
    }
    return errList
  }

  /**
   * item内の対象オブジェクトを抽出
   * 
   * @param {jQueryDomObj} targetArea 
   * @param {string} key 
   * @return {jQueryDomObj} formObj 
   */
  _getChkObj(targetArea, key = null){
    let obj
    key = key || targetArea.attr('data-type').replace(/:.*?$/, '')
    switch (key) {
      case 'radio':
      case 'checkbox':
      case 'file': 
      case 'hidden':{
        obj = targetArea.find(`input[type=${key}]`)
        break
      }
      case 'text':{
        let textType = targetArea.attr('data-type').match(/:/)
        ? targetArea.attr('data-type').replace(/^.*?:/, '')
        : 'text'
        obj = targetArea.find(`input[type=${textType}]`)
        break
      }
      case 'textarea': 
      case 'select': {
        obj = targetArea.find(key)
        break
      }
    }
    return obj
  }

  _valueInputChk(targetArea){
    let key = targetArea.attr('data-type').replace(/:.*?$/, '')
    let chkKey = 'required'

    switch (key) {
      case 'radio':
      case 'checkbox':
          chkKey = 'requiredRadioBox'
          break
      case 'select':
          chkKey = 'requiredSelect'
          break
    }
    let resp = FormValueChk.action(chkKey, {
      obj: this._getChkObj(targetArea)
    })
    return resp.result
  }

  /**
   * エラーメッセージの表示
   *
   * @param {jQueryDomObj} obj 項目をラップしている"input-check-container"クラスのjQueryDOMオブジェクト
   * @param {array} mesList エラーメッセージリスト
   * @return none
   */
  renderErrorMessage(obj, mesList) {
    obj.find('.error-message').remove()

    if (mesList.length) {
      const errObj = $('<div />').addClass('error-message')
      $.each(mesList, function () {
        errObj.append(`<p><span>${this}</span></p>`)
      })
      obj.append(errObj)
    }
  }

  /**
   * 文字列の置換処理
   *
   * @param jQueryDomObject targetArea 項目をラップしている"input-check-container"クラスのjQueryDOMオブジェクト
   * @return array (表示制御のみ)
   */
  inputReplace(targetArea) {
    const targetObj = targetArea.find('input')

    if (!targetArea.attr('data-replace')) {
      return false
    }
    const replaceList = targetArea.attr('data-replace').split(',')

    $.each(replaceList, function () {
      const repText = StrReplace[String(this)](targetObj.val())
      targetObj.val(repText)
    })
  }

  setCookie(c_name, value, expire) {
    //expire: 有効期限（秒）
    // pathの指定
    let path = location.pathname
    // pathをフォルダ毎に指定する場合のIE対策
    let paths = []
    paths = path.split('/')
    if (paths[paths.length - 1] != '') {
      paths[paths.length - 1] = ''
      path = paths.join('/')
    }
    // 有効期限の日付
    const extime = new Date().getTime()
    const cltime = new Date(extime + 1000 * expire)
    const exdate = cltime.toUTCString()
    // クッキーに保存する文字列を生成
    let s = ''
    s += c_name + '=' + escape(value) // 値はエンコードしておく
    s += '; path=' + path
    if (expire) {
      s += '; expires=' + exdate + '; '
    } else {
      s += '; '
    }
    // クッキーに保存
    document.cookie = s
  }

  getCookie(c_name) {
    let st = ''
    let ed = ''
    if (document.cookie.length > 0) {
      // クッキーの値を取り出す
      st = document.cookie.indexOf(c_name + '=')
      if (st != -1) {
        st = st + c_name.length + 1
        ed = document.cookie.indexOf(';', st)
        if (ed == -1) ed = document.cookie.length
        // 値をデコードして返す
        return unescape(document.cookie.substring(st, ed))
      }
    }
    return ''
  }
  getSurfaceText(selector) {
    var elem = $(selector[0].outerHTML)
    elem.children().empty()
    return elem.text()
  }
}
