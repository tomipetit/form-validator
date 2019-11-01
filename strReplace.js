/**
 * 文字列変換用関数群
 *
 * Author : T.Tomida <t-tomida@shinwatec.net>
 * Company : Shinwatec Inc.
 * Copyright : Copyright(c) 2017 Shinwatec Inc.
 * Create : 2017.08
 */

export default {
    /**
     * 半角カタカナから全角カタカナへ変換
     */
    toEmKana: function(str) {
        var searchText = "";
        var replaceText = "";
        var resultText = "";
        var c = 0;
        var n = 0;
        var cnext = 0;
        var nnext = 0;

        searchText = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮｯ､｡ｰ-｢｣ﾞﾟ";
        replaceText = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッ、。ーー「」" +
            "　　ヴ　　ガギグゲゴザジズゼゾダヂヅデド　　　　　バビブベボ　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　" +
            "　　　　　　　　　　　　　　　　　　　　　　　　　パピプペポ　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　";

        for (var i = 0, len = str.length; i < len; i++) {
            c = str.charAt(i);
            cnext = str.charAt(i + 1);
            n = searchText.indexOf(c, 0);
            nnext = searchText.indexOf(cnext, 0);

            if (n >= 0) {
                if (nnext === 61) {
                    c = replaceText.charAt(n + 61);
                    i++;
                } else if (nnext === 62) {
                    c = replaceText.charAt(n + 122);
                    i++;
                } else {
                    c = replaceText.charAt(n);
                }
            }
            if ((n !== 61) && (n !== 62)) {
                resultText += c;
            }
        }
        return resultText;
    },

    /**
     * 全角英数字記号から半角英数字記号へ変換
     */
    toOneByteCharacter: function(str) {
        var searchText = [];
        var replaceText = [];
        var resultText = "";
        var oneText = "";
        var index = 0;

        searchText = [
            "０", "１", "２", "３", "４", "５", "６", "７", "８", "９",
            "ａ", "ｂ", "ｃ", "ｄ", "ｅ", "ｆ", "ｇ", "ｈ", "ｉ", "ｊ", "ｋ", "ｌ", "ｍ", "ｎ", "ｏ", "ｐ", "ｑ", "ｒ", "ｓ", "ｔ", "ｕ", "ｖ", "ｗ", "ｘ", "ｙ", "ｚ",
            "Ａ", "Ｂ", "Ｃ", "Ｄ", "Ｅ", "Ｆ", "Ｇ", "Ｈ", "Ｉ", "Ｊ", "Ｋ", "Ｌ", "Ｍ", "Ｎ", "Ｏ", "Ｐ", "Ｑ", "Ｒ", "Ｓ", "Ｔ", "Ｕ", "Ｖ", "Ｗ", "Ｘ", "Ｙ", "Ｚ",
            "‐", "－", "ー", "―", "＝", "＋", "＊", "￥",
            "（", "）", "［", "］", "｛", "｝", "＜", "＞",
            "”", "’", "、", "，", "．", "。", "　", "；", "：", "／",
            "～", "＾", "｜", "！", "＆", "＃", "＄", "％", "＿", "＠"
        ];

        replaceText = [
            "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
            "-", "-", "-", "-", "=", "+", "*", "\\",
            "(", ")", "[", "]", "{", "}", "<", ">",
            "'", "'", ",", ",", ".", ".", " ", ";", ":", "/",
            "~", "^", "|", "!", "&", "#", "$", "%", "_", "@"
        ];

        for (var i = 0, len = str.length; i < len; i++) {
            oneText = str.charAt(i);
            index = $.inArray(oneText, searchText);
            if (index !== -1) {
                resultText += replaceText[index];
            } else {
                resultText += oneText;
            }
        }

        return resultText;
    },

    /**
     * 半角英数字記号から全角英数字記号へ変換
     */
    toTwoByteCharacter: function(str) {
        var searchText = [];
        var replaceText = [];
        var resultText = "";
        var oneText = "";
        var index = 0;

        searchText = [
            "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
            "-", "-", "-", "-", "=", "+", "*", "\\",
            "(", ")", "[", "]", "{", "}", "<", ">",
            "'", "'", ",", ",", ".", ".", " ", ";", ":", "/",
            "~", "^", "|", "!", "&", "#", "$", "%", "_", "@"
        ];

        replaceText = [
            "０", "１", "２", "３", "４", "５", "６", "７", "８", "９",
            "ａ", "ｂ", "ｃ", "ｄ", "ｅ", "ｆ", "ｇ", "ｈ", "ｉ", "ｊ", "ｋ", "ｌ", "ｍ", "ｎ", "ｏ", "ｐ", "ｑ", "ｒ", "ｓ", "ｔ", "ｕ", "ｖ", "ｗ", "ｘ", "ｙ", "ｚ",
            "Ａ", "Ｂ", "Ｃ", "Ｄ", "Ｅ", "Ｆ", "Ｇ", "Ｈ", "Ｉ", "Ｊ", "Ｋ", "Ｌ", "Ｍ", "Ｎ", "Ｏ", "Ｐ", "Ｑ", "Ｒ", "Ｓ", "Ｔ", "Ｕ", "Ｖ", "Ｗ", "Ｘ", "Ｙ", "Ｚ",
            "‐", "－", "ー", "―", "＝", "＋", "＊", "￥",
            "（", "）", "［", "］", "｛", "｝", "＜", "＞",
            "”", "’", "、", "，", "．", "。", "　", "；", "：", "／",
            "～", "＾", "｜", "！", "＆", "＃", "＄", "％", "＿", "＠"
        ];

        for (var i = 0, len = str.length; i < len; i++) {
            oneText = str.charAt(i);
            index = $.inArray(oneText, searchText);
            if (index !== -1) {
                resultText += replaceText[index];
            } else {
                resultText += oneText;
            }
        }

        return resultText;
    },


    /**
     * 全角数字から半角数字へ変換
     */
    toEnNo: function(str) {
        var searchText = [];
        var replaceText = [];
        var resultText = "";
        var oneText = "";
        var index = 0;

        searchText = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９", "‐", "－", "ー", "―"];
        replaceText = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "-", "-", "-"];

        for (var i = 0, len = str.length; i < len; i++) {
            oneText = str.charAt(i);
            index = $.inArray(oneText, searchText);
            if (index !== -1) {
                resultText += replaceText[index];
            } else {
                resultText += oneText;
            }
        }

        return resultText;
    },
    toTwoByteCharacterSelect: function(str,targetText){
        var targetList = targetText.split('');
        $.each(targetList,function(){
            var pat = new RegExp(this,'g');
            str = str.replace(pat,function(tmpStr){
                // 文字コードをシフト
                return String.fromCharCode( tmpStr.charCodeAt(0) + 0xFEE0);
            })
        })

        // 文字コードシフトで対応できない文字の変換
        return str
            .replace(/\"/g, "”")
            .replace(/'/g, "’")
            .replace(/`/g, "‘")
            .replace(/\\/g, "￥")
            .replace(/ /g, "　")
            .replace(/~/g, "〜");
    }
}
