/**
 * フォームの入力値チェック用関数群
 *
 * Author : T.Tomida <t-tomida@shinwatec.net>
 * Company : Shinwatec Inc.
 * Copyright : Copyright(c) 2017 Shinwatec Inc.
 * Create : 2017.08
 */

export default {
    action: function(type, checkObj){
        var matchValue;
        if(matchValue = type.match(/^((textLimit|textSize).*?)([0-9]+)$/)){
            return this[matchValue[1]](matchValue[3],checkObj);
        }
        return this[type](checkObj);
    },

    num: function(checkObj) {
        var label = checkObj.label;
        var value = checkObj.obj.val();

        var resultObj = {
            result : false,
            reason : "{label}は数字でご入力ください"
        };

        if(!checkNum(value) && value !== ""){
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;

        function checkNum(str) {
            return new RegExp(/^[0-9|０-９\.]+$/).test(str);
        }
    },
    phone: function(checkObj) {
        var label = checkObj.label;
        var value = checkObj.obj.val();

        var resultObj = {
            result : false,
            reason : "{label}は数字またはハイフン(-)でご入力ください"
        };

        if(!checkNum(value) && value !== ""){
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;

        function checkNum(str) {
            return new RegExp(/^[0-9\-|０-９\-]+$/).test(str);
        }
    },

    enumb: function(checkObj) {
        var label = checkObj.label;
        var value = checkObj.obj.val();

        var resultObj = {
            result : false,
            reason : "{label}は半角英数字でご入力ください"
        };

        if(!checkEnumb(value) && value !== ""){
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;

        function checkEnumb(str) {
            return new RegExp(/^[a-z|A-Z|0-9|　|\s]+$/).test(str);
        }
    },

    twobyte: function(checkObj) {
        var label = checkObj.label;
        var value = checkObj.obj.val();

        var resultObj = {
            result : false,
            reason : "{label}は全角でご入力ください"
        };

        if(checkOnebyte(value) && value !== ""){
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;

        function checkOnebyte(str) {
            var flg = 0;
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
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
            return false;
        }
    },
    required: function(checkObj) {
        var label = checkObj.label;
        var value = checkObj.obj.val().replace(/^[ |　]+|[ |　]+$/g,'');

        var resultObj = {
            result : false,
            reason : "{label}をご入力ください"
        };

        if(value=== ""){
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;
    },
    multiRequired: function(checkObj) {
        var label = checkObj.label;
        var value = [];
        var count = checkObj.obj.length;
        checkObj.obj.each(function(){
            value.push($(this).val().replace(/^[ |　]+|[ |　]+$/g,''));
        });

        var resultObj = {
            result : false,
            reason : "{label}をご入力ください"
        };
        if(count != value.filter(_val => _val).length){
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;
    },

    requiredSelect: function(checkObj) {
        var label = checkObj.label;
        var chkObj = checkObj.obj;
        var value = checkObj.obj.val().replace(/^[ |　]+|[ |　]+$/g,'');

        var resultObj = {
            result : false,
            reason : "{label}をご選択ください"
        };

        if(value=== ""){
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;
    },

    requiredCheckBox: function(checkObj) {
       return this.requiredRadioBox(checkObj);
    },

    requiredRadioBox: function(checkObj) {
        var label = checkObj.label;
        var chkObj = checkObj.obj;
        var resultObj = {};
        var tmpFlg = false;

        var resultObj = {
            result : false,
            reason : "{label}をご選択ください"
        };

        $.each(chkObj,function(){
            if($(this).is(":checked")){
                resultObj.result = true;
                resultObj.reason = "";
            }
        });
        if(!resultObj.result){
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }
        return resultObj;
    },

    textLimit: function(limitNum,checkObj) {
        var label = checkObj.label;
        var value = checkObj.obj.val();

        var resultObj = {
            result : false,
            reason : "{label}は" + limitNum + "字以内でご入力ください"
        };

        if (value.length > limitNum) {
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;
    },

    textLimitByte: function(limitByte,checkObj) {
        var label = checkObj.label;
        var value = checkObj.obj.val();
        var zenLimit = Math.floor(limitByte / 2);

        var resultObj = {
            result : false,
            reason : "{label}は全角" + zenLimit + "文字（半角" + limitByte + "文字）以内でご入力ください"
        };

        if(chkByte(value) > limitByte){
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;

        function chkByte(str, encode) {
            var count     = 0,
                setEncode = 'UTF-8',
                c         = '';

            if (encode && encode !== '') {
                if (encode.match(/^(SJIS|Shift[_\-]JIS)$/i)) {
                    setEncode = 'Shift_JIS';
                } else if (encode.match(/^(UTF-?8)$/i)) {
                    setEncode = 'UTF-8';
                }
            }

            for (var i = 0, len = str.length; i < len; i++) {
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
    },

    textSizeLimit: function(limitSize,checkObj) {
        var label = checkObj.label;
        var value = checkObj.obj.val();

        var resultObj = {
            result : false,
            reason : "{label}は" + limitSize + "桁以内でご入力ください"
        };

        if (value.length * 1 > limitSize * 1 && value !== "") {
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;
    },

    email: function(checkObj) {
        var label = checkObj.label;
        var value = checkObj.obj.val();

        var resultObj = {
            result : false,
            reason : "半角英数のメールアドレス記入形式(abc@xxx.xxx)でご入力ください"
        };

        if (!checkMail(value) && value !== ""){
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;

        function checkMail(str) {
            return new RegExp(/^[\w\!\$\&\*\=\^\`\|\~\#\%\'\+\/\?\_\{\}\-]+(\.{0,1}[\w\!\$\&\*\=\^\`\|\~\#\%\'\+\/\?\_\{\}\-])*@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,}|[0-9]{1,3})(\]?)$/).test(str);
        }
    },
    emailMatch: function(checkObj){
      var label = checkObj.label;
      var value = checkObj.obj.val();
      var compareValue = checkObj.obj.closest('.item').prev('.item').find(`input[type="${checkObj.textType}"]`).val();
        var resultObj = {
            result : false,
            reason : "入力されたメールアドレスが一致しません。"
        };

        if (value === compareValue) {
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;
    },
    privacy: function(checkObj) {
        var value = checkObj.obj.prop('checked');

        var resultObj = {
            result : false,
            reason : "プライバシーポリシーにご同意ください"
        };

        if (value) {
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;
    },
    url: function(checkObj){
        var label = checkObj.label;
        var value = checkObj.obj.val();

        var resultObj = {
            result : false,
            reason : "URLの形式でご入力ください"
        };

        if (!checkUrl(value) && value !== ""){
            resultObj.reason = resultObj.reason.replace("{label}", label);
        }else{
            resultObj.result = true;
            resultObj.reason = "";
        }
        return resultObj;

        function checkUrl(str) {
            return new RegExp(/^(https?|line)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/).test(str);
        }
    }
}
