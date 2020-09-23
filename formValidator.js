import serialize from 'form-serialize'
import FormValueChk from './formValueChk'
import StrReplace from './strReplace'
import SmoothScroll from 'smooth-scroll'
const formValueChk = new FormValueChk

const smoothScroll = new SmoothScroll()

export default class {
    constructor(params) {
        this.config = Object.assign({}, this.defaults(), params)
        this.func = this.setFunc()

        this.config.renderAreaObj = document.querySelector(this.config.renderAreaSelector)
        if(!this.config.renderAreaObj){
            return false
        }
        this.config.formObj = this.config.renderAreaObj.querySelector(this.config.formObjSelector)

        this.config.submitAreaObj = this.config.formObj.querySelector(this.config.submitAreaSelector)

        // チェックイベントの設定
        this.config.formObj.querySelectorAll('.input-check-container').forEach(obj => {
            this.addTargetObject(obj)
        })

        // 送信ボタンのアクション定義
        this.config.submitAreaObj.querySelector('.button-submit').addEventListener('click', async e => {
            e.preventDefault()
            if (this.config.beforeSubmitAction) {
                await this.config.beforeSubmitAction()
            }
            let resp = await this.inputChkAll()
            let count = resp.filter(_val => _val.length).length
            if (count) {
                let scrollObj = this.config.formObj.querySelector('.error-message')
                smoothScroll.animateScroll(this.func.closest(scrollObj, 'item'))
                return false
            }
            this.setPublish(1)

            // 完了後のfunctionが定義されている場合
            if (!this.config.submitAction) {
                if(this.config.renderConfirmMessage){
                    if (!window.confirm(this.config.submitConfirmMessage)) {
                        return false
                    }
                }
                this.config.formObj.submit()
                return
            }
            let formData = serialize(this.config.formObj, { hash: true })
            this.config.submitAction(e.currentTarget, formData)
        })
        // 下書きボタンのアクション定義
        if (this.config.submitAreaObj.querySelector('.button-draft')) {
            this.config.submitAreaObj.querySelector('.button-draft').addEventListener('click', async e => {
                if (!this.config.beforeSubmitAction) {
                    await this.config.beforeSubmitAction()
                }
                this.setPublish(0)
                // 完了後のfunctionが定義されている場合
                if (!this.config.submitAction) {
                    return true
                }
                let formData = serialize(this.config.formObj, { hash: true })
                this.config.submitAction(e.currentTarget, formData)
            })
        }
    }
    setPublish(value) {
        let obj
        if (obj = this.config.formObj.querySelector('input[name="published"]')) {
            obj.value = value
        } else {
            let obj = document.createElement('input')
            obj.type = 'hidden'
            obj.name = 'published'
            obj.value = value
            this.config.formObj.appendChild(obj)
        }
    }
    defaults() {
        return {
            renderAreaSelector: '#contact',
            formObjSelector: 'form',
            submitAreaSelector: '.area-submit',
            renderErrorCnt: true,
            errorCntClass: 'error-count',
            submitAction: null,
            beforeSubmitAction: null,
            submitConfirmMessage: 'この内容で登録します。よろしいですか？',
            renderConfirmMessage: false,
        }
    }
    addTargetObject(obj) {
        this.setValidateAction(obj)
        this.setReplaceAction(obj)
    }
    setFunc() {
        return {
            closest: (el, targetClass) => {
                for (let item = el; item; item = item.parentElement) {
                    if (item.classList.contains(targetClass)) {
                        return item
                    }
                }
            },
            getSurfaceText: obj => {
                let result = ""
                obj.childNodes.forEach(_elm => {
                    if (_elm.nodeName == "#text") {
                        result = _elm.nodeValue;
                    }
                })
                return result
            },
            remove: (obj, selector) => {
                let tmp = obj.querySelectorAll(selector)
                if (tmp.length) {
                    tmp.forEach(_obj => {
                        if (_obj) {
                            _obj.parentNode.removeChild(_obj)
                        }
                    })
                }
            }
        }
    }
    getLabel(obj) {
        let itemLabelObj = this.func.closest(obj, 'item').firstElementChild
        return this.func.getSurfaceText(itemLabelObj)
    }
    setValidateAction(baseObj) {
        let itemLabel = this.getLabel(baseObj)
        let elements = this.getFormElement(baseObj)
        let onAction

        Object.keys(elements).forEach(_key => {
            let _keyObjs = elements[_key]
            switch (_key) {
                case 'radio':
                case 'checkbox':
                    onAction = ['change']
                    break
                case 'text':
                case 'textarea':
                case 'select':
                    onAction = ['blur', 'change', 'keyup']
                    break
                case 'file':
                case 'hidden':
                    onAction = ['change']
                    break
                default:
            }
            console.log(_keyObjs)
            Object.keys(_keyObjs).forEach(_name => {
                _keyObjs[_name].forEach(_obj => {
                    onAction.forEach(_onAction => {
                        _obj.addEventListener(_onAction, e => {
                            console.log(e)
                            let values = this.getValues(elements)
                            this.inputChk(values, baseObj, itemLabel)
                        })
                    })
                })
            })
        })
    }
    getFormElement(obj) {
        let typeList = {
            textarea: [...obj.querySelectorAll('textarea')],
            select: [...obj.querySelectorAll('select')],
            radio: [],
            checkbox: [],
            file: [],
            hidden: [],
            text: [],
        }
        obj.querySelectorAll('input').forEach(_inputObj => {
            let type = _inputObj.getAttribute('type')
            switch (type) {
                case 'radio':
                case 'checkbox':
                case 'file':
                case 'hidden':
                    typeList[type].push(_inputObj)
                    break
                default:
                    typeList.text.push(_inputObj)

            }
        })
        Object.keys(typeList).forEach(_type => {
            let typeData = typeList[_type]
            let resp = {}
            if (typeData.length) {
                typeData.forEach((_obj, idx) => {
                    if (_obj.classList.contains("chk-exclude") || !_obj.hasAttribute('name')) {
                        return
                    }
                    let name = _obj.getAttribute('name').replace(/\[\]$/, '')
                    if (name in resp) {
                        resp[name].push(_obj)
                    } else {
                        resp[name] = [_obj]
                    }
                })
                if (Object.keys(resp).length) {
                    typeList[_type] = resp
                } else {
                    delete typeList[_type]
                }
            } else {
                delete typeList[_type]
            }
        })
        return typeList
    }
    async inputChk(values, parentObj, itemLabel) {
        if (!parentObj.hasAttribute('data-chk')) {
            return false
        }
        let chkList = parentObj.getAttribute('data-chk').split(',').filter(_val => _val)
        let resp = await Promise.all(chkList.map(async _chk => await formValueChk.action(_chk, values, itemLabel)))
        let errors = []
        resp.forEach(_chk => {
            errors = errors.concat(_chk.filter(_val => !_val.result).map(_val => _val.reason))
        })

        parentObj.setAttribute('data-errors', errors.length)

        this.renderErrorMessage(errors, parentObj)
        this.inputChkAllCnt()
        let submitObj = this.config.submitAreaObj.querySelector('.button-submit')
        if(this.submitChk()){
            submitObj.classList.remove('error')
        }else{
            submitObj.classList.add('error')
        }
        return errors
    }
    renderErrorMessage(errors, targetObj) {
        this.func.remove(targetObj, '.error-message')

        errors.forEach(_errorText => {
            let textObj = document.createElement('span')
            textObj.appendChild(document.createTextNode(_errorText))
            let wrapObj = document.createElement('p')
            wrapObj.className = 'error-message'
            wrapObj.append(textObj)
            targetObj.append(wrapObj)
        })
    }
    inputChkAllCnt() {
        let errorCnt = [...document.querySelectorAll('.input-check-container[data-errors]')].map(_obj => _obj.getAttribute('data-errors')).filter(_value => Number(_value) != 0).length
        
        if (!this.config.renderErrorCnt) {
            return errorCnt
        }

        this.func.remove(this.config.submitAreaObj, '.error-count')

        if (errorCnt >= 1) {
            let textObj = document.createElement('span')
            textObj.appendChild(document.createTextNode(`${errorCnt}項目の入力が完了しておりません`))
            let wrapObj = document.createElement('p')
            wrapObj.className = 'error-count'
            wrapObj.append(textObj)
            this.config.submitAreaObj.append(wrapObj)
        }
        return errorCnt
    }

    submitChk(){
        let cnt = [...document.querySelectorAll('.input-check-container')].filter(_obj => {
            return !_obj.hasAttribute('data-errors') || Number(_obj.getAttribute('data-errors')) > 0
        }).length

        return !Boolean(cnt)
    }

    getElementLabel(obj, tag) {
        let labels = false
        switch (tag) {
            case 'checkbox':
            case 'radio':
                labels = [obj[0].getAttribute('data-name')]
                break
            default:
                labels = obj.map(_obj => _obj.getAttribute('data-name'))
        }
        return labels
    }

    getValue(obj, tag) {
        let values = false
        switch (tag) {
            case 'select':
                values = obj.map(_obj => _obj.options[_obj.selectedIndex].value)
                break
            case 'checkbox': {
                let tmp = obj.filter(_obj => _obj.checked)
                if (tmp.length) {
                    values = tmp.map(_obj => _obj.value)
                }
                break
            }
            case 'radio': {
                let tmp = obj.filter(_obj => _obj.checked)
                if (tmp.length) {
                    values = [tmp[0].value]
                } else {
                    values = [""]
                }
                break
            }
            case 'textarea':
            case 'hidden':
            case 'file':
            case 'text':
                values = obj.map(_obj => _obj.value)
                break
        }
        return values
    }

    getValues(elements) {
        let values = []
        Object.keys(elements).forEach(_tag => {
            let objs = elements[_tag]
            Object.keys(objs).forEach(_name => {
                values.push({
                    tag: _tag,
                    name: _name,
                    value: this.getValue(objs[_name], _tag),
                    label: this.getElementLabel(objs[_name])
                })
            })
        })
        return values
    }
    inputChkAll() {
        return Promise.all([...this.config.formObj.querySelectorAll('.input-check-container')].map(async baseObj => {
            let itemLabel = this.getLabel(baseObj)
            let elements = this.getFormElement(baseObj)
            let values = this.getValues(elements)
            return await this.inputChk(values, baseObj, itemLabel)
        }))
    }
    setReplaceAction(baseObj) {
        let onAction = []
        baseObj.querySelectorAll('input,textarea,select').forEach(_obj => {
            let repKeys = _obj.hasAttribute('data-replace') ? _obj.getAttribute('data-replace').split(',') : []

            if (!repKeys.length) {
                return false
            }
            switch (_obj.tagName.toLowerCase()) {
                case 'select':
                    return false
                    break
                case 'input': {
                    let type = _obj.getAttribute('type')
                    if (type.match(/^(radio|checkbox|file|hidden)$/)) {
                        return false
                    }
                    onAction = ['blur']
                    break
                }
                case 'textarea': {
                    onAction = ['blur']
                    break
                }
            }
            _obj.addEventListener(onAction, e => {
                repKeys.forEach(_key => {
                    this.inputReplace(_key, _obj)
                })
            })
        })
    }
    inputReplace(key, obj) {
        let repText = StrReplace[key](obj.value)
        obj.value = repText
    }
    async submitAjax(data, path, params = {}) {
        let formData = new FormData()
        for (let key in data) {
            formData.append(key, data[key]);
        }
        let send = {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        }
        Object.assign(send, params)

        let resp = await fetch(path, send)
        return resp.json()
    }

    triggerEvent(element, event){
        if (document.createEvent) {
            // IE以外
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, true, true); // event type, bubbling, cancelable
            return element.dispatchEvent(evt);
        } else {
            // IE
            var evt = document.createEventObject();
            return element.fireEvent("on" + event, evt)
        }
    }
}