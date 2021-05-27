/**
 * @name GoogleTranslateOption
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.2.5
 * @description Allows you to translate Messages and your outgoing Message within Discord
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/GoogleTranslateOption/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/GoogleTranslateOption/GoogleTranslateOption.plugin.js
 */

module.exports = ((_) => {
  const config = {
    info: {
      name: "GoogleTranslateOption",
      author: "DevilBro",
      version: "2.2.5",
      description:
        "Allows you to translate Messages and your outgoing Message within Discord",
    },
    changeLog: {
      improved: {
        "Per Channel Outgoing Translation State":
          "Instead of toggling the outgoing translation for every chat it now remembers the state for each channel, can be disabled to the way it worked before in the plugin settings",
      },
    },
  };

  var MD5 = function (string) {
    function RotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function AddUnsigned(lX, lY) {
      var lX4, lY4, lX8, lY8, lResult;
      lX8 = lX & 0x80000000;
      lY8 = lY & 0x80000000;
      lX4 = lX & 0x40000000;
      lY4 = lY & 0x40000000;
      lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
      if (lX4 & lY4) {
        return lResult ^ 0x80000000 ^ lX8 ^ lY8;
      }
      if (lX4 | lY4) {
        if (lResult & 0x40000000) {
          return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
        } else {
          return lResult ^ 0x40000000 ^ lX8 ^ lY8;
        }
      } else {
        return lResult ^ lX8 ^ lY8;
      }
    }

    function F(x, y, z) {
      return (x & y) | (~x & z);
    }
    function G(x, y, z) {
      return (x & z) | (y & ~z);
    }
    function H(x, y, z) {
      return x ^ y ^ z;
    }
    function I(x, y, z) {
      return y ^ (x | ~z);
    }

    function FF(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function ConvertToWordArray(string) {
      var lWordCount;
      var lMessageLength = string.length;
      var lNumberOfWords_temp1 = lMessageLength + 8;
      var lNumberOfWords_temp2 =
        (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
      var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
      var lWordArray = Array(lNumberOfWords - 1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] =
          lWordArray[lWordCount] |
          (string.charCodeAt(lByteCount) << lBytePosition);
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    }

    function WordToHex(lValue) {
      var WordToHexValue = "",
        WordToHexValue_temp = "",
        lByte,
        lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        WordToHexValue_temp = "0" + lByte.toString(16);
        WordToHexValue =
          WordToHexValue +
          WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
      }
      return WordToHexValue;
    }

    function Utf8Encode(string) {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";

      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);

        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if (c > 127 && c < 2048) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }

      return utftext;
    }

    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7,
      S12 = 12,
      S13 = 17,
      S14 = 22;
    var S21 = 5,
      S22 = 9,
      S23 = 14,
      S24 = 20;
    var S31 = 4,
      S32 = 11,
      S33 = 16,
      S34 = 23;
    var S41 = 6,
      S42 = 10,
      S43 = 15,
      S44 = 21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301;
    b = 0xefcdab89;
    c = 0x98badcfe;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
      AA = a;
      BB = b;
      CC = c;
      DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
      b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
      a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
      c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
      c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
      a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
      a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
      d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
      a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
      a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
      a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
      c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
      a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
      c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
      b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
      c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
      d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
      c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
      a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
      d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
      b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
      a = AddUnsigned(a, AA);
      b = AddUnsigned(b, BB);
      c = AddUnsigned(c, CC);
      d = AddUnsigned(d, DD);
    }

    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

    return temp.toLowerCase();
  };

  return !window.BDFDB_Global ||
    (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started)
    ? class {
        getName() {
          return config.info.name;
        }
        getAuthor() {
          return config.info.author;
        }
        getVersion() {
          return config.info.version;
        }
        getDescription() {
          return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;
        }

        downloadLibrary() {
          require("request").get(
            "https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js",
            (e, r, b) => {
              if (!e && b && r.statusCode == 200)
                require("fs").writeFile(
                  require("path").join(
                    BdApi.Plugins.folder,
                    "0BDFDB.plugin.js"
                  ),
                  b,
                  (_) =>
                    BdApi.showToast("Finished downloading BDFDB Library", {
                      type: "success",
                    })
                );
              else
                BdApi.alert(
                  "Error",
                  "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library"
                );
            }
          );
        }

        load() {
          if (
            !window.BDFDB_Global ||
            !Array.isArray(window.BDFDB_Global.pluginQueue)
          )
            window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {
              pluginQueue: [],
            });
          if (!window.BDFDB_Global.downloadModal) {
            window.BDFDB_Global.downloadModal = true;
            BdApi.showConfirmationModal(
              "Library Missing",
              `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`,
              {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onCancel: (_) => {
                  delete window.BDFDB_Global.downloadModal;
                },
                onConfirm: (_) => {
                  delete window.BDFDB_Global.downloadModal;
                  this.downloadLibrary();
                },
              }
            );
          }
          if (!window.BDFDB_Global.pluginQueue.includes(config.info.name))
            window.BDFDB_Global.pluginQueue.push(config.info.name);
        }
        start() {
          this.load();
        }
        stop() {}
        getSettingsPanel() {
          let template = document.createElement("template");
          template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
          template.content.firstElementChild
            .querySelector("a")
            .addEventListener("click", this.downloadLibrary);
          return template.content.firstElementChild;
        }
      }
    : (([Plugin, BDFDB]) => {
        var _this;

        const translateIconGeneral = `<svg name="Translate" width="24" height="24" viewBox="0 0 24 24"><mask/><path fill="currentColor" mask="url(#translateIconMask)" d="M 4 2 C 2.9005593 2 2 2.9005593 2 4 L 2 17 C 2 18.10035 2.9005593 19 4 19 L 11 19 L 12 22 L 20 22 C 21.10035 22 22 21.099441 22 20 L 22 7 C 22 5.9005592 21.099441 5 20 5 L 10.880859 5 L 10 2 L 4 2 z M 11.173828 6 L 20 6 C 20.550175 6 21 6.4498249 21 7 L 21 20 C 21 20.550175 20.550176 21 20 21 L 13 21 L 15 19 L 14.185547 16.236328 L 15.105469 15.314453 L 17.791016 18 L 18.521484 17.269531 L 15.814453 14.583984 C 16.714739 13.54911 17.414914 12.335023 17.730469 11.080078 L 19 11.080078 L 19 10.039062 L 15.365234 10.039062 L 15.365234 9 L 14.324219 9 L 14.324219 10.039062 L 12.365234 10.039062 L 11.173828 6 z M 7.1660156 6.4160156 C 8.2063466 6.4160156 9.1501519 6.7857022 9.9003906 7.4804688 L 9.9648438 7.5449219 L 8.7441406 8.7246094 L 8.6855469 8.6699219 C 8.4009108 8.3998362 7.9053417 8.0859375 7.1660156 8.0859375 C 5.8555986 8.0859375 4.7890625 9.1708897 4.7890625 10.505859 C 4.7890625 11.84083 5.8555986 12.925781 7.1660156 12.925781 C 8.5364516 12.925781 9.1309647 12.050485 9.2910156 11.464844 L 7.0800781 11.464844 L 7.0800781 9.9160156 L 11.03125 9.9160156 L 11.044922 9.984375 C 11.084932 10.194442 11.099609 10.379777 11.099609 10.589844 C 11.094109 12.945139 9.4803883 14.583984 7.1660156 14.583984 C 4.9107525 14.583984 3.0800781 12.749807 3.0800781 10.5 C 3.0800781 8.2501934 4.9162088 6.4160156 7.1660156 6.4160156 z M 12.675781 11.074219 L 16.669922 11.074219 C 16.669922 11.074219 16.330807 12.390095 15.111328 13.810547 C 14.576613 13.195806 14.206233 12.595386 13.970703 12.115234 L 12.980469 12.115234 L 12.675781 11.074219 z M 13.201172 12.884766 C 13.535824 13.484957 13.940482 14.059272 14.390625 14.583984 L 13.855469 15.115234 L 13.201172 12.884766 z"/><extra/></svg>`;
        const translateIconMask = `<mask id="translateIconMask" fill="black"><path fill="white" d="M 0 0 H 24 V 24 H 0 Z"/><path fill="black" d="M24 12 H 12 V 24 H 24 Z"/></mask>`;
        const translateIcon = translateIconGeneral
          .replace(`<extra/>`, ``)
          .replace(`<mask/>`, ``)
          .replace(` mask="url(#translateIconMask)"`, ``);
        const translateIconUntranslate = translateIconGeneral
          .replace(
            `<extra/>`,
            `<path fill="none" stroke="#f04747" stroke-width="2" d="m 14.702359,14.702442 8.596228,8.596148 m 0,-8.597139 -8.59722,8.596147 z"/>`
          )
          .replace(`<mask/>`, translateIconMask);

        const TranslateButtonComponent = class TranslateButton extends BdApi
          .React.Component {
          render() {
            return BDFDB.ReactUtils.createElement(
              BDFDB.LibraryComponents.ChannelTextAreaButton,
              {
                className: BDFDB.DOMUtils.formatClassName(
                  BDFDB.disCN._googletranslateoptiontranslatebutton,
                  _this.isTranslationEnabled(this.props.channelId) &&
                    BDFDB.disCN._googletranslateoptiontranslating,
                  BDFDB.disCN.textareapickerbutton
                ),
                isActive: this.props.isActive,
                iconSVG: translateIcon,
                nativeClass: true,
                onClick: (_) => {
                  this.props.isActive = true;
                  BDFDB.ReactUtils.forceUpdate(this);

                  BDFDB.ModalUtils.open(_this, {
                    size: "LARGE",
                    header: BDFDB.LanguageUtils.LanguageStrings.SETTINGS,
                    subHeader: "",
                    onClose: (_) => {
                      this.props.isActive = false;
                      BDFDB.ReactUtils.forceUpdate(this);
                    },
                    children: BDFDB.ReactUtils.createElement(
                      TranslateSettingsComponent,
                      {
                        channelId: this.props.channelId,
                      }
                    ),
                  });
                },
                onContextMenu: (_) => {
                  _this.toggleTranslation(this.props.channelId);
                  BDFDB.ReactUtils.forceUpdate(this);
                },
              }
            );
          }
        };

        const TranslateSettingsComponent = class TranslateSettings extends BdApi
          .React.Component {
          filterLanguages(isOutput, place) {
            return BDFDB.ObjectUtils.toArray(
              BDFDB.ObjectUtils.map(
                isOutput
                  ? BDFDB.ObjectUtils.filter(languages, (lang) => !lang.auto)
                  : languages,
                (lang, id) => ({
                  value: id,
                  label: _this.getLanguageName(lang),
                  backup: this.isOnlyBackup(lang),
                })
              )
            ).filter(
              isOutput &&
                this.isOnlyBackup(
                  languages[_this.getLanguageChoice("input", place)]
                )
                ? (n) => n.backup
                : (n) => n
            );
          }
          isOnlyBackup(lang) {
            return (
              (lang.auto &&
                !translationEngines[_this.settings.engines.translator].auto) ||
              (!lang.auto &&
                !lang.special &&
                !translationEngines[
                  _this.settings.engines.translator
                ].languages.includes(lang.id))
            );
          }
          render() {
            return [
              BDFDB.ArrayUtils.is(_this.settings.exceptions.wordStart) &&
                _this.settings.exceptions.wordStart.length && [
                  BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
                    className: BDFDB.disCN.marginbottom8,
                    children: BDFDB.ReactUtils.createElement(
                      BDFDB.LibraryComponents.SettingsLabel,
                      {
                        label: `Words starting with ${_this.settings.exceptions.wordStart
                          .map((n) => '"' + n + '"')
                          .join(", ")} will be ignored`,
                      }
                    ),
                  }),
                  BDFDB.ReactUtils.createElement(
                    BDFDB.LibraryComponents.FormComponents.FormDivider,
                    {
                      className: BDFDB.disCN.marginbottom8,
                    }
                  ),
                ],
              Object.keys(_this.defaults.choices).map((key) => {
                const isOutput =
                  _this.defaults.choices[key].direction == "output";
                const place = _this.defaults.choices[key].place;

                return [
                  BDFDB.ReactUtils.createElement(
                    BDFDB.LibraryComponents.FormComponents.FormItem,
                    {
                      title: _this.defaults.choices[key].description,
                      titleChildren: isOutput
                        ? BDFDB.ReactUtils.createElement(
                            BDFDB.LibraryComponents.Button,
                            {
                              look: BDFDB.LibraryComponents.Button.Looks.BLANK,
                              size: BDFDB.LibraryComponents.Button.Sizes.NONE,
                              onClick: (_) => {
                                let input = _this.getLanguageChoice(
                                  "input",
                                  place
                                );
                                let output = _this.getLanguageChoice(
                                  "output",
                                  place
                                );
                                input = input == "auto" ? "en" : input;

                                _this.settings.choices["input" + place] =
                                  output;
                                _this.settings.choices["output" + place] =
                                  input;
                                BDFDB.DataUtils.save(
                                  _this.settings.choices,
                                  _this,
                                  "choices"
                                );

                                _this.setLanguages();

                                BDFDB.ReactUtils.forceUpdate(this);
                              },
                              children: BDFDB.ReactUtils.createElement(
                                BDFDB.LibraryComponents.SvgIcon,
                                {
                                  className:
                                    BDFDB.disCN
                                      ._googletranslateoptionreversebutton,
                                  iconSVG: `<svg width="21" height="21" fill="currentColor"><path d="M 0, 10.515 c 0, 2.892, 1.183, 5.521, 3.155, 7.361 L 0, 21.031 h 7.887 V 13.144 l -2.892, 2.892 C 3.549, 14.722, 2.629, 12.75, 2.629, 10.515 c 0 -3.418, 2.235 -6.309, 5.258 -7.492 v -2.629 C 3.418, 1.577, 0, 5.652, 0, 10.515 z M 21.031, 0 H 13.144 v 7.887 l 2.892 -2.892 C 17.482, 6.309, 18.402, 8.281, 18.402, 10.515 c 0, 3.418 -2.235, 6.309 -5.258, 7.492 V 20.768 c 4.469 -1.183, 7.887 -5.258, 7.887 -10.121 c 0 -2.892 -1.183 -5.521 -3.155 -7.361 L 21.031, 0 z"/></svg>`,
                                }
                              ),
                            }
                          )
                        : null,
                      className: BDFDB.disCN.marginbottom8,
                      children: BDFDB.ReactUtils.createElement(
                        BDFDB.LibraryComponents.Select,
                        {
                          value: _this.getLanguageChoice(key),
                          options: this.filterLanguages(isOutput, place),
                          optionRenderer: (lang) =>
                            languages[lang.value]
                              ? BDFDB.ReactUtils.createElement(
                                  BDFDB.LibraryComponents.Flex,
                                  {
                                    align:
                                      BDFDB.LibraryComponents.Flex.Align.CENTER,
                                    children: [
                                      BDFDB.ReactUtils.createElement(
                                        BDFDB.LibraryComponents.Flex.Child,
                                        {
                                          grow: 1,
                                          children: lang.label,
                                        }
                                      ),
                                      lang.backup &&
                                        BDFDB.ReactUtils.createElement(
                                          BDFDB.LibraryComponents
                                            .TooltipContainer,
                                          {
                                            text: "Will use Backup Translator",
                                            tooltipConfig: {
                                              color: "red",
                                            },
                                            children:
                                              BDFDB.ReactUtils.createElement(
                                                BDFDB.LibraryComponents.SvgIcon,
                                                {
                                                  nativeClass: true,
                                                  width: 20,
                                                  height: 20,
                                                  color:
                                                    BDFDB.DiscordConstants
                                                      .Colors.STATUS_RED,
                                                  name: BDFDB.LibraryComponents
                                                    .SvgIcon.Names.WARNING,
                                                }
                                              ),
                                          }
                                        ),
                                      BDFDB.ReactUtils.createElement(
                                        BDFDB.LibraryComponents.FavButton,
                                        {
                                          isFavorite:
                                            languages[lang.value].fav == 0,
                                          onClick: (value) => {
                                            if (value)
                                              favorites.push(lang.value);
                                            else
                                              BDFDB.ArrayUtils.remove(
                                                favorites,
                                                lang.value,
                                                true
                                              );
                                            BDFDB.DataUtils.save(
                                              favorites.sort(),
                                              _this,
                                              "favorites"
                                            );
                                            _this.setLanguages();
                                          },
                                        }
                                      ),
                                    ],
                                  }
                                )
                              : null,
                          onChange: (value) => {
                            _this.settings.choices[key] = value;
                            BDFDB.DataUtils.save(
                              _this.settings.choices,
                              _this,
                              "choices"
                            );
                          },
                        }
                      ),
                    }
                  ),
                  isOutput &&
                    BDFDB.ReactUtils.createElement(
                      BDFDB.LibraryComponents.FormComponents.FormDivider,
                      {
                        className: BDFDB.disCN.marginbottom8,
                      }
                    ),
                ];
              }),
              Object.keys(_this.defaults.engines).map((key) =>
                BDFDB.ReactUtils.createElement(
                  BDFDB.LibraryComponents.FormComponents.FormItem,
                  {
                    title: _this.defaults.engines[key].description,
                    className: BDFDB.disCN.marginbottom8,
                    children: BDFDB.ReactUtils.createElement(
                      BDFDB.LibraryComponents.Select,
                      {
                        value: _this.settings.engines[key],
                        options: (key == "backup" ? ["----"] : [])
                          .concat(Object.keys(translationEngines))
                          .filter(
                            key == "backup"
                              ? (n) => n != _this.settings.engines.translator
                              : (n) => n
                          )
                          .map((engineKey) => ({
                            value: engineKey,
                            label: translationEngines[engineKey]
                              ? translationEngines[engineKey].name
                              : "----",
                          })),
                        maxVisibleItems: 3,
                        onChange: (value) => {
                          _this.settings.engines[key] = value;
                          BDFDB.DataUtils.save(
                            _this.settings.engines,
                            _this,
                            "engines"
                          );
                          _this.setLanguages();
                          BDFDB.ReactUtils.forceUpdate(this);
                        },
                      }
                    ),
                  }
                )
              ),
              BDFDB.ReactUtils.createElement(
                BDFDB.LibraryComponents.SettingsSaveItem,
                {
                  type: "Switch",
                  plugin: _this,
                  keys: ["general", "sendOriginalMessage"],
                  label: _this.defaults.general.sendOriginalMessage.description,
                  tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
                  value: _this.settings.general.sendOriginalMessage,
                }
              ),
              BDFDB.ReactUtils.createElement(
                BDFDB.LibraryComponents.SettingsItem,
                {
                  type: "Switch",
                  label: "Translate your Messages before sending",
                  tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
                  value: _this.isTranslationEnabled(this.props.channelId),
                  onChange: (value) => {
                    _this.toggleTranslation(this.props.channelId);
                    BDFDB.ReactUtils.forceUpdate(this);
                  },
                }
              ),
            ]
              .flat(10)
              .filter((n) => n);
          }
        };

        const brailleConverter = {
          0: "⠴",
          1: "⠂",
          2: "⠆",
          3: "⠒",
          4: "⠲",
          5: "⠢",
          6: "⠖",
          7: "⠶",
          8: "⠦",
          9: "⠔",
          "!": "⠮",
          '"': "⠐",
          "#": "⠼",
          $: "⠫",
          "%": "⠩",
          "&": "⠯",
          "'": "⠄",
          "(": "⠷",
          ")": "⠾",
          "*": "⠡",
          "+": "⠬",
          ",": "⠠",
          "-": "⠤",
          ".": "⠨",
          "/": "⠌",
          ":": "⠱",
          ";": "⠰",
          "<": "⠣",
          "=": "⠿",
          ">": "⠜",
          "?": "⠹",
          "@": "⠈",
          a: "⠁",
          b: "⠃",
          c: "⠉",
          d: "⠙",
          e: "⠑",
          f: "⠋",
          g: "⠛",
          h: "⠓",
          i: "⠊",
          j: "⠚",
          k: "⠅",
          l: "⠇",
          m: "⠍",
          n: "⠝",
          o: "⠕",
          p: "⠏",
          q: "⠟",
          r: "⠗",
          s: "⠎",
          t: "⠞",
          u: "⠥",
          v: "⠧",
          w: "⠺",
          x: "⠭",
          y: "⠽",
          z: "⠵",
          "[": "⠪",
          "\\": "⠳",
          "]": "⠻",
          "^": "⠘",
          "⠁": "a",
          "⠂": "1",
          "⠃": "b",
          "⠄": "'",
          "⠅": "k",
          "⠆": "2",
          "⠇": "l",
          "⠈": "@",
          "⠉": "c",
          "⠊": "i",
          "⠋": "f",
          "⠌": "/",
          "⠍": "m",
          "⠎": "s",
          "⠏": "p",
          "⠐": '"',
          "⠑": "e",
          "⠒": "3",
          "⠓": "h",
          "⠔": "9",
          "⠕": "o",
          "⠖": "6",
          "⠗": "r",
          "⠘": "^",
          "⠙": "d",
          "⠚": "j",
          "⠛": "g",
          "⠜": ">",
          "⠝": "n",
          "⠞": "t",
          "⠟": "q",
          "⠠": ", ",
          "⠡": "*",
          "⠢": "5",
          "⠣": "<",
          "⠤": "-",
          "⠥": "u",
          "⠦": "8",
          "⠧": "v",
          "⠨": ".",
          "⠩": "%",
          "⠪": "[",
          "⠫": "$",
          "⠬": "+",
          "⠭": "x",
          "⠮": "!",
          "⠯": "&",
          "⠰": ";",
          "⠱": ":",
          "⠲": "4",
          "⠳": "\\",
          "⠴": "0",
          "⠵": "z",
          "⠶": "7",
          "⠷": "(",
          "⠸": "_",
          "⠹": "?",
          "⠺": "w",
          "⠻": "]",
          "⠼": "#",
          "⠽": "y",
          "⠾": ")",
          "⠿": "=",
          _: "⠸",
        };

        const morseConverter = {
          0: "−−−−−",
          1: "·−−−−",
          2: "··−−−",
          3: "···−−",
          4: "····−",
          5: "·····",
          6: "−····",
          7: "−−···",
          8: "−−−··",
          9: "−−−−·",
          "!": "−·−·−−",
          '"': "·−··−·",
          $: "···−··−",
          "&": "·−···",
          "'": "·−−−−·",
          "(": "−·−−·",
          ")": "−·−−·−",
          "+": "·−·−·",
          ",": "−−··−−",
          "-": "−····−",
          ".": "·−·−·−",
          "/": "−··−·",
          ":": "−−−···",
          ";": "−·−·−·",
          "=": "−···−",
          "?": "··−−··",
          "@": "·−−·−·",
          a: "·−",
          b: "−···",
          c: "−·−·",
          d: "−··",
          e: "·",
          f: "··−·",
          g: "−−·",
          h: "····",
          i: "··",
          j: "·−−−",
          k: "−·−",
          l: "·−··",
          m: "−−",
          n: "−·",
          o: "−−−",
          p: "·−−·",
          q: "−−·−",
          r: "·−·",
          s: "···",
          t: "−",
          u: "··−",
          v: "···−",
          w: "·−−",
          x: "−··−",
          y: "−·−−",
          z: "−−··",
          "·": "e",
          "··": "i",
          "···": "s",
          "····": "h",
          "·····": "5",
          "····−": "4",
          "···−": "v",
          "···−··−": "$",
          "···−−": "3",
          "··−": "u",
          "··−·": "f",
          "··−−··": "?",
          "··−−·−": "_",
          "··−−−": "2",
          "·−": "a",
          "·−·": "r",
          "·−··": "l",
          "·−···": "&",
          "·−··−·": '"',
          "·−·−·": "+",
          "·−·−·−": ".",
          "·−−": "w",
          "·−−·": "p",
          "·−−·−·": "@",
          "·−−−": "j",
          "·−−−−": "1",
          "·−−−−·": "'",
          "−": "t",
          "−·": "n",
          "−··": "d",
          "−···": "b",
          "−····": "6",
          "−····−": "-",
          "−···−": "=",
          "−··−": "x",
          "−··−·": "/",
          "−·−": "k",
          "−·−·": "c",
          "−·−·−·": ";",
          "−·−·−−": "!",
          "−·−−": "y",
          "−·−−·": "(",
          "−·−−·−": ")",
          "−−": "m",
          "−−·": "g",
          "−−··": "z",
          "−−···": "7",
          "−−··−−": ",",
          "−−·−": "q",
          "−−−": "o",
          "−−−··": "8",
          "−−−···": ":",
          "−−−−·": "9",
          "−−−−−": "0",
          _: "··−−·−",
        };

        const googleLanguages = [
          "af",
          "am",
          "ar",
          "az",
          "be",
          "bg",
          "bn",
          "bs",
          "ca",
          "ceb",
          "co",
          "cs",
          "cy",
          "da",
          "de",
          "el",
          "en",
          "eo",
          "es",
          "et",
          "eu",
          "fa",
          "fi",
          "fr",
          "fy",
          "ga",
          "gd",
          "gl",
          "gu",
          "ha",
          "haw",
          "hi",
          "hmn",
          "hr",
          "ht",
          "hu",
          "hy",
          "id",
          "ig",
          "is",
          "it",
          "iw",
          "ja",
          "jw",
          "ka",
          "kk",
          "km",
          "kn",
          "ko",
          "ku",
          "ky",
          "la",
          "lb",
          "lo",
          "lt",
          "lv",
          "mg",
          "mi",
          "mk",
          "ml",
          "mn",
          "mr",
          "ms",
          "mt",
          "my",
          "ne",
          "nl",
          "no",
          "ny",
          "or",
          "pa",
          "pl",
          "ps",
          "pt",
          "ro",
          "ru",
          "rw",
          "sd",
          "si",
          "sk",
          "sl",
          "sm",
          "sn",
          "so",
          "sq",
          "sr",
          "st",
          "su",
          "sv",
          "sw",
          "ta",
          "te",
          "tg",
          "th",
          "tk",
          "tl",
          "tr",
          "tt",
          "ug",
          "uk",
          "ur",
          "uz",
          "vi",
          "xh",
          "yi",
          "yo",
          "zh-CN",
          "zu",
        ];
        const translationEngines = {
          googleapi: {
            name: "Google",
            auto: true,
            funcName: "googleApiTranslate",
            languages: googleLanguages,
          },
          deepl: {
            name: "DeepL",
            auto: true,
            funcName: "deepLTranslate",
            languages: [
              "bg",
              "cs",
              "da",
              "de",
              "en",
              "el",
              "es",
              "et",
              "fi",
              "fr",
              "hu",
              "it",
              "ja",
              "lt",
              "lv",
              "nl",
              "pl",
              "pt",
              "ro",
              "ru",
              "sk",
              "sl",
              "sv",
              "zh",
            ],
          },
          itranslate: {
            name: "iTranslate",
            auto: true,
            funcName: "iTranslateTranslate",
            languages: [
              ...new Set(
                [
                  "af",
                  "ar",
                  "az",
                  "be",
                  "bg",
                  "bn",
                  "bs",
                  "ca",
                  "ceb",
                  "cs",
                  "cy",
                  "da",
                  "de",
                  "el",
                  "en",
                  "eo",
                  "es",
                  "et",
                  "eu",
                  "fa",
                  "fi",
                  "fil",
                  "fr",
                  "ga",
                  "gl",
                  "gu",
                  "ha",
                  "he",
                  "hi",
                  "hmn",
                  "hr",
                  "ht",
                  "hu",
                  "hy",
                  "id",
                  "ig",
                  "is",
                  "it",
                  "ja",
                  "jw",
                  "ka",
                  "kk",
                  "km",
                  "kn",
                  "ko",
                  "la",
                  "lo",
                  "lt",
                  "lv",
                  "mg",
                  "mi",
                  "mk",
                  "ml",
                  "mn",
                  "mr",
                  "ms",
                  "mt",
                  "my",
                  "ne",
                  "nl",
                  "no",
                  "ny",
                  "pa",
                  "pl",
                  "pt-BR",
                  "pt-PT",
                  "ro",
                  "ru",
                  "si",
                  "sk",
                  "sl",
                  "so",
                  "sq",
                  "sr",
                  "st",
                  "su",
                  "sv",
                  "sw",
                  "ta",
                  "te",
                  "tg",
                  "th",
                  "tr",
                  "uk",
                  "ur",
                  "uz",
                  "vi",
                  "we",
                  "yi",
                  "yo",
                  "zh-CN",
                  "zh-TW",
                  "zu",
                ].concat(googleLanguages)
              ),
            ].sort(),
          },
          yandex: {
            name: "Yandex",
            auto: true,
            funcName: "yandexTranslate",
            languages: [
              "af",
              "am",
              "ar",
              "az",
              "ba",
              "be",
              "bg",
              "bn",
              "bs",
              "ca",
              "ceb",
              "cs",
              "cy",
              "da",
              "de",
              "el",
              "en",
              "eo",
              "es",
              "et",
              "eu",
              "fa",
              "fi",
              "fr",
              "ga",
              "gd",
              "gl",
              "gu",
              "he",
              "hi",
              "hr",
              "ht",
              "hu",
              "hy",
              "id",
              "is",
              "it",
              "ja",
              "jv",
              "ka",
              "kk",
              "km",
              "kn",
              "ko",
              "ky",
              "la",
              "lb",
              "lo",
              "lt",
              "lv",
              "mg",
              "mhr",
              "mi",
              "mk",
              "ml",
              "mn",
              "mr",
              "ms",
              "mt",
              "my",
              "ne",
              "nl",
              "no",
              "pa",
              "pap",
              "pl",
              "pt",
              "ro",
              "ru",
              "si",
              "sk",
              "sl",
              "sq",
              "sr",
              "su",
              "sv",
              "sw",
              "ta",
              "te",
              "tg",
              "th",
              "tl",
              "tr",
              "tt",
              "udm",
              "uk",
              "ur",
              "uz",
              "vi",
              "xh",
              "yi",
              "zh",
            ],
          },
          papago: {
            name: "Papago",
            auto: false,
            funcName: "papagoTranslate",
            languages: [
              "en",
              "es",
              "fr",
              "id",
              "ja",
              "ko",
              "th",
              "vi",
              "zh-CN",
              "zh-TW",
            ],
          },
          baidu: {
            name: "Baidu",
            auto: true,
            funcName: "baiduTranslate",
            languages: [
              "en",
              "es",
              "fr",
              "id",
              "ja",
              "ko",
              "th",
              "vi",
              "zh-CN",
              "zh-TW",
            ],
          },
        };

        var languages = {};
        var favorites = [];
        var translationEnabledStates = [],
          isTranslating;
        var translatedMessages = {},
          oldMessages = {};

        return class GoogleTranslateOption extends Plugin {
          onLoad() {
            _this = this;

            this.defaults = {
              general: {
                addTranslateButton: {
                  value: true,
                  description:
                    "Adds a Translate Button to the Channel Textarea",
                },
                usePerChatTranslation: {
                  value: true,
                  description:
                    "Enables/Disables the Translator Button State per Channel and not globally",
                },
                sendOriginalMessage: {
                  value: false,
                  description:
                    "Sends the original Message together with the Translation",
                },
              },
              choices: {
                inputContext: {
                  value: "auto",
                  direction: "input",
                  place: "Context",
                  description: "Input Language in received Messages: ",
                },
                outputContext: {
                  value: "$discord",
                  direction: "output",
                  place: "Context",
                  description: "Output Language in received Messages: ",
                },
                inputMessage: {
                  value: "auto",
                  direction: "input",
                  place: "Message",
                  description: "Input Language in your sent Messages: ",
                },
                outputMessage: {
                  value: "$discord",
                  direction: "output",
                  place: "Message",
                  description: "Output Language in your sent Messages: ",
                },
              },
              exceptions: {
                wordStart: {
                  value: ["!"],
                  max: 1,
                  description:
                    "Words starting with any of these will be ignored",
                },
              },
              engines: {
                translator: {
                  value: "googleapi",
                  description: "Translation Engine",
                },
                backup: { value: "----", description: "Backup Engine" },
              },
            };

            this.patchedModules = {
              before: {
                ChannelTextAreaForm: "render",
                ChannelEditorContainer: "render",
                Embed: "render",
              },
              after: {
                ChannelTextAreaContainer: "render",
                Messages: "type",
                MessageContent: "type",
                Embed: "render",
              },
            };

            this.css = `
					${
            BDFDB.dotCN._googletranslateoptiontranslatebutton +
            BDFDB.dotCNS._googletranslateoptiontranslating +
            BDFDB.dotCN.textareaicon
          } {
						color: #F04747 !important;
					}
					${BDFDB.dotCN._googletranslateoptionreversebutton} {
						opacity: 0.5;
						margin-right: 5px;
						transition: all 200ms ease;
					}
					${BDFDB.dotCN._googletranslateoptionreversebutton}:hover {
						opacity: 1;
					}
				`;
          }

          onStart() {
            // REMOVE 25.05.2021
            let loadedFavorites = BDFDB.DataUtils.load(this, "favorites");
            if (
              BDFDB.ObjectUtils.is(loadedFavorites) &&
              Object.keys(loadedFavorites).length
            )
              BDFDB.DataUtils.save(
                Object.keys(loadedFavorites),
                this,
                "favorites"
              );

            this.forceUpdateAll();
          }

          onStop() {
            this.forceUpdateAll();
          }

          getSettingsPanel(collapseStates = {}) {
            let settingsPanel;
            return (settingsPanel = BDFDB.PluginUtils.createSettingsPanel(
              this,
              {
                collapseStates: collapseStates,
                children: (_) => {
                  let settingsItems = [];

                  for (let key in this.defaults.general)
                    settingsItems.push(
                      BDFDB.ReactUtils.createElement(
                        BDFDB.LibraryComponents.SettingsSaveItem,
                        {
                          type: "Switch",
                          plugin: this,
                          keys: ["general", key],
                          label: this.defaults.general[key].description,
                          value: this.settings.general[key],
                        }
                      )
                    );

                  settingsItems.push(
                    BDFDB.ReactUtils.createElement(
                      BDFDB.LibraryComponents.FormComponents.FormDivider,
                      {
                        className:
                          BDFDB.disCNS.dividerdefault +
                          BDFDB.disCN.marginbottom8,
                      }
                    )
                  );

                  for (let key in this.defaults.exceptions)
                    settingsItems.push(
                      BDFDB.ReactUtils.createElement(
                        BDFDB.LibraryComponents.FormComponents.FormItem,
                        {
                          title: this.defaults.exceptions[key].description,
                          className: BDFDB.disCN.marginbottom8,
                          children: BDFDB.ReactUtils.createElement(
                            BDFDB.LibraryComponents.ListInput,
                            {
                              placeholder: "New Exception",
                              maxLength: this.defaults.exceptions[key].max,
                              items: this.settings.exceptions[key],
                              onChange: (value) => {
                                this.SettingsUpdated = true;
                                BDFDB.DataUtils.save(
                                  value,
                                  this,
                                  "exceptions",
                                  key
                                );
                              },
                            }
                          ),
                        }
                      )
                    );

                  return settingsItems.flat(10);
                },
              }
            ));
          }

          onSettingsClosed() {
            if (this.SettingsUpdated) {
              delete this.SettingsUpdated;
              this.forceUpdateAll();
            }
          }

          forceUpdateAll() {
            favorites = BDFDB.DataUtils.load(this, "favorites");
            favorites = !BDFDB.ArrayUtils.is(favorites) ? [] : favorites;

            this.setLanguages();
            BDFDB.PatchUtils.forceAllUpdates(this);
            BDFDB.MessageUtils.rerenderAll();
          }

          onMessageContextMenu(e) {
            if (e.instance.props.message && e.instance.props.channel) {
              let translated = translatedMessages[e.instance.props.message.id];
              let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities")
                ? BDFDB.BDUtils.getPlugin(
                    "MessageUtilities"
                  ).getActiveShortcutString("__Translate_Message")
                : null;
              let [children, index] = BDFDB.ContextMenuUtils.findItem(
                e.returnvalue,
                { id: ["pin", "unpin"] }
              );
              if (index == -1)
                [children, index] = BDFDB.ContextMenuUtils.findItem(
                  e.returnvalue,
                  { id: ["edit", "add-reaction", "quote"] }
                );
              children.splice(
                index > -1 ? index + 1 : 0,
                0,
                BDFDB.ContextMenuUtils.createItem(
                  BDFDB.LibraryComponents.MenuItems.MenuItem,
                  {
                    label: translated
                      ? this.labels.context_messageuntranslateoption
                      : this.labels.context_messagetranslateoption,
                    id: BDFDB.ContextMenuUtils.createItemId(
                      this.name,
                      translated ? "untranslate-message" : "translate-message"
                    ),
                    hint:
                      hint &&
                      ((_) => {
                        return BDFDB.ReactUtils.createElement(
                          BDFDB.LibraryComponents.MenuItems.MenuHint,
                          {
                            hint: hint,
                          }
                        );
                      }),
                    disabled: !translated && isTranslating,
                    action: (_) =>
                      this.translateMessage(
                        e.instance.props.message,
                        e.instance.props.channel
                      ),
                  }
                )
              );
              this.injectSearchItem(e);
            }
          }

          onNativeContextMenu(e) {
            this.injectSearchItem(e);
          }

          onSlateContextMenu(e) {
            this.injectSearchItem(e);
          }

          injectSearchItem(e) {
            let text = document.getSelection().toString();
            if (text) {
              let translating, foundTranslation, foundInput, foundOutput;
              let [children, index] = BDFDB.ContextMenuUtils.findItem(
                e.returnvalue,
                { id: ["devmode-copy-id", "search-google"], group: true }
              );
              children.splice(
                index > -1 ? index + 1 : 0,
                0,
                BDFDB.ContextMenuUtils.createItem(
                  BDFDB.LibraryComponents.MenuItems.MenuGroup,
                  {
                    children: BDFDB.ContextMenuUtils.createItem(
                      BDFDB.LibraryComponents.MenuItems.MenuItem,
                      {
                        id: BDFDB.ContextMenuUtils.createItemId(
                          this.name,
                          "search-translation"
                        ),
                        disabled: isTranslating,
                        label: this.labels.context_googletranslateoption,
                        persisting: true,
                        action: (event) => {
                          let item = BDFDB.DOMUtils.getParent(
                            BDFDB.dotCN.menuitem,
                            event.target
                          );
                          if (item) {
                            let createTooltip = (_) => {
                              BDFDB.TooltipUtils.create(
                                item,
                                `${BDFDB.LanguageUtils.LibraryStrings.from} ${foundInput.name}:\n${text}\n\n${BDFDB.LanguageUtils.LibraryStrings.to} ${foundOutput.name}:\n${foundTranslation}`,
                                {
                                  type: "right",
                                  color: "brand",
                                  className: "googletranslate-tooltip",
                                }
                              );
                            };
                            if (foundTranslation && foundInput && foundOutput) {
                              if (
                                document.querySelector(
                                  ".googletranslate-tooltip"
                                )
                              ) {
                                BDFDB.ContextMenuUtils.close(e.instance);
                                BDFDB.DiscordUtils.openLink(
                                  this.getGoogleTranslatePageURL(
                                    foundInput.id,
                                    foundOutput.id,
                                    text
                                  )
                                );
                              } else createTooltip();
                            } else if (!translating) {
                              translating = true;
                              this.translateText(
                                text,
                                "context",
                                (translation, input, output) => {
                                  if (translation) {
                                    (foundTranslation = translation),
                                      (foundInput = input),
                                      (foundOutput = output);
                                    createTooltip();
                                  }
                                }
                              );
                            }
                          }
                        },
                      }
                    ),
                  }
                )
              );
            }
          }

          onMessageOptionContextMenu(e) {
            if (e.instance.props.message && e.instance.props.channel) {
              let translated =
                !!translatedMessages[e.instance.props.message.id];
              let [children, index] = BDFDB.ContextMenuUtils.findItem(
                e.returnvalue,
                { id: ["pin", "unpin"] }
              );
              children.splice(
                index + 1,
                0,
                BDFDB.ContextMenuUtils.createItem(
                  BDFDB.LibraryComponents.MenuItems.MenuItem,
                  {
                    label: translated
                      ? this.labels.context_messageuntranslateoption
                      : this.labels.context_messagetranslateoption,
                    disabled: isTranslating,
                    id: BDFDB.ContextMenuUtils.createItemId(
                      this.name,
                      translated ? "untranslate-message" : "translate-message"
                    ),
                    icon: (_) => {
                      return BDFDB.ReactUtils.createElement(
                        BDFDB.LibraryComponents.MenuItems.MenuIcon,
                        {
                          icon: translated
                            ? translateIconUntranslate
                            : translateIcon,
                        }
                      );
                    },
                    action: (_) =>
                      this.translateMessage(
                        e.instance.props.message,
                        e.instance.props.channel
                      ),
                  }
                )
              );
            }
          }

          onMessageOptionToolbar(e) {
            if (
              e.instance.props.expanded &&
              e.instance.props.message &&
              e.instance.props.channel
            ) {
              let translated =
                !!translatedMessages[e.instance.props.message.id];
              e.returnvalue.props.children.unshift();
              e.returnvalue.props.children.unshift(
                BDFDB.ReactUtils.createElement(
                  class extends BdApi.React.Component {
                    render() {
                      return BDFDB.ReactUtils.createElement(
                        BDFDB.LibraryComponents.TooltipContainer,
                        {
                          key: translated
                            ? "untranslate-message"
                            : "translate-message",
                          text: (_) =>
                            translated
                              ? _this.labels.context_messageuntranslateoption
                              : _this.labels.context_messagetranslateoption,
                          children: BDFDB.ReactUtils.createElement(
                            BDFDB.LibraryComponents.Clickable,
                            {
                              className: BDFDB.disCN.messagetoolbarbutton,
                              onClick: (_) => {
                                if (!isTranslating)
                                  _this
                                    .translateMessage(
                                      e.instance.props.message,
                                      e.instance.props.channel
                                    )
                                    .then((_) => {
                                      translated =
                                        !!translatedMessages[
                                          e.instance.props.message.id
                                        ];
                                      BDFDB.ReactUtils.forceUpdate(this);
                                    });
                              },
                              children: BDFDB.ReactUtils.createElement(
                                BDFDB.LibraryComponents.SvgIcon,
                                {
                                  className: BDFDB.disCN.messagetoolbaricon,
                                  iconSVG: translated
                                    ? translateIconUntranslate
                                    : translateIcon,
                                }
                              ),
                            }
                          ),
                        }
                      );
                    }
                  }
                )
              );
            }
          }

          processChannelTextAreaForm(e) {
            BDFDB.PatchUtils.patch(
              this,
              e.instance,
              "handleSendMessage",
              {
                instead: (e2) => {
                  if (this.isTranslationEnabled(e.instance.props.channel.id)) {
                    e2.stopOriginalMethodCall();
                    this.translateText(
                      e2.methodArguments[0],
                      "message",
                      (translation, input, output) => {
                        translation = !translation
                          ? e2.methodArguments[0]
                          : this.settings.general.sendOriginalMessage
                          ? e2.methodArguments[0] + "\n\n" + translation
                          : translation;
                        e2.originalMethod(translation);
                      }
                    );
                    return Promise.resolve({
                      shouldClear: true,
                      shouldRefocus: true,
                    });
                  } else return e2.callOriginalMethodAfterwards();
                },
              },
              { force: true, noCache: true }
            );
          }

          processChannelEditorContainer(e) {
            if (
              this.isTranslationEnabled(e.instance.props.channel.id) &&
              isTranslating
            )
              e.instance.props.disabled = true;
          }

          processChannelTextAreaContainer(e) {
            if (this.settings.general.addTranslateButton) {
              let editor = BDFDB.ReactUtils.findChild(e.returnvalue, {
                name: "ChannelEditorContainer",
              });
              if (
                editor &&
                editor.props.type ==
                  BDFDB.DiscordConstants.TextareaTypes.NORMAL &&
                !editor.props.disabled
              ) {
                let [children, index] = BDFDB.ReactUtils.findParent(
                  e.returnvalue,
                  { props: [["className", BDFDB.disCN.textareapickerbuttons]] }
                );
                if (
                  index > -1 &&
                  children[index].props &&
                  children[index].props.children
                )
                  children[index].props.children.unshift(
                    BDFDB.ReactUtils.createElement(TranslateButtonComponent, {
                      channelId: e.instance.props.channel.id,
                    })
                  );
              }
            }
          }

          processMessages(e) {
            e.returnvalue.props.children.props.channelStream = [].concat(
              e.returnvalue.props.children.props.channelStream
            );
            for (let i in e.returnvalue.props.children.props.channelStream) {
              let message =
                e.returnvalue.props.children.props.channelStream[i].content;
              if (message) {
                if (BDFDB.ArrayUtils.is(message.attachments))
                  this.checkMessage(
                    e.returnvalue.props.children.props.channelStream[i],
                    message
                  );
                else if (BDFDB.ArrayUtils.is(message))
                  for (let j in message) {
                    let childMessage = message[j].content;
                    if (
                      childMessage &&
                      BDFDB.ArrayUtils.is(childMessage.attachments)
                    )
                      this.checkMessage(message[j], childMessage);
                  }
              }
            }
          }

          checkMessage(stream, message) {
            let translation = translatedMessages[message.id];
            if (translation) stream.content.content = translation.content;
            else if (
              oldMessages[message.id] &&
              Object.keys(message).some(
                (key) =>
                  !BDFDB.equals(oldMessages[message.id][key], message[key])
              )
            ) {
              stream.content.content = oldMessages[message.id].content;
              delete oldMessages[message.id];
            }
          }

          processMessageContent(e) {
            if (e.instance.props.message) {
              let translation = translatedMessages[e.instance.props.message.id];
              if (translation && translation.content)
                e.returnvalue.props.children.push(
                  BDFDB.ReactUtils.createElement(
                    BDFDB.LibraryComponents.TooltipContainer,
                    {
                      text: `${
                        BDFDB.LanguageUtils.LibraryStrings.from
                      }: ${this.getLanguageName(translation.input)}\n${
                        BDFDB.LanguageUtils.LibraryStrings.to
                      }: ${this.getLanguageName(translation.output)}`,
                      tooltipConfig: { style: "max-width: 400px" },
                      children: BDFDB.ReactUtils.createElement("span", {
                        className: BDFDB.DOMUtils.formatClassName(
                          BDFDB.disCN.messagetimestamp,
                          BDFDB.disCN.messagetimestampinline,
                          BDFDB.disCN._googletranslateoptiontranslated
                        ),
                        children: BDFDB.ReactUtils.createElement("span", {
                          className: BDFDB.disCN.messageedited,
                          children: `(${this.labels.translated_watermark})`,
                        }),
                      }),
                    }
                  )
                );
            }
          }

          processEmbed(e) {
            if (e.instance.props.embed && e.instance.props.embed.message_id) {
              let translation =
                translatedMessages[e.instance.props.embed.message_id];
              if (translation && Object.keys(translation.embeds).length) {
                if (!e.returnvalue)
                  e.instance.props.embed = Object.assign(
                    {},
                    e.instance.props.embed,
                    {
                      rawDescription:
                        translation.embeds[e.instance.props.embed.id],
                      originalDescription:
                        e.instance.props.embed.originalDescription ||
                        e.instance.props.embed.rawDescription,
                    }
                  );
                else {
                  let [children, index] = BDFDB.ReactUtils.findParent(
                    e.returnvalue,
                    { props: [["className", BDFDB.disCN.embeddescription]] }
                  );
                  if (index > -1)
                    children[index].props.children.push(
                      BDFDB.ReactUtils.createElement(
                        BDFDB.LibraryComponents.TooltipContainer,
                        {
                          text: `${
                            BDFDB.LanguageUtils.LibraryStrings.from
                          }: ${this.getLanguageName(translation.input)}\n${
                            BDFDB.LanguageUtils.LibraryStrings.to
                          }: ${this.getLanguageName(translation.output)}`,
                          tooltipConfig: { style: "max-width: 400px" },
                          children: BDFDB.ReactUtils.createElement("span", {
                            className: BDFDB.DOMUtils.formatClassName(
                              BDFDB.disCN.messagetimestamp,
                              BDFDB.disCN.messagetimestampinline,
                              BDFDB.disCN._googletranslateoptiontranslated
                            ),
                            children: BDFDB.ReactUtils.createElement("span", {
                              className: BDFDB.disCN.messageedited,
                              children: `(${this.labels.translated_watermark})`,
                            }),
                          }),
                        }
                      )
                    );
                }
              } else if (
                !e.returnvalue &&
                e.instance.props.embed.originalDescription
              ) {
                e.instance.props.embed = Object.assign(
                  {},
                  e.instance.props.embed,
                  { rawDescription: e.instance.props.embed.originalDescription }
                );
                delete e.instance.props.embed.originalDescription;
              }
            }
          }

          toggleTranslation(channelId) {
            if (!this.isTranslationEnabled(channelId))
              translationEnabledStates.push(
                this.settings.general.usePerChatTranslation
                  ? channelId
                  : "global"
              );
            else
              BDFDB.ArrayUtils.remove(
                translationEnabledStates,
                this.settings.general.usePerChatTranslation
                  ? channelId
                  : "global",
                true
              );
          }

          isTranslationEnabled(channelId) {
            return translationEnabledStates.includes(
              this.settings.general.usePerChatTranslation ? channelId : "global"
            );
          }

          setLanguages() {
            if (
              this.settings.engines.translator == this.settings.engines.backup
            ) {
              this.settings.engines.backup = Object.keys(
                translationEngines
              ).filter((n) => n != this.settings.engines.translator)[0];
              BDFDB.DataUtils.save(this.settings.engines, this, "engines");
            }
            let engine =
              translationEngines[this.settings.engines.translator] || {};
            let backup = translationEngines[this.settings.engines.backup] || {};
            let languageIds = []
              .concat(engine.languages, backup.languages)
              .flat(10)
              .filter((n) => n);
            languages = BDFDB.ObjectUtils.deepAssign(
              !engine.auto && !backup.auto
                ? {}
                : {
                    auto: {
                      auto: true,
                      name: "Auto",
                      id: "auto",
                    },
                  },
              BDFDB.ObjectUtils.filter(BDFDB.LanguageUtils.languages, (lang) =>
                languageIds.includes(lang.id)
              ),
              {
                binary: {
                  special: true,
                  name: "Binary",
                  id: "binary",
                },
                braille: {
                  special: true,
                  name: "Braille 6-dot",
                  id: "braille",
                },
                morse: {
                  special: true,
                  name: "Morse",
                  id: "morse",
                },
              }
            );
            for (let id in languages)
              languages[id].fav = favorites.includes(id) ? 0 : 1;
            languages = BDFDB.ObjectUtils.sort(languages, "fav");
          }

          getLanguageChoice(direction, place) {
            this.setLanguages();
            let type =
              place === undefined
                ? direction
                : direction.toLowerCase() +
                  place.charAt(0).toUpperCase() +
                  place.slice(1).toLowerCase();
            let choice = this.settings.choices[type];
            choice = languages[choice] ? choice : Object.keys(languages)[0];
            choice =
              type.indexOf("output") > -1 && choice == "auto" ? "en" : choice;
            return choice;
          }

          translateMessage(message, channel) {
            return new Promise((callback) => {
              if (!message) return callback(null);
              if (translatedMessages[message.id]) {
                delete translatedMessages[message.id];
                BDFDB.MessageUtils.rerenderAll(true);
                callback(false);
              } else {
                let content = message.content || "";
                for (let embed of message.embeds)
                  content +=
                    "\n__________________ __________________ __________________\n" +
                    embed.rawDescription;
                this.translateText(
                  content,
                  "context",
                  (translation, input, output) => {
                    if (translation) {
                      oldMessages[message.id] =
                        new BDFDB.DiscordObjects.Message(message);
                      let strings = translation.split(
                        /\n{0,1}__________________ __________________ __________________\n{0,1}/
                      );
                      let content = strings.shift().trim(),
                        embeds = {};
                      for (let i in message.embeds) {
                        message.embeds[i].message_id = message.id;
                        embeds[message.embeds[i].id] = (
                          strings.shift() || message.embeds[i].rawDescription
                        ).trim();
                      }
                      translatedMessages[message.id] = {
                        content,
                        embeds,
                        input,
                        output,
                      };
                      BDFDB.MessageUtils.rerenderAll(true);
                    }
                    callback(true);
                  }
                );
              }
            });
          }

          translateText(text, type, callback) {
            let toast = null,
              toastInterval,
              finished = false,
              finishTranslation = (translation) => {
                isTranslating = false;
                if (toast) toast.close();
                BDFDB.TimeUtils.clear(toastInterval);

                if (finished) return;
                finished = true;
                if (translation)
                  translation = this.addExceptions(translation, excepts);
                callback(translation == text ? "" : translation, input, output);
              };
            let [newText, excepts, translate] = this.removeExceptions(
              text.trim(),
              type
            );
            let input = Object.assign(
              {},
              languages[this.getLanguageChoice("input", type)]
            );
            let output = Object.assign(
              {},
              languages[this.getLanguageChoice("output", type)]
            );
            if (translate && input.id != output.id) {
              let specialCase = this.checkForSpecialCase(newText, input);
              if (specialCase) {
                input.name = specialCase.name;
                switch (specialCase.id) {
                  case "binary":
                    newText = this.binary2string(newText);
                    break;
                  case "braille":
                    newText = this.braille2string(newText);
                    break;
                  case "morse":
                    newText = this.morse2string(newText);
                    break;
                }
              }
              if (output.special) {
                switch (output.id) {
                  case "binary":
                    newText = this.string2binary(newText);
                    break;
                  case "braille":
                    newText = this.string2braille(newText);
                    break;
                  case "morse":
                    newText = this.string2morse(newText);
                    break;
                }
                finishTranslation(newText);
              } else {
                const startTranslating = (engine) => {
                  isTranslating = true;
                  if (toast) toast.close();
                  BDFDB.TimeUtils.clear(toastInterval);

                  let loadingString = `${this.labels.toast_translating} (${translationEngines[engine].name}) - ${BDFDB.LanguageUtils.LibraryStrings.please_wait}`;
                  let currentLoadingString = loadingString;
                  toast = BDFDB.NotificationUtils.toast(loadingString, {
                    timeout: 0,
                    position: "center",
                    onClose: (_) => BDFDB.TimeUtils.clear(toastInterval),
                  });
                  toastInterval = BDFDB.TimeUtils.interval((_, count) => {
                    if (count > 40) {
                      finishTranslation("");
                      BDFDB.NotificationUtils.toast(
                        `${this.labels.toast_translating_failed} (${translationEngines[engine].name}) - ${this.labels.toast_translating_tryanother}`,
                        {
                          type: "danger",
                          position: "center",
                        }
                      );
                    } else {
                      currentLoadingString = currentLoadingString.endsWith(
                        "....."
                      )
                        ? loadingString
                        : currentLoadingString + ".";
                      toast.update(currentLoadingString);
                    }
                  }, 500);
                };
                if (
                  this.validTranslator(
                    this.settings.engines.translator,
                    input,
                    output,
                    specialCase
                  )
                ) {
                  startTranslating(this.settings.engines.translator);
                  this[
                    translationEngines[this.settings.engines.translator]
                      .funcName
                  ].apply(this, [
                    {
                      input,
                      output,
                      text: newText,
                      specialCase,
                      engine:
                        translationEngines[this.settings.engines.translator],
                    },
                    (translation) => {
                      if (
                        !translation &&
                        this.validTranslator(
                          this.settings.engines.backup,
                          input,
                          output,
                          specialCase
                        )
                      ) {
                        startTranslating(this.settings.engines.backup);
                        this[
                          translationEngines[this.settings.engines.backup]
                            .funcName
                        ].apply(this, [
                          {
                            input,
                            output,
                            text: newText,
                            specialCase,
                            engine:
                              translationEngines[this.settings.engines.backup],
                          },
                          finishTranslation,
                        ]);
                      } else finishTranslation(translation);
                    },
                  ]);
                } else if (
                  this.validTranslator(
                    this.settings.engines.backup,
                    input,
                    output,
                    specialCase
                  )
                ) {
                  startTranslating(this.settings.engines.backup);
                  this[
                    translationEngines[this.settings.engines.backup].funcName
                  ].apply(this, [
                    {
                      input,
                      output,
                      text: newText,
                      specialCase,
                      engine: translationEngines[this.settings.engines.backup],
                    },
                    finishTranslation,
                  ]);
                } else finishTranslation();
              }
            } else finishTranslation();
          }

          validTranslator(key, input, output, specialCase) {
            return (
              translationEngines[key] &&
              typeof this[translationEngines[key].funcName] == "function" &&
              (specialCase ||
                (input.auto && translationEngines[key].auto) ||
                (translationEngines[key].languages.includes(input.id) &&
                  translationEngines[key].languages.includes(output.id)))
            );
          }

          googleApiTranslate(data, callback) {
            BDFDB.LibraryRequires.request(
              `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${
                data.input.id
              }&tl=${
                data.output.id
              }&dt=t&dj=1&source=input&q=${encodeURIComponent(data.text)}`,
              (error, response, body) => {
                if (!error && body && response.statusCode == 200) {
                  try {
                    body = JSON.parse(body);
                    if (
                      !data.specialCase &&
                      body.src &&
                      body.src &&
                      languages[body.src]
                    ) {
                      data.input.name = languages[body.src].name;
                      data.input.ownlang = languages[body.src].ownlang;
                    }
                    callback(
                      body.sentences
                        .map((n) => n && n.trans)
                        .filter((n) => n)
                        .join("")
                    );
                  } catch (err) {
                    callback("");
                  }
                } else {
                  if (response.statusCode == 429)
                    BDFDB.NotificationUtils.toast(
                      `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Request Limit per Hour reached.`,
                      {
                        type: "danger",
                        position: "center",
                      }
                    );
                  else
                    BDFDB.NotificationUtils.toast(
                      `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Translation Server might be down.`,
                      {
                        type: "danger",
                        position: "center",
                      }
                    );
                  callback("");
                }
              }
            );
          }

          deepLTranslate(data, callback) {
            BDFDB.LibraryRequires.request(
              `https://api-free.deepl.com/v2/translate?auth_key=75cc2f40-fdae-14cd-7242-6a384e2abb9c:fx&text=${encodeURIComponent(
                data.text
              )}${
                data.input.auto ? "" : `&source_lang=${data.input.id}`
              }&target_lang=${data.output.id}`,
              (error, response, body) => {
                if (!error && body && response.statusCode == 200) {
                  try {
                    body = JSON.parse(body);
                    if (
                      !data.specialCase &&
                      body.translations[0] &&
                      body.translations[0].detected_source_language &&
                      languages[
                        body.translations[0].detected_source_language.toLowerCase()
                      ]
                    ) {
                      data.input.name =
                        languages[
                          body.translations[0].detected_source_language.toLowerCase()
                        ].name;
                      data.input.ownlang =
                        languages[
                          body.translations[0].detected_source_language.toLowerCase()
                        ].ownlang;
                    }
                    callback(
                      body.translations
                        .map((n) => n && n.text)
                        .filter((n) => n)
                        .join("")
                    );
                  } catch (err) {
                    callback("");
                  }
                } else {
                  if (response.statusCode == 429 || response.statusCode == 456)
                    BDFDB.NotificationUtils.toast(
                      `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Request Limit reached.`,
                      {
                        type: "danger",
                        position: "center",
                      }
                    );
                  else if (response.statusCode == 403)
                    BDFDB.NotificationUtils.toast(
                      `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. API-Key outdated.`,
                      {
                        type: "danger",
                        position: "center",
                      }
                    );
                  else
                    BDFDB.NotificationUtils.toast(
                      `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Translation Server might be down.`,
                      {
                        type: "danger",
                        position: "center",
                      }
                    );
                  callback("");
                }
              }
            );
          }

          iTranslateTranslate(data, callback) {
            let translate = (_) => {
              BDFDB.LibraryRequires.request.post(
                {
                  url: "https://web-api.itranslateapp.com/v3/texts/translate",
                  headers: {
                    "API-KEY": data.engine.APIkey,
                  },
                  body: JSON.stringify({
                    source: {
                      dialect: data.input.id,
                      text: data.text,
                    },
                    target: {
                      dialect: data.output.id,
                    },
                  }),
                },
                (error, response, body) => {
                  if (!error && response && response.statusCode == 200) {
                    try {
                      body = JSON.parse(body);
                      if (
                        !data.specialCase &&
                        body.source &&
                        body.source.dialect &&
                        languages[body.source.dialect]
                      ) {
                        data.input.name = languages[body.source.dialect].name;
                        data.input.ownlang =
                          languages[body.source.dialect].ownlang;
                      }
                      callback(body.target.text);
                    } catch (err) {
                      callback("");
                    }
                  } else {
                    if (response.statusCode == 429)
                      BDFDB.NotificationUtils.toast(
                        `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Request Limit reached.`,
                        {
                          type: "danger",
                          position: "center",
                        }
                      );
                    else if (response.statusCode == 403)
                      BDFDB.NotificationUtils.toast(
                        `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. API-Key outdated.`,
                        {
                          type: "danger",
                          position: "center",
                        }
                      );
                    else
                      BDFDB.NotificationUtils.toast(
                        `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Translation Server might be down.`,
                        {
                          type: "danger",
                          position: "center",
                        }
                      );
                    callback("");
                  }
                }
              );
            };
            if (data.engine.APIkey) translate();
            else
              BDFDB.LibraryRequires.request(
                "https://www.itranslate.com/js/webapp/main.js",
                { gzip: true },
                (error, response, body) => {
                  if (!error && body) {
                    let APIkey = /var API_KEY = "(.+)"/.exec(body);
                    if (APIkey) {
                      data.engine.APIkey = APIkey[1];
                      translate();
                    } else callback("");
                  } else callback("");
                }
              );
          }

          yandexTranslate(data, callback) {
            BDFDB.LibraryRequires.request(
              `https://translate.yandex.net/api/v1.5/tr/translate?key=trnsl.1.1.20191206T223907Z.52bd512eca953a5b.1ec123ce4dcab3ae859f312d27cdc8609ab280de&text=${encodeURIComponent(
                data.text
              )}&lang=${
                data.specialCase || data.input.auto
                  ? data.output.id
                  : data.input.id + "-" + data.output.id
              }&options=1`,
              (error, response, body) => {
                if (!error && body && response.statusCode == 200) {
                  body = BDFDB.DOMUtils.create(body);
                  let translation = body.querySelector("text");
                  let detected = body.querySelector("detected");
                  if (translation && detected) {
                    let detectedLang = detected.getAttribute("lang");
                    if (
                      !data.specialCase &&
                      detectedLang &&
                      languages[detectedLang]
                    ) {
                      data.input.name = languages[detectedLang].name;
                      data.input.ownlang = languages[detectedLang].ownlang;
                    }
                    callback(translation.innerText);
                  } else callback("");
                }
                if (body && body.indexOf('code="408"') > -1) {
                  BDFDB.NotificationUtils.toast(
                    `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Monthly Request Limit reached.`,
                    {
                      type: "danger",
                      position: "center",
                    }
                  );
                  callback("");
                } else {
                  BDFDB.NotificationUtils.toast(
                    `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Translation Server down or API-Key outdated.`,
                    {
                      type: "danger",
                      position: "center",
                    }
                  );
                  callback("");
                }
              }
            );
          }

          papagoTranslate(data, callback) {
            BDFDB.LibraryRequires.request.post(
              {
                url: "https://openapi.naver.com/v1/papago/n2mt",
                form: {
                  source: data.input.id,
                  target: data.output.id,
                  text: data.text,
                },
                headers: {
                  "X-Naver-Client-Id": "kUNGxtAmTJQFbaFehdjk",
                  "X-Naver-Client-Secret": "zC70k3VhpM",
                },
              },
              (error, response, body) => {
                if (!error && body && response.statusCode == 200) {
                  try {
                    let message = (JSON.parse(body) || {}).message;
                    if (message && message.body && message.body.translatedText)
                      callback(message.body.translatedText);
                    else callback("");
                  } catch (err) {
                    callback("");
                  }
                } else {
                  if (response.statusCode == 429)
                    BDFDB.NotificationUtils.toast(
                      `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Request Limit per Hour is reached.`,
                      {
                        type: "danger",
                        position: "center",
                      }
                    );
                  else
                    BDFDB.NotificationUtils.toast(
                      `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Translation Server is down or API-key outdated.`,
                      {
                        type: "danger",
                        position: "center",
                      }
                    );
                  callback("");
                }
              }
            );
          }

          baiduTranslate(data, callback) {
            var baiduLang = {
              ja: "jp",
              "zh-CN": "zh",
              "zh-TW": "cht",
            };
            data.input.id = baiduLang[data.input.id] || data.input.id;
            data.output.id = baiduLang[data.output.id] || data.output.id;
            let q = data.text;
            let appid = "20210425000799880";
            let salt = "e12h9h4rh39r8h12r8";
            let secret = "D90usZcbznwthzKC1KOb";
            let signText = appid + q + salt + secret;
            let sign = MD5(signText);
            BDFDB.LibraryRequires.request.post(
              {
                url: "https://fanyi-api.baidu.com/api/trans/vip/translate",
                form: {
                  from: data.input.id,
                  to: data.output.id,
                  q: q,
                  appid: appid,
                  salt: salt,
                  sign: sign,
                },
              },
              (error, response, result) => {
                if (!error && result && response.statusCode == 200) {
                  try {
                    let res = JSON.parse(result) || {};
                    if (!res.error_code) {
                      let message = res.trans_result;
                      if (message && message.length > 0 && res.from != res.to) {
                        var trans = "";
                        for (var msgIndex in message) {
                          var msg = message[msgIndex];
                          trans += `${decodeURIComponent(msg.dst)}`;
                          if (msgIndex < message.length - 1) {
                            trans += "\n";
                          }
                        }
                        callback(trans);
                      } else {
                        BDFDB.NotificationUtils.toast(
                          `The current language is the same as the target language, no translation required `,
                          {
                            position: "center",
                          }
                        );
                        callback("");
                      }
                    } else {
                      BDFDB.NotificationUtils.toast(
                        `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${res.error_code} : ${res.error_msg}.`,
                        {
                          type: "danger",
                          position: "center",
                        }
                      );
                      callback("");
                    }
                  } catch (err) {
                    callback("");
                  }
                } else {
                  BDFDB.NotificationUtils.toast(
                    `${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Translation Server is down.`,
                    {
                      type: "danger",
                      position: "center",
                    }
                  );
                  callback("");
                }
              }
            );
          }

          checkForSpecialCase(text, input) {
            if (input.special) return input;
            else if (input.auto) {
              if (/^[0-1]*$/.test(text.replace(/\s/g, ""))) {
                return { id: "binary", name: "Binary" };
              } else if (
                /^[⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿]*$/.test(
                  text.replace(/\s/g, "")
                )
              ) {
                return { id: "braille", name: "Braille 6-dot" };
              } else if (/^[/|·−._-]*$/.test(text.replace(/\s/g, ""))) {
                return { id: "morse", name: "Morse" };
              }
            }
            return null;
          }

          string2binary(string) {
            let binary = "";
            for (let character of string)
              binary +=
                parseInt(character.charCodeAt(0).toString(2))
                  .toPrecision(8)
                  .split(".")
                  .reverse()
                  .join("")
                  .toString() + " ";
            return binary;
          }

          string2braille(string) {
            let braille = "";
            for (let character of string)
              braille += brailleConverter[character.toLowerCase()]
                ? brailleConverter[character.toLowerCase()]
                : character;
            return braille;
          }

          string2morse(string) {
            string = string.replace(/ /g, "%%%%%%%%%%");
            let morse = "";
            for (let character of string)
              morse +=
                (morseConverter[character.toLowerCase()]
                  ? morseConverter[character.toLowerCase()]
                  : character) + " ";
            morse = morse.split("\n");
            for (let i in morse) morse[i] = morse[i].trim();
            return morse.join("\n").replace(/% % % % % % % % % % /g, "/ ");
          }

          binary2string(binary) {
            let string = "";
            binary = binary
              .replace(/\n/g, "00001010")
              .replace(/\r/g, "00001101")
              .replace(/\t/g, "00001001")
              .replace(/\s/g, "");
            if (/^[0-1]*$/.test(binary)) {
              let eightDigits = "";
              let counter = 0;
              for (let digit of binary) {
                eightDigits += digit;
                counter++;
                if (counter > 7) {
                  string += String.fromCharCode(
                    parseInt(eightDigits, 2).toString(10)
                  );
                  eightDigits = "";
                  counter = 0;
                }
              }
            } else
              BDFDB.NotificationUtils.toast(
                "Invalid binary format. Only use 0s and 1s.",
                {
                  type: "danger",
                  position: "center",
                }
              );
            return string;
          }

          braille2string(braille) {
            let string = "";
            for (let character of braille)
              string += brailleConverter[character.toLowerCase()]
                ? brailleConverter[character.toLowerCase()]
                : character;
            return string;
          }

          morse2string(morse) {
            let string = "";
            for (let word of morse
              .replace(/[_-]/g, "−")
              .replace(/\./g, "·")
              .replace(/\r|\t/g, "")
              .split(/\/|\||\n/g)) {
              for (let characterstr of word.trim().split(" "))
                string += morseConverter[characterstr]
                  ? morseConverter[characterstr]
                  : characterstr;
              string += " ";
            }
            return string.trim();
          }

          addExceptions(string, excepts) {
            for (let count in excepts) {
              let exception =
                BDFDB.ArrayUtils.is(this.settings.exceptions.wordStart) &&
                this.settings.exceptions.wordStart.some(
                  (n) => excepts[count].indexOf(n) == 0
                )
                  ? excepts[count].slice(1)
                  : excepts[count];
              let newString = string.replace(
                new RegExp(BDFDB.StringUtils.regEscape(`{{${count}}}`)),
                exception
              );
              if (newString == string) string = newString + " " + exception;
              else string = newString;
            }
            return string;
          }

          removeExceptions(string, type) {
            let excepts = {},
              newString = [],
              count = 0;
            if (type == "context") {
              let text = [],
                i = 0;
              string.split("").forEach((chara) => {
                if (chara == "<" && text[i]) i++;
                text[i] = text[i] ? text[i] + chara : chara;
                if (chara == ">") i++;
              });
              for (let j in text) {
                if (text[j].indexOf("<") == 0) {
                  newString.push(`{{${count}}}`);
                  excepts[count] = text[j];
                  count++;
                } else newString.push(text[j]);
              }
            } else {
              let usedExceptions = BDFDB.ArrayUtils.is(
                this.settings.exceptions.wordStart
              )
                ? this.settings.exceptions.wordStart
                : [];
              string.split(" ").forEach((word) => {
                if (
                  word.indexOf("<@!") == 0 ||
                  word.indexOf("<#") == 0 ||
                  word.indexOf(":") == 0 ||
                  word.indexOf("<:") == 0 ||
                  word.indexOf("<a:") == 0 ||
                  word.indexOf("@") == 0 ||
                  word.indexOf("#") == 0 ||
                  usedExceptions.some(
                    (n) => word.indexOf(n) == 0 && word.length > 1
                  )
                ) {
                  newString.push(`{{${count}}}`);
                  excepts[count] = word;
                  count++;
                } else newString.push(word);
              });
            }
            return [
              newString.join(" "),
              excepts,
              newString.length - count != 0,
            ];
          }

          getGoogleTranslatePageURL(input, output, text) {
            return `https://translate.google.com/#${
              BDFDB.LanguageUtils.languages[input] ? input : "auto"
            }/${output}/${encodeURIComponent(text)}`;
          }

          getLanguageName(language) {
            if (language.name.startsWith("Discord"))
              return (
                language.name.slice(0, -1) +
                (language.ownlang &&
                languages[language.id].name != language.ownlang
                  ? ` / ${language.ownlang}`
                  : "") +
                ")"
              );
            else
              return (
                language.name +
                (language.ownlang && language.name != language.ownlang
                  ? ` / ${language.ownlang}`
                  : "")
              );
          }

          setLabelsByLanguage() {
            switch (BDFDB.LanguageUtils.getLanguage().id) {
              case "bg": // Bulgarian
                return {
                  context_googletranslateoption: "Търсене превод",
                  context_messagetranslateoption: "Превод на съобщението",
                  context_messageuntranslateoption: "Превод на съобщението",
                  popout_translateoption: "Превод",
                  popout_untranslateoption: "Непревод",
                  toast_translating: "Превод",
                  toast_translating_failed: "Преводът не бе успешен",
                  toast_translating_tryanother: "Опитайте друг преводач",
                  translated_watermark: "преведено",
                };
              case "da": // Danish
                return {
                  context_googletranslateoption: "Søg oversættelse",
                  context_messagetranslateoption: "Oversæt besked",
                  context_messageuntranslateoption: "Ikke-oversat besked",
                  popout_translateoption: "Oversætte",
                  popout_untranslateoption: "Untranslate",
                  toast_translating: "Oversætter",
                  toast_translating_failed: "Kunne ikke oversætte",
                  toast_translating_tryanother: "Prøv en anden oversætter",
                  translated_watermark: "oversat",
                };
              case "de": // German
                return {
                  context_googletranslateoption: "Übersetzung suchen",
                  context_messagetranslateoption: "Nachricht übersetzen",
                  context_messageuntranslateoption: "Nachricht unübersetzen",
                  popout_translateoption: "Übersetzen",
                  popout_untranslateoption: "Unübersetzen",
                  toast_translating: "Übersetzen",
                  toast_translating_failed: "Übersetzung fehlgeschlagen",
                  toast_translating_tryanother:
                    "Versuch einen anderen Übersetzer",
                  translated_watermark: "übersetzt",
                };
              case "el": // Greek
                return {
                  context_googletranslateoption: "Αναζήτηση μετάφρασης",
                  context_messagetranslateoption: "Μετάφραση μηνύματος",
                  context_messageuntranslateoption: "Μη μετάφραση μηνύματος",
                  popout_translateoption: "Μεταφράζω",
                  popout_untranslateoption: "Μη μετάφραση",
                  toast_translating: "Μετάφραση",
                  toast_translating_failed: "Αποτυχία μετάφρασης",
                  toast_translating_tryanother:
                    "Δοκιμάστε έναν άλλο Μεταφραστή",
                  translated_watermark: "μεταφρασμένο",
                };
              case "es": // Spanish
                return {
                  context_googletranslateoption: "Buscar traducción",
                  context_messagetranslateoption: "Traducir mensaje",
                  context_messageuntranslateoption: "Mensaje sin traducir",
                  popout_translateoption: "Traducir",
                  popout_untranslateoption: "No traducir",
                  toast_translating: "Traductorio",
                  toast_translating_failed: "No se pudo traducir",
                  toast_translating_tryanother: "Prueba con otro traductor",
                  translated_watermark: "traducido",
                };
              case "fi": // Finnish
                return {
                  context_googletranslateoption: "Hae käännöstä",
                  context_messagetranslateoption: "Käännä viesti",
                  context_messageuntranslateoption: "Käännä viesti",
                  popout_translateoption: "Kääntää",
                  popout_untranslateoption: "Käännä",
                  toast_translating: "Kääntäminen",
                  toast_translating_failed: "Käännös epäonnistui",
                  toast_translating_tryanother: "Kokeile toista kääntäjää",
                  translated_watermark: "käännetty",
                };
              case "fr": // French
                return {
                  context_googletranslateoption: "Recherche de traduction",
                  context_messagetranslateoption: "Traduire le message",
                  context_messageuntranslateoption: "Message non traduit",
                  popout_translateoption: "Traduire",
                  popout_untranslateoption: "Non traduit",
                  toast_translating: "Traduction en cours",
                  toast_translating_failed: "Échec de la traduction",
                  toast_translating_tryanother: "Essayez un autre traducteur",
                  translated_watermark: "traduit",
                };
              case "hr": // Croatian
                return {
                  context_googletranslateoption: "Pretraži prijevod",
                  context_messagetranslateoption: "Prevedi poruku",
                  context_messageuntranslateoption: "Prevedi poruku",
                  popout_translateoption: "Prevedi",
                  popout_untranslateoption: "Neprevedi",
                  toast_translating: "Prevođenje",
                  toast_translating_failed: "Prijevod nije uspio",
                  toast_translating_tryanother:
                    "Pokušajte s drugim prevoditeljem",
                  translated_watermark: "prevedeno",
                };
              case "hu": // Hungarian
                return {
                  context_googletranslateoption: "Keresés a fordításban",
                  context_messagetranslateoption: "Üzenet lefordítása",
                  context_messageuntranslateoption: "Az üzenet lefordítása",
                  popout_translateoption: "fordít",
                  popout_untranslateoption: "Fordítás le",
                  toast_translating: "Fordítás",
                  toast_translating_failed: "Nem sikerült lefordítani",
                  toast_translating_tryanother: "Próbálkozzon másik fordítóval",
                  translated_watermark: "lefordított",
                };
              case "it": // Italian
                return {
                  context_googletranslateoption: "Cerca traduzione",
                  context_messagetranslateoption: "Traduci messaggio",
                  context_messageuntranslateoption:
                    "Annulla traduzione messaggio",
                  popout_translateoption: "Tradurre",
                  popout_untranslateoption: "Non tradurre",
                  toast_translating: "Tradurre",
                  toast_translating_failed: "Impossibile tradurre",
                  toast_translating_tryanother: "Prova un altro traduttore",
                  translated_watermark: "tradotto",
                };
              case "ja": // Japanese
                return {
                  context_googletranslateoption: "翻訳を検索",
                  context_messagetranslateoption: "メッセージの翻訳",
                  context_messageuntranslateoption: "メッセージの翻訳解除",
                  popout_translateoption: "翻訳する",
                  popout_untranslateoption: "翻訳しない",
                  toast_translating: "翻訳",
                  toast_translating_failed: "翻訳に失敗しました",
                  toast_translating_tryanother: "別の翻訳者を試す",
                  translated_watermark: "翻訳済み",
                };
              case "ko": // Korean
                return {
                  context_googletranslateoption: "번역 검색",
                  context_messagetranslateoption: "메시지 번역",
                  context_messageuntranslateoption: "메시지 번역 취소",
                  popout_translateoption: "옮기다",
                  popout_untranslateoption: "번역 취소",
                  toast_translating: "번역 중",
                  toast_translating_failed: "번역하지 못했습니다.",
                  toast_translating_tryanother: "다른 번역기 시도",
                  translated_watermark: "번역",
                };
              case "lt": // Lithuanian
                return {
                  context_googletranslateoption: "Paieškos vertimas",
                  context_messagetranslateoption: "Versti pranešimą",
                  context_messageuntranslateoption: "Išversti pranešimą",
                  popout_translateoption: "Išversti",
                  popout_untranslateoption: "Neišversti",
                  toast_translating: "Vertimas",
                  toast_translating_failed: "Nepavyko išversti",
                  toast_translating_tryanother: "Išbandykite kitą vertėją",
                  translated_watermark: "išverstas",
                };
              case "nl": // Dutch
                return {
                  context_googletranslateoption: "Zoek vertaling",
                  context_messagetranslateoption: "Bericht vertalen",
                  context_messageuntranslateoption: "Bericht onvertalen",
                  popout_translateoption: "Vertalen",
                  popout_untranslateoption: "Onvertalen",
                  toast_translating: "Vertalen",
                  toast_translating_failed: "Kan niet vertalen",
                  toast_translating_tryanother: "Probeer een andere vertaler",
                  translated_watermark: "vertaald",
                };
              case "no": // Norwegian
                return {
                  context_googletranslateoption: "Søk i oversettelse",
                  context_messagetranslateoption: "Oversett melding",
                  context_messageuntranslateoption: "Ikke oversett melding",
                  popout_translateoption: "Oversette",
                  popout_untranslateoption: "Ikke oversett",
                  toast_translating: "Oversetter",
                  toast_translating_failed: "Kunne ikke oversette",
                  toast_translating_tryanother: "Prøv en annen oversetter",
                  translated_watermark: "oversatt",
                };
              case "pl": // Polish
                return {
                  context_googletranslateoption: "Wyszukaj tłumaczenie",
                  context_messagetranslateoption: "Przetłumacz wiadomość",
                  context_messageuntranslateoption: "Nieprzetłumacz wiadomość",
                  popout_translateoption: "Tłumaczyć",
                  popout_untranslateoption: "Nie przetłumacz",
                  toast_translating: "Tłumaczenie",
                  toast_translating_failed: "Nie udało się przetłumaczyć",
                  toast_translating_tryanother: "Wypróbuj innego tłumacza",
                  translated_watermark: "przetłumaczony",
                };
              case "pt-BR": // Portuguese (Brazil)
                return {
                  context_googletranslateoption: "Tradução de pesquisa",
                  context_messagetranslateoption: "Traduzir mensagem",
                  context_messageuntranslateoption: "Mensagem não traduzida",
                  popout_translateoption: "Traduzir",
                  popout_untranslateoption: "Não traduzido",
                  toast_translating: "Traduzindo",
                  toast_translating_failed: "Falha ao traduzir",
                  toast_translating_tryanother: "Tente outro tradutor",
                  translated_watermark: "traduzido",
                };
              case "ro": // Romanian
                return {
                  context_googletranslateoption: "Căutare traducere",
                  context_messagetranslateoption: "Traduceți mesajul",
                  context_messageuntranslateoption: "Untraduceți mesajul",
                  popout_translateoption: "Traduceți",
                  popout_untranslateoption: "Netradus",
                  toast_translating: "Traducere",
                  toast_translating_failed: "Nu s-a putut traduce",
                  toast_translating_tryanother: "Încercați un alt traducător",
                  translated_watermark: "tradus",
                };
              case "ru": // Russian
                return {
                  context_googletranslateoption: "Искать перевод",
                  context_messagetranslateoption: "Перевести сообщение",
                  context_messageuntranslateoption: "Непереведенное сообщение",
                  popout_translateoption: "Переведите",
                  popout_untranslateoption: "Неперевести",
                  toast_translating: "Идет перевод",
                  toast_translating_failed: "Не удалось перевести",
                  toast_translating_tryanother: "Попробуйте другой переводчик",
                  translated_watermark: "переведено",
                };
              case "sv": // Swedish
                return {
                  context_googletranslateoption: "Sök översättning",
                  context_messagetranslateoption: "Översätt meddelande",
                  context_messageuntranslateoption: "Untranslate meddelande",
                  popout_translateoption: "Översätt",
                  popout_untranslateoption: "Untranslate",
                  toast_translating: "Översätter",
                  toast_translating_failed: "Det gick inte att översätta",
                  toast_translating_tryanother: "Prova en annan översättare",
                  translated_watermark: "översatt",
                };
              case "th": // Thai
                return {
                  context_googletranslateoption: "ค้นหาคำแปล",
                  context_messagetranslateoption: "แปลข้อความ",
                  context_messageuntranslateoption: "ยกเลิกการแปลข้อความ",
                  popout_translateoption: "แปลภาษา",
                  popout_untranslateoption: "ไม่แปล",
                  toast_translating: "กำลังแปล",
                  toast_translating_failed: "แปลไม่สำเร็จ",
                  toast_translating_tryanother: "ลองใช้นักแปลคนอื่น",
                  translated_watermark: "แปล",
                };
              case "tr": // Turkish
                return {
                  context_googletranslateoption: "Çeviri ara",
                  context_messagetranslateoption: "Mesajı Çevir",
                  context_messageuntranslateoption: "Çeviriyi Kaldır Mesajı",
                  popout_translateoption: "Çevirmek",
                  popout_untranslateoption: "Çevirmeyi kaldır",
                  toast_translating: "Çeviri",
                  toast_translating_failed: "Tercüme edilemedi",
                  toast_translating_tryanother: "Başka bir Çevirmen deneyin",
                  translated_watermark: "tercüme",
                };
              case "uk": // Ukrainian
                return {
                  context_googletranslateoption: "Пошук перекладу",
                  context_messagetranslateoption: "Перекласти повідомлення",
                  context_messageuntranslateoption:
                    "Неперекладене повідомлення",
                  popout_translateoption: "Перекласти",
                  popout_untranslateoption: "Неперекласти",
                  toast_translating: "Переклад",
                  toast_translating_failed: "Не вдалося перекласти",
                  toast_translating_tryanother: "Спробуйте іншого перекладача",
                  translated_watermark: "переклав",
                };
              case "vi": // Vietnamese
                return {
                  context_googletranslateoption: "Tìm kiếm bản dịch",
                  context_messagetranslateoption: "Dịch tin nhắn",
                  context_messageuntranslateoption: "Thư chưa dịch",
                  popout_translateoption: "Phiên dịch",
                  popout_untranslateoption: "Chưa dịch",
                  toast_translating: "Phiên dịch",
                  toast_translating_failed: "Không dịch được",
                  toast_translating_tryanother: "Thử một Trình dịch khác",
                  translated_watermark: "đã dịch",
                };
              case "zh-CN": // Chinese (China)
                return {
                  context_googletranslateoption: "搜索翻译",
                  context_messagetranslateoption: "翻译消息",
                  context_messageuntranslateoption: "取消翻译消息",
                  popout_translateoption: "翻译",
                  popout_untranslateoption: "取消翻译",
                  toast_translating: "正在翻译",
                  toast_translating_failed: "翻译失败",
                  toast_translating_tryanother: "尝试其他翻译器",
                  translated_watermark: "已翻译",
                };
              case "zh-TW": // Chinese (Taiwan)
                return {
                  context_googletranslateoption: "搜索翻譯",
                  context_messagetranslateoption: "翻譯訊息",
                  context_messageuntranslateoption: "取消翻譯訊息",
                  popout_translateoption: "翻譯",
                  popout_untranslateoption: "取消翻譯",
                  toast_translating: "正在翻譯",
                  toast_translating_failed: "翻譯失敗",
                  toast_translating_tryanother: "嘗試其他翻譯器",
                  translated_watermark: "已翻譯",
                };
              default:
                // English
                return {
                  context_googletranslateoption: "Search Translation",
                  context_messagetranslateoption: "Translate Message",
                  context_messageuntranslateoption: "Untranslate Message",
                  popout_translateoption: "Translate",
                  popout_untranslateoption: "Untranslate",
                  toast_translating: "Translating",
                  toast_translating_failed: "Failed to translate",
                  toast_translating_tryanother: "Try another Translator",
                  translated_watermark: "translated",
                };
            }
          }
        };
      })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
