/**
 * フォームの入力値チェック用関数群
 *
 * Author : Takeshi Tomida <tomipetit@gmail.com>
 * Create : 2017.08
 */

export default class {
    async action(type, values, label) {
        let matchValue
        let chkKey
        let param
        if (matchValue = type.match(/^(.*?):(.*?)$/)) {

            chkKey = matchValue[1]
            param = matchValue[2]
        } else {
            chkKey = type
            param = null
        }
        let resp = await this.multiAction(chkKey, param, values)
        resp = resp.map((_val, idx) => {
            _val.reason = _val.reason.replace(/\{label\}/, label)
            return _val
        })
        return resp
    }

    async multiAction(chkKey, param, values) {
        let tasks = []
        const multiChkKeys = ["dateTimeTerm"] // 複合チェックするキー

        if (multiChkKeys.some(key => key == chkKey)) {
            if (values.length >= 2) {
                tasks.push(this[chkKey](values.map(_val => _val.value.join())))
            } else {
                tasks.push(this[chkKey](values[0].value))
            }
        } else {
            values.forEach(_value => {
                switch (_value.tag) {
                    case 'checkbox': {
                        let tmp = Object.assign({}, _value, { label: _value.label[0] })
                        tasks.push(this[chkKey](tmp, param))
                        break
                    }
                    default: {
                        _value.value.forEach((_val, idx) => {
                            let tmp = Object.assign({}, _value, { value: _val, label: _value.label[idx] })
                            tasks.push(this[chkKey](tmp, param))
                        })
                    }
                }
            })
        }
        return await Promise.all(tasks)
    }

    async num(checkObj) {
        const check = str => {
            return new RegExp(/^[0-9|０-９\.]+$/).test(str)
        }

        let resultObj = {}

        if (checkObj.value == "" || check(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は数字でご入力ください`
        }
        return resultObj
    }

    async phone(checkObj) {
        const check = str => new RegExp(/^[0-9０-９\-ー]+$/).test(str)
        const check2 = str => {
            let val = str.replace(/[-ー]/g, '')
            return val.length >= 10 & val.length <= 11
        }

        let resultObj = {}

        if (checkObj.value == "" || check(checkObj.value) && check2(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は数字またはハイフン(-)、10-11桁でご入力ください`
        }
        return resultObj
    }
    async tel(checkObj) {
        return this.phone(checkObj)
    }
    async creditcard(checkObj) {
        const check = str => new RegExp(/^[0-9０-９\s]+$/).test(str)
        const check2 = str => {
            let val = str.replace(/\s/g, '')
            return val.length >= 14 && val.length <= 16
        }

        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value) && check2(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は数字14〜16桁でご入力ください`
        }
        return resultObj
    }

    async enumb(checkObj) {
        const check = str => new RegExp(/^[a-z|A-Z|0-9|　|\s]+$/).test(str)

        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は半角英数字でご入力ください`
        }
        return resultObj
    }

    async password(checkObj) {
        const check = str => new RegExp(/^[a-zA-Z0-9!-/:-@¥[-`{-~]*$/).test(str)

        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は半角英数記号でご入力ください`
        }
        return resultObj
    }

    async eb(checkObj) {
        const check = str => new RegExp(/^[a-z\s]+$/).test(str)

        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は半角英子文字でご入力ください`
        }
        return resultObj
    }

    async ebl(checkObj) {
        const check = str => new RegExp(/^[A-Z\s]+$/).test(str)

        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は半角英大文字でご入力ください`
        }
        return resultObj
    }

    async twobyte(checkObj) {
        const check = str => {
            var flg = 0
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i)
                // Shift_JIS: 0x0 ～ 0x80, 0xa0 , 0xa1 ～ 0xdf , 0xfd ～ 0xff
                // Unicode : 0x0 ～ 0x80, 0xf8f0, 0xff61 ～ 0xff9f, 0xf8f1 ～ 0xf8f3
                if ((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
                    if (!flg) {
                        return true
                    };
                } else {
                    if (flg) {
                        return true
                    };
                }
            }
            return false
        }

        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は全角でご入力ください`
        }
        return resultObj
    }

    async required(checkObj) {
        //console.log(checkObj)
        let reasonText = {
            select: 'ご選択',
            radio: 'ご選択',
            file: 'ご選択',
            hidden: 'ご入力',
            text: 'ご入力',
            textarea: 'ご入力',
        }
        switch (checkObj.tag) {
            case "checkbox":
                return this.requiredCheckbox(checkObj)
                break
            default: {
                const check = str => str.replace(/^[ |　]+|[ |　]+$/g, '') !== ""
                let resultObj = {}
                if (check(checkObj.value)) {
                    resultObj.result = true
                    resultObj.reason = ""
                } else {
                    let label = checkObj.label || "{label}"
                    resultObj.result = false
                    resultObj.reason = `${label}を${reasonText[checkObj.tag]}ください`
                }
                return resultObj
            }
        }
    }

    async requiredCheckbox(checkObj) {
        console.log(checkObj)
        let check = value => value.length >= 1
        let resultObj = {}
        if (check(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            console.log("label:" + label)
            resultObj.result = false
            resultObj.reason = `${label}をご選択ください`
        }
        return resultObj
    }

    async textLimit(checkObj, limitNum) {
        let check = (value, limitNum) => value.length <= limitNum
        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value, limitNum)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は${limitNum}字以内でご入力ください`
        }
        return resultObj
    }

    async textLimitByte(checkObj, limitByte) {
        const byteCnt = str => {
            let count = 0,
                setEncode = 'UTF-8',
                c = '';

            for (let i = 0, len = str.length; i < len; i++) {
                c = str.charCodeAt(i);
                if (setEncode === 'UTF-8') {
                    if ((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
                        count += 1;
                    } else {
                        count += 2;
                    }
                } else if (setEncode === 'Shift_JIS') {
                    if ((c >= 0x0 && c < 0x81) || (c == 0xa0) || (c >= 0xa1 && c < 0xdf) || (c >= 0xfd && c < 0xff)) {
                        count += 1;
                    } else {
                        count += 2;
                    }
                }
            }
            return count;
        }
        let resultObj = {}
        if (checkObj.value == "" || byteCnt(checkObj.value) <= limitByte) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は全角${zenLimit}文字（半角${limitByte}文字）以内でご入力ください`
        }
        return resultObj
    }

    async textSizeLimit(checkObj, limitSize) {
        let check = (value, limit) => value.length * 1 <= limit * 1
        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value, limitSize)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は${limitSize}桁以内でご入力ください`
        }
        return resultObj
    }

    async textSizeMin(checkObj, minSize) {
        let check = (value, min) => value.length * 1 >= min * 1
        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value, minSize)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は${minSize}桁以上でご入力ください`
        }
        return resultObj
    }

    async textSizeRange(checkObj, range) {
        range = range.split('-')
        let check = (value, range) => (value.length * 1 >= range[0] * 1) && (value.length * 1 <= range[1] * 1)
        let resultObj = {}

        if (checkObj.value == "" || check(checkObj.value, range)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は${range[0]}-${range[1]}桁の範囲でご入力ください`
        }
        return resultObj

    }

    async textSize(checkObj, size) {
        let check = (value, size) => value.length * 1 == size * 1
        let resultObj = {}

        if (checkObj.value == "" || check(checkObj.value, size)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は${size}桁でご入力ください`
        }
        return resultObj
    }

    async email(checkObj) {
        const check = str => {
            return new RegExp(/^[\w\!\$\&\*\=\^\`\|\~\#\%\'\+\/\?\_\{\}\-]+(\.{0,1}[\w\!\$\&\*\=\^\`\|\~\#\%\'\+\/\?\_\{\}\-])*@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,}|[0-9]{1,3})(\]?)$/).test(str);
        }

        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は半角英数のメールアドレス記入形式(abc@xxx.xxx)でご入力ください`
        }
        return resultObj
    }
    async emailMatch(checkObj, target) {
        let compareValue = $(`input[name="${target}"]`).val()
        let resultObj = {
            result: false,
            reason: "入力されたメールアドレスが一致しません。"
        };

        if (checkObj.value === compareValue) {
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj
    }
    async privacy(checkObj) {
        let check = value => value.length >= 1
        let resultObj = {}
        if (check(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = "プライバシーポリシーにご同意ください"
        }
        return resultObj
    }

    async url(checkObj) {
        const check = str => {
            return new RegExp(/^(https?|line)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/).test(str)
        }
        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}はURLの形式でご入力ください`
        }
        return resultObj
    }
    async dateTime(checkObj) {
        const check = str => {
            return new RegExp(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/).test(str)
        }
        let resultObj = {}
        if (checkObj.value == "" || check(checkObj.value)) {
            resultObj.result = true
            resultObj.reason = ""
        } else {
            let label = checkObj.label || "{label}"
            resultObj.result = false
            resultObj.reason = `${label}は日時の形式でご入力ください`
        }
        return resultObj
    }
    async dateTimeTerm(values) {
        let resultObj = {}
        if (values.filter(_val => _val).length > 1 && values[0] > values[1]) {
            resultObj.result = false
            resultObj.reason = `{label}の入力値が正しくありません。`
        } else {
            resultObj.result = true
            resultObj.reason = ""
        }
        return resultObj
    }
}
