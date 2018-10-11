module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDFDB !== "object") global.BDFDB = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;

	return class extends Plugin {
		initConstructor () {
			this.labels = {};
			
			this.languages = {};
			
			this.doTranslate = false;
			this.translating = false;
				
			this.defaults = {
				settings: {
					sendOriginalMessage:	{value:false, 	description:"Send the original message together with the translation."}
				},
				translators: {
					useGoogle:				{value:true, 	choice1:"DeepL", 	choice2:"Google",		popout:true}
				},
				choices: {
					inputContext:			{value:"auto", 		place:"Context", 		direction:"Input",		popout:false, 		description:"Input Language in selected Messages:"},
					outputContext:			{value:"$discord", 	place:"Context", 		direction:"Output",		popout:false, 		description:"Output Language in selected Messages:"},
					inputMessage:			{value:"auto", 		place:"Message", 		direction:"Input",		popout:true, 		description:"Input Language in your Message:"},
					outputMessage:			{value:"$discord", 	place:"Message", 		direction:"Output",		popout:true, 		description:"Output Language in your Message:"}
				}
			};

			this.messageContextEntryMarkup =
				`<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} messagetranslateoption-item">
						<span>REPLACE_context_messagetranslateoption_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>`;

			this.messageContextEntryMarkup2 =
				`<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} googletranslateoption-item">
						<span>REPLACE_context_googletranslateoption_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>`;
			
			this.optionButtonMarkup = 
				`<div class="${BDFDB.disCN.optionpopoutbutton} btn-googletranslateoption"></div>`;
			
			this.optionsPopoutMarkup = 
				`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottom + BDFDB.disCN.popoutnoarrow} popout-googletranslateoption-options" style="z-index: 1000; visibility: visible;">
					<div class="${BDFDB.disCN.optionpopout}"></div
				</div>`;
				
			this.popoutEntryMarkup = 
				`<div class="${BDFDB.disCNS.optionpopoutitem + BDFDB.disCN.weightmedium} btn-item-googletranslateoption">REPLACE_popout_translateoption_text</div>`;
				
			this.translateButtonMarkup = 
				`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="translate-button" width="22" height="30" fill="currentColor">
					<path d="M 19.794, 3.299 H 9.765 L 8.797, 0 h -6.598 C 0.99, 0, 0, 0.99, 0, 2.199 V 16.495 c 0, 1.21, 0.99, 2.199, 2.199, 2.199 H 9.897 l 1.1, 3.299 H 19.794 c 1.21, 0, 2.199 -0.99, 2.199 -2.199 V 5.498 C 21.993, 4.289, 21.003, 3.299, 19.794, 3.299 z M 5.68, 13.839 c -2.48, 0 -4.492 -2.018 -4.492 -4.492 s 2.018 -4.492, 4.492 -4.492 c 1.144, 0, 2.183, 0.407, 3.008, 1.171 l 0.071, 0.071 l -1.342, 1.298 l -0.066 -0.06 c -0.313 -0.297 -0.858 -0.643 -1.671 -0.643 c -1.441, 0 -2.612, 1.193 -2.612, 2.661 c 0, 1.468, 1.171, 2.661, 2.612, 2.661 c 1.507, 0, 2.161 -0.962, 2.337 -1.606 h -2.43 v -1.704 h 4.344 l 0.016, 0.077 c 0.044, 0.231, 0.06, 0.434, 0.06, 0.665 C 10.001, 12.036, 8.225, 13.839, 5.68, 13.839 z M 11.739, 9.979 h 4.393 c 0, 0 -0.374, 1.446 -1.715, 3.008 c -0.588 -0.676 -0.995 -1.336 -1.254 -1.864 h -1.089 L 11.739, 9.979 z M 13.625, 13.839 l -0.588, 0.583 l -0.72 -2.452 C 12.685, 12.63, 13.13, 13.262, 13.625, 13.839 z M 20.893, 19.794 c 0, 0.605 -0.495, 1.1 -1.1, 1.1 H 12.096 l 2.199 -2.199 l -0.896 -3.041 l 1.012 -1.012 l 2.953, 2.953 l 0.803 -0.803 l -2.975 -2.953 c 0.99 -1.138, 1.759 -2.474, 2.106 -3.854 h 1.397 V 8.841 H 14.697 v -1.144 h -1.144 v 1.144 H 11.398 l -1.309 -4.443 H 19.794 c 0.605, 0, 1.1, 0.495, 1.1, 1.1 V 19.794 z"/>
				</svg>`;
				
			this.reverseButtonMarkup = 
				`<svg class="reverse-button ${BDFDB.disCN.flexchild}" type="REPLACETYPE" version="1.1" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" style="flex: 0 0 auto;">
					 <path d="M 0, 10.515 c 0, 2.892, 1.183, 5.521, 3.155, 7.361 L 0, 21.031 h 7.887 V 13.144 l -2.892, 2.892 C 3.549, 14.722, 2.629, 12.75, 2.629, 10.515 c 0 -3.418, 2.235 -6.309, 5.258 -7.492 v -2.629 C 3.418, 1.577, 0, 5.652, 0, 10.515 z M 21.031, 0 H 13.144 v 7.887 l 2.892 -2.892 C 17.482, 6.309, 18.402, 8.281, 18.402, 10.515 c 0, 3.418 -2.235, 6.309 -5.258, 7.492 V 20.768 c 4.469 -1.183, 7.887 -5.258, 7.887 -10.121 c 0 -2.892 -1.183 -5.521 -3.155 -7.361 L 21.031, 0 z"/>
				</svg>`;
				
				
			this.translatePopoutMarkup = 
				`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCNS.popoutnoarrow + BDFDB.disCN.popoutnoshadow} popout-googletranslate DevilBro-modal" style="z-index: 2000; overflow: visible; visibility: visible; transform: translateX(-100%) translateY(-100%) translateZ(0px);">
					<div class="${BDFDB.disCN.popoutthemedpopout}">
						<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop8 + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
							<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Words starting with "!" will be ignored</h3>
						</div>
						${Object.keys(this.defaults.choices).map((key, i) =>
						`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop8 + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
							<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.choices[key].description}</h3>
							${this.defaults.choices[key].direction == "Output" ? this.reverseButtonMarkup.replace("REPLACETYPE",key) : ""}
						</div>
						<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
							<div class="${BDFDB.disCN.selectwrap}" style="flex: 1 1 auto;">
								<div class="${BDFDB.disCNS.select + BDFDB.disCNS.selectsingle + BDFDB.disCN.selecthasvalue}" type="${key}" value="${this.defaults.choices[key].value}">
									<div class="${BDFDB.disCN.selectcontrol}">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectvalue}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 auto;"></div>
										</div>
										<span class="${BDFDB.disCN.selectarrowzone}">
											<span class="${BDFDB.disCN.selectarrow}"></span>
										</span>
									</div>
								</div>
							</div>
						</div>`).join("")}
						<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
							<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Translate:</h3>
							<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCNS.switchthemedefault + BDFDB.disCN.switchvalueunchecked}" style="flex: 0 0 auto;">
								<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="translating-checkbox">
							</div>
						</div>
						${Object.keys(this.defaults.translators).map((key, i) =>
						`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
							<h3 class="flex-3B1Tl4 justifyStart-2yIZo0 ${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Translator:</h3>
							<h3 class="flex-3B1Tl4 justifyStart-2yIZo0 ${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.translators[key].choice1}</h3>
							<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCNS.switchthemedefault + BDFDB.disCN.switchvalueunchecked}" style="flex: 0 0 auto;">
								<input type="checkbox" option="translators" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}">
							</div>
							<h3 class="flex-3B1Tl4 justifyEnd-1ceqOU ${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.translators[key].choice2}</h3>
						</div>`).join("")}
					</div>
				</div>`;
				
		
			this.DeepLTranslateAPI = function () {
				var INPUT, OUTPUT, clearInput, current, domReady, enabled, executeScript, getLanguage, getOutput, langI, langO, setInput, setLanguage, timer, wc, webview;
				var _extends = Object.assign || function (target) {
					for (var i = 1; i < arguments.length; i++) {
						var source = arguments[i];for (var key in source) {
							if (Object.prototype.hasOwnProperty.call(source, key)) {
								target[key] = source[key];
							}
						}
					}return target;
				}
				class DeepLTranslateAPI {
					start() {
						enabled = true;
						webview = document.createElement("webview");
						webview.style.visibility = "hidden";
						webview.id = "wvDeepLTranslateAPI";
						webview.partition = "persist:DeepLTranslateAPI";
						webview.addEventListener("dom-ready", async function () {
							wc = webview.getWebContents();
							webview.setAudioMuted(true);
							domReady = await executeScript(function () {
								var tas = document.querySelectorAll("textarea");
								window["INPUT"] = tas[0];
								window["OUTPUT"] = tas[1];
								return Promise.resolve(true);
							});
						});
						webview.src = "https://www.deepl.com/translator";
						document.body.appendChild(webview);
					}

					stop() {
						enabled = domReady = false;
						// webview.terminate()
						webview.remove();
						if (timer) {
							cancelAnimationFrame(timer);
						}
						if (current != null) {
							current.reject(new Error("DeepLTranslateAPI was stopped."));
						}
						webview = wc = langI = langO = current = timer = null;
					}

					isReady() {
						return domReady;
					}

					translate(text) {
						return new Promise(function (resolve, reject) {
							if (langI === langO) {
								return resolve(text);
							}
							if (!enabled) {
								return reject(new Error("DeepLTranslateAPI is disabled!"));
							}
							if (!domReady) {
								return reject(new Error("DeepL didn't load (yet?)!"));
							}
							if (current != null) {
								current.reject(new Error("Can only translate so much."));
							}
							current = { resolve, reject };
							(async function () {
								var __unchanged__, valueNew, valueOld;
								valueOld = await getOutput();
								({ __unchanged__ } = await setInput(text));
								if (true === __unchanged__) {
									valueOld = void 0;
								}
								if (timer) {
									return;
								}
								// todo: figgure out event based change on output
								while (enabled && valueOld === (valueNew = await getOutput())) {
									await new Promise(function (c) {
										return timer = requestAnimationFrame(c);
									});
								}
								current.resolve(valueNew);
								timer = current = null;
							})();
						});
					}

					setInputLanguage(lang) {
						return setLanguage(true, lang);
					}

					setOutputLanguage(lang) {
						return setLanguage(false, lang);
					}

					getInputLanguage(lang) {
						return getLanguage(true);
					}

					getOutputLanguage(lang) {
						return getLanguage(false);
					}

					clearInput() {
						return clearInput();
					}

				};

				webview = wc = current = timer = null;

				enabled = domReady = false;

				langI = langO = "auto";

				INPUT = "#_ta0#input#DeepLTranslateAPI#";

				OUTPUT = "#_ta1#output#DeepLTranslateAPI#";

				executeScript = function (replace, func) {
					var code, k, v;
					if (!func) {
						func = replace;
						replace = { INPUT, OUTPUT };
					} else {
						replace = _extends({ INPUT, OUTPUT }, replace);
					}
					code = "(" + func.toString() + ")()";
					for (k in replace) {
						v = replace[k];
						if ("string" === typeof v) {
							v = v.split("\n").join("\\n");
							v = v.replace(/[^\w\d\s]/g, "\\$&");
						}
						code = code.split(k).join(v);
					}
					return wc.executeJavaScript(code);
				};

				setInput = function (text) {
					return executeScript({ text }, function () {
						return Promise.resolve(window["INPUT"].value === "text" ? {
							__unchanged__: true
						} : (window["INPUT"].value = "text", window["INPUT"].dispatchEvent(new Event("change")), window["INPUT"].value));
					});
				};

				getOutput = function () {
					return executeScript(function () {
						return Promise.resolve(window["OUTPUT"].value);
					});
				};

				setLanguage = async function (inputOrOutput, lang) {
					if (!domReady) {
						throw new Error("DeepL didn't load (yet?)!");
					}
					lang = !lang || lang === "auto" ? lang : lang.toUpperCase();
					if (!(lang === "DE" || lang === "EN" || lang === "FR" || lang === "ES" || lang === "IT" || lang === "NL" || lang === "PL" || inputOrOutput && "auto" === lang)) {
						throw new Error(`${lang} is not a supported language!`);
					}
					if (inputOrOutput) {
						langI = lang;
					} else {
						if (langI === (langO = lang)) {
							return;
						}
					}
					await executeScript({
						inputOrOutput,
						__lang____: lang
					}, function () {
						document.querySelector(`.lmt__language_select--${inputOrOutput ? "source" : "target"} li[dl-value=__lang____]`).click();
					});
				};

				getLanguage = async function (inputOrOutput) {
					if (!domReady) {
						throw new Error("DeepL didn't load (yet?)!");
					}
					return await executeScript({ inputOrOutput }, function () {
						return Promise.resolve(document.querySelector(`.lmt__language_select--${inputOrOutput ? "source" : "target"}`).getAttribute("dl-value"));
					});
				};

				clearInput = async function () {
					if (!domReady) {
						throw new Error("DeepL didn't load (yet?)!");
					}
					await executeScript(function () {
						document.querySelector(".lmt__clear_text_button").click();
					});
				};

				return DeepLTranslateAPI;
			}.call(this);
				
			this.css = `
				.chat form textarea {
					padding-right: 0 !important;
				}
				
				.translate-button {
					position: absolute;
					right: 46px;
					top: 11px;
					opacity: 0.2;
					transition: all 200ms ease;
				}
				
				${BDFDB.dotCN.themedark} .translate-button {
					fill: #fff;
				}
				
				${BDFDB.dotCN.themelight} .translate-button {
					fill: #4f545c;
				}
				
				.translate-button.active {
					fill: #F04747;
					opacity: 1;
				}

				.translate-button:hover {
					cursor: pointer;
					opacity: 1;
					transform: scale(1.1);
				}
				
				.reverse-button {
					margin-top: -5px;
					opacity: 0.2;
					transition: all 200ms ease;
				}
				
				${BDFDB.dotCN.themedark} .reverse-button {
					fill: #fff;
				}
				
				${BDFDB.dotCN.themelight} .reverse-button {
					fill: #4f545c;
				}
				.reverse-button:hover {
					cursor: pointer;
					opacity: 1;
				}
				
				${BDFDB.dotCN.popout}.popout-googletranslate ${BDFDB.dotCN.popoutthemedpopout} {
					padding: 0 10px;
					width: 400px;
				}
				
				${BDFDB.dotCN.themedark} ${BDFDB.dotCN.popout}.popout-googletranslate ${BDFDB.dotCN.popoutthemedpopout} {
					-webkit-box-shadow: 0 2px 10px 0 rgba(0,0,0,20%);
					background-color: #2f3136;
					border: 1px solid rgba(28,36,43,.6);
					box-shadow: 0 2px 10px 0 rgba(0,0,0,.2);
				}
				
				${BDFDB.dotCN.selectmenuouter} .inChat {
					top: 0%;
					transform: translateY(-100%);
					border-radius: 4px 4px 0 0;
					margin-top: 1px;
				}`;
		}

		
		onStart () {
			var libraryScript = null;
			if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
				libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
				document.head.appendChild(libraryScript);
			}
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
			if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
			else libraryScript.addEventListener("load", () => {this.initialize();});
			return true;
		}

		initialize () {
			if (typeof BDFDB === "object") {
				BDFDB.loadMessage(this);
				
				var observer = null;

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node.nodeType == 1 && node.className.includes(BDFDB.disCN.contextmenu)) {
										this.onContextMenu(node);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"messageContextObserver",instance:observer}, {childList: true});
				
				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.tagName && node.classList && node.classList.contains(BDFDB.disCN.messagegroup)) {
										node.querySelectorAll(BDFDB.dotCN.message).forEach(message => {this.addOptionButton(message);});
									}
									else if (node && node.tagName && node.classList && node.classList.contains(BDFDB.disCN.message)) {
										this.addOptionButton(node);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver",instance:observer}, {childList:true, subtree:true});
				
				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.tagName && node.querySelector(BDFDB.dotCN.optionpopout) && !node.querySelector(".btn-item-googletranslateoption")) {
										$(node).find(BDFDB.dotCN.optionpopout).append(this.popoutEntryMarkup);
										this.addClickListener(node);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.popouts, {name:"optionPopoutObserver",instance:observer}, {childList: true});
				
				$(document).off("click." + this.name, BDFDB.dotCN.optionpopoutbutton).off("contextmenu." + this.name, BDFDB.dotCN.message)
					.on("click." + this.name, BDFDB.dotCN.optionpopoutbutton, (e) => {
						this.getMessageData($(BDFDB.dotCN.message).has(e.currentTarget)[0]);
					})
					.on("contextmenu." + this.name, BDFDB.dotCN.message, (e) => {
						this.getMessageData(e.currentTarget);
					});
				
				document.querySelectorAll(BDFDB.dotCNS.messagegroup + BDFDB.dotCN.message).forEach(message => {this.addOptionButton(message);});
				
				document.querySelectorAll(BDFDB.dotCNS.chat + "form textarea").forEach(textarea => {this.addTranslationButton(textarea);});
				
				this.setLanguage();

				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}

		onStop () {
			if (typeof BDFDB === "object") {
				this.stopDeepL();
				$(document).off("click." + this.name, BDFDB.dotCN.optionpopoutbutton).off("contextmenu." + this.name, BDFDB.dotCN.message);
				
				document.querySelectorAll(BDFDB.dotCN.message + ".translated").forEach(message => {
					this.resetMessage(message);
				});
				
				document.querySelectorAll(".translate-button").forEach(button => {button.remove();});
				document.querySelectorAll(BDFDB.dotCNS.chat + "form textarea").forEach(textarea => {textarea.parentElement.style.paddingRight = "0px";});
							
				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}
		
		onSwitch () {
			if (typeof BDFDB === "object") {
				document.querySelectorAll(BDFDB.dotCNS.chat + "form textarea").forEach(textarea => {this.addTranslationButton(textarea);});
				document.querySelectorAll(BDFDB.dotCNS.messages + BDFDB.dotCN.message).forEach(message => {this.addOptionButton(message);});
			}
		}
		
		
		// begin of own functions
		
		changeLanguageStrings () {
			this.messageContextEntryMarkup = 	this.messageContextEntryMarkup.replace("REPLACE_context_messagetranslateoption_text", this.labels.context_messagetranslateoption_text);
			
			this.messageContextEntryMarkup2 = 	this.messageContextEntryMarkup2.replace("REPLACE_context_googletranslateoption_text", this.labels.context_googletranslateoption_text);
			
			this.popoutEntryMarkup = 			this.popoutEntryMarkup.replace("REPLACE_popout_translateoption_text", this.labels.popout_translateoption_text);
		}

		updateSettings (settingspanel) {
			var data = {};
			for (let input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
				let option = input.getAttribute("option");
				let value = input.value;
				if (option && value) {
					if (!data[option]) data[option] = {};
					data[option][input.value] = input.checked;
				}
			}
			for (let option in data) {
				BDFDB.saveAllData(data[option], this, option);
			}
			this.setLanguage();
		}
		
		onContextMenu (context) {
			if (!context || !context.tagName || !context.parentElement) return;
			for (let group of context.querySelectorAll(BDFDB.dotCN.contextmenuitemgroup)) {
				if (!context.querySelector(".messagetranslateoption-item") && BDFDB.getKeyInformation({"node":group, "key":"displayName", "value":"MessagePinItem"})) {
					$(this.messageContextEntryMarkup).insertAfter(group)
						.on("click", ".messagetranslateoption-item", () => {
							$(context).hide();
							this.translateMessage();
						});
					
					BDFDB.updateContextPosition(context);
				}
				if (!context.querySelector(".googletranslateoption-item") && BDFDB.getKeyInformation({"node":group, "key":"handleSearchWithGoogle"})) {
					var text = BDFDB.getKeyInformation({"node":group, "key":"value"});
					if (text) {
						$(this.messageContextEntryMarkup2).insertAfter(group)
							.on("mouseenter", ".googletranslateoption-item", (e) => {
								this.translateText(text, "context", (translation, input, output) => {
									if (translation) {
										var tooltiptext = `From ${input.name}:\n${text}\n\nTo ${output.name}:\n${translation}`;
										var customTooltipCSS = `
											.googletranslate-tooltip {
												max-width: ${window.outerWidth - $(e.currentTarget).offset().left - $(e.currentTarget).outerWidth()}px !important;
											}`;
										BDFDB.createTooltip(tooltiptext, e.currentTarget, {type: "right",selector:"googletranslate-tooltip",css:customTooltipCSS});
									}
								});
							})
							.on("click", ".googletranslateoption-item", (e) => {
								$(context).hide();
								window.open(this.getGoogleTranslatePageURL(input.id, output.id, text), "_blank");
							});
					}
					
					BDFDB.updateContextPosition(context);
				}
			}
			
		}
		
		startDeepL () {
			this.stopDeepL();
			this.DeepLTranslate = new this.DeepLTranslateAPI();
			this.DeepLTranslate.start();
		}
		
		stopDeepL () {
			if (this.DeepLTranslate && typeof this.DeepLTranslate.stop === "function") this.DeepLTranslate.stop();
			this.DeepLTranslate = undefined;
		}
		
		setLanguage () {
			this.languages = Object.assign({},
				{"auto":	{name:"Auto",		id:"auto",		integrated:false,	dic:false,	deepl:true}},
				BDFDB.languages,
				{"binary":	{name:"Binary",		id:"binary",	integrated:false,	dic:false,	deepl:true}}
			);
			if (!BDFDB.getData("useGoogle", this, "translators")) {
				this.languages = BDFDB.filterObject(this.languages, (lang) => {return lang.deepl == true ? lang : null});
				this.startDeepL();
			}
			else {
				this.stopDeepL();
			}
		}
		
		getLanguageChoice (direction, place) {
			var type = typeof place === "undefined" ? direction : direction.toLowerCase() + place.charAt(0).toUpperCase() + place.slice(1).toLowerCase();
			var choice = BDFDB.getData(type, this, "choices");
			choice = this.languages[choice] ? choice : Object.keys(this.languages)[0];
			choice = type.indexOf("output") > -1 && choice == "auto" ? "en" : choice;
			return choice;
		}
		
		addOptionButton (message) {
			if (!message.querySelector(BDFDB.dotCN.optionpopoutbutton) && !message.querySelector(BDFDB.dotCN.messagesystem) && !message.querySelector(BDFDB.dotCN.messageuploadcancel)) {
				$(this.optionButtonMarkup).insertBefore(message.querySelector(BDFDB.dotCN.messagetext).firstChild);
				$(message).off("click." + this.name).on("click." + this.name, ".btn-googletranslateoption", (e) => {
					this.openOptionPopout(e);
				});
			}
		}
		
		openOptionPopout (e) {
			var wrapper = e.currentTarget;
			if (wrapper.classList.contains(BDFDB.disCN.optionpopoutopen)) return;
			wrapper.classList.add(BDFDB.disCN.optionpopoutopen);
			var popout = $(this.optionsPopoutMarkup);
			$(BDFDB.dotCN.popouts).append(popout);
			$(popout).find(BDFDB.dotCN.optionpopout).append(this.popoutEntryMarkup);
			this.addClickListener(popout);
			
			popout
				.css("left", e.pageX - ($(popout).outerWidth() / 2) + "px")
				.css("top", e.pageY + "px");
				
			$(document).on("mousedown.optionpopout" + this.name, (e2) => {
				if (popout.has(e2.target).length == 0) {
					$(document).off("mousedown.optionpopout" + this.name);
					popout.remove();
					setTimeout(() => {wrapper.classList.remove(BDFDB.disCN.optionpopoutopen);},300);
				}
			});
		}
		
		addClickListener (popout) {
			$(popout)
				.off("click." + this.name, ".btn-item-googletranslateoption")
				.on("click." + this.name, ".btn-item-googletranslateoption", (e) => {
					$(BDFDB.dotCN.popout).has(BDFDB.dotCN.optionpopout).hide();
					this.translateMessage();
					setTimeout(() => {
						var popoutbutton = document.querySelector(BDFDB.dotCN.optionpopoutbutton + BDFDB.dotCN.optionpopoutopen);
						if (popoutbutton) popoutbutton.classList.remove(BDFDB.disCN.optionpopoutopen);
					},300);
				});
		}
		
		getMessageData (div) {
			if (div && !div.querySelector(BDFDB.dotCN.messagesystem)) {
				var messagegroup = $(BDFDB.dotCN.messagegroup).has(div);
				var pos = messagegroup.find(BDFDB.dotCN.message).index(div);
				if (messagegroup[0] && pos > -1) {
					var info = BDFDB.getKeyInformation({"node":div,"key":"messages","up":true,"time":1000});
					if (info) this.message = Object.assign({},info[pos],{"div":div, "group":messagegroup[0], "pos":pos});
				}
			}
			else {
				this.message = null;
			}
		}
		
		addTranslationButton (textarea) {
			if (!textarea) return;
			var textareaWrap = textarea.parentElement;
			if (textareaWrap && !textareaWrap.classList.contains(BDFDB.disCN.textareainnerdisabled) &&  !textareaWrap.querySelector(".translate-button")) {
				var textareaInstance = BDFDB.getOwnerInstance({"node":textarea, "props":["handlePaste","saveCurrentText"], "up":true});
				if (textareaInstance && textareaInstance.props && textareaInstance.props.type) {
					var button = $(this.translateButtonMarkup)[0];
					$(button).appendTo(textareaWrap)
						.on("click." + this.name, () => {
							this.openTranslatePopout(button);
						})
						.on("contextmenu." + this.name, () => {
							this.translating = !this.translating;
							document.querySelectorAll(BDFDB.dotCNS.textareawrapchat + ".translate-button").forEach(btn => {btn.classList.toggle("active", this.translating);});
						});
					button.classList.add(textareaInstance.props.type);
					button.classList.toggle("active", this.translating);
					var sendButtonEnabled = BDFDB.isPluginEnabled("SendButton");
					if (sendButtonEnabled) button.style.marginRight = "40px";
					textareaWrap.style.paddingRight = sendButtonEnabled ? "110px" : "70px";
					$(textarea)
						.off("input." + this.name)
						.on("input." + this.name, () => {
							if (this.doTranslate) {
								this.doTranslate = false;
								if (document.activeElement == textarea) {
									var text = textarea.value;
									textarea.focus();
									textarea.selectionStart = 0;
									textarea.selectionEnd = text.length;
									document.execCommand("insertText", false, "");
									this.translateText(text, "message", (translation, input, output) => {
										translation = !translation ? text : (BDFDB.getData("sendOriginalMessage", this, "settings") ? text + "\n\n" + translation : translation);
										textarea.focus();
										document.execCommand("insertText", false, translation + " ");
										BDFDB.triggerSend(textarea);
									});
								}
							}
						})
						.off("keydown." + this.name)
						.on("keydown." + this.name, e => {
							if (textarea.value && this.translating && !e.shiftKey && e.which == 13 && !textareaWrap.querySelector(BDFDB.dotCN.autocomplete)) {
								this.doTranslate = true;
								$(textarea).trigger("input");
							}
						});
				}
			}
		}
		
		translateMessage () {
			if (this.message && this.message.content) {
				var message = this.message.div;
				if (!message.classList.contains("translated")) {
					this.translateText(this.message.content, "context", (translation, input, output) => {
						if (translation) {
							var markup = message.querySelector(BDFDB.dotCN.messagecontent) || message.querySelector(BDFDB.dotCN.messagemarkup);
							if (markup) {
								$(markup).data("orightmlGoogleTranslate", markup.innerHTML);
								markup.innerText = translation;
								$(`<span class="${BDFDB.disCN.messageedited} translated">(${this.labels.translated_watermark_text})</span>`)
									.on("mouseenter." + this.name, (e) => {
										BDFDB.createTooltip(`<div>From: ${input.name}</div><div>To: ${output.name}</div>`, e.currentTarget, {html:true, type:"top", selector:"translation-tooltip"});
									})
									.appendTo(markup);
								message.classList.add("translated");
							}
						}
					});
				}
				else {
					this.resetMessage(message);
				}
			}
			this.message = null;
		}
		
		resetMessage (message) {
			$(message)
				.removeClass("translated")
				.find(BDFDB.dotCN.messageedited + ".translated").remove();
				
			var markup = message.querySelector(BDFDB.dotCN.messagecontent) || message.querySelector(BDFDB.dotCN.messagemarkup);
			markup.innerHTML = $(markup).data("orightmlGoogleTranslate");
		}
		
		translateText (text, type, callback) {
			var finishTranslation = (translation, mentions, input, output, toast) => {
				if (translation) translation = this.addMentions(translation, mentions);
				clearInterval(toast.interval);
				toast.close();
				callback(translation, input, output);
			};
			var [newtext, mentions, translate] = this.removeMentions(text.trim());
			var input = Object.assign({}, this.languages[this.getLanguageChoice("input", type)]);
			var output = Object.assign({}, this.languages[this.getLanguageChoice("output", type)]);
			var translation = "";
			if (translate) {
				var toast = BDFDB.showToast("Translating. Please wait", {timeout:0});
				toast.interval = setInterval(() => {
					toast.textContent = toast.textContent.indexOf(".....") > -1 ? "Translating. Please wait" : toast.textContent + ".";
				},500);
				if (input.id == "binary" || output.id == "binary") {
					if (input.id == "binary" && output.id != "binary") 			translation = this.binary2string(newtext);
					else if (input.id != "binary" && output.id == "binary") 	translation = this.string2binary(newtext);
					else if (input.id == "binary" && output.id == "binary") 	translation = newtext;
					finishTranslation(translation, mentions, input, output, toast);
				}
				else {
					if (BDFDB.getData("useGoogle", this, "translators")) {
						require("request")(this.getGoogleTranslateApiURL(input.id, output.id, newtext), (error, response, result) => {
							if (!error && result) {
								result = JSON.parse(result);
								result[0].forEach((array) => {translation += array[0];});
								if (this.languages[result[2]]) input.name = this.languages[result[2]].name;
								finishTranslation(translation, mentions, input, output, toast);
							}
						});
					}
					else {
						this.DeepLTranslate.setInputLanguage(input.id);
						this.DeepLTranslate.setOutputLanguage(output.id);
						this.DeepLTranslate.translate(newtext).then((translation) => {
							if (newtext.lastIndexOf(".") != newtext.length-1 && translation.lastIndexOf(".") == translation.length-1) translation = translation.slice(0,-1);
							finishTranslation(translation, mentions, input, output, toast);
						});
						
					}
				}
			}
			else {
				translation = text;
				finishTranslation(translation, mentions, input, output, toast);
			}
		}
		
		addMentions (string, mentions) {
			for (let i in mentions) {
				string = string.replace("a" + i + "_______", mentions[i].indexOf("!") == 0 ? mentions[i].slice(1) : mentions[i]);
			}
			return string;
		}
		
		removeMentions (string) {
			var mentions = {}, newString = [], count = 0;
			string.split(" ").forEach((word) => {
				if (word.indexOf("<@!") == 0 || word.indexOf(":") == 0 || word.indexOf("@") == 0 || word.indexOf("#") == 0 || (word.indexOf("!") == 0 && word.length > 1)) {
					newString.push("a" + count + "_______");
					mentions[count] = word;
					count++;
				}
				else {
					newString.push(word);
				}
			});
			return [newString.join(" "), mentions, newString.length-count != 0];
		}
		
		openTranslatePopout (button) {
			if (button.classList.contains(BDFDB.disCN.optionpopoutopen)) return;
			button.classList.add(BDFDB.disCN.optionpopoutopen);
			var popout = $(this.translatePopoutMarkup);
			popout
				.appendTo(BDFDB.dotCN.popouts)
				.css("left", $(button).offset().left + $(button).outerWidth() + "px")
				.css("top", $(button).offset().top - $(button).outerHeight()/2 + "px")
				.on("click", BDFDB.dotCN.selectcontrol, (e) => {this.openDropdownMenu("inChat", e);})
				.on("click", ".reverse-button", (e) => {
					var place = e.currentTarget.getAttribute("type").replace("output","");
					var input = this.getLanguageChoice("output", place);
					var output = this.getLanguageChoice("input", place);
					output = output == "auto" ? "en" : output;
					popout.find(BDFDB.dotCN.select + "[type='input" + place + "']").attr("value", input).find(BDFDB.dotCN.title).text(this.languages[input].name);
					popout.find(BDFDB.dotCN.select + "[type='output" + place + "']").attr("value", output).find(BDFDB.dotCN.title).text(this.languages[output].name);
					BDFDB.saveData("input" + place, input, this, "choices");
					BDFDB.saveData("output" + place, output, this, "choices");
				});
			
			popout.find(BDFDB.dotCN.select).each((_,selectWrap) => {
				let language = this.getLanguageChoice(selectWrap.getAttribute("type"));
				selectWrap.setAttribute("value", language);
				selectWrap.querySelector(BDFDB.dotCN.title).innerText = this.languages[language].name;
			});
				
			var checkbox = popout[0].querySelector("#translating-checkbox");
			checkbox.checked = this.translating;
			$(checkbox).on("click." + this.name, () => {
				button.classList.toggle("active", checkbox.checked);
				this.translating = checkbox.checked;
			});
				
			var translators = BDFDB.getAllData(this, "translators");
			popout[0].querySelectorAll(BDFDB.dotCN.switchinner + "[option=translators]").forEach((checkbox) => {
				checkbox.checked = translators[checkbox.value];
				$(checkbox).on("click." + this.name, () => {
					this.updateSettings(popout[0]);
					popout.remove();
					button.classList.remove(BDFDB.disCN.optionpopoutopen);
					this.openTranslatePopout(button);
				});
			});
				
			$(document).on("mousedown.translatepopout" + this.name, (e) => {
				if (popout.has(e.target).length == 0) {
					$(document).off("mousedown.translatepopout" + this.name);
					popout.remove();
					setTimeout(() => {button.classList.remove(BDFDB.disCN.optionpopoutopen);},300);
				}
			});
			
			BDFDB.initElements(popout[0]);
		}
		
		openDropdownMenu (selector, e) {
			var selectControl = e.currentTarget;
			var selectWrap = selectControl.parentElement;
			
			if (selectWrap.classList.contains(BDFDB.disCN.selectisopen)) return;
			
			selectWrap.classList.add(BDFDB.disCN.selectisopen);
			$("li").has(selectWrap).css("overflow", "visible");
			
			var type = selectWrap.getAttribute("type");
			var selectMenu = this.createDropdownMenu(selectWrap.getAttribute("value"), type);
			selectWrap.appendChild(selectMenu);
			
			$(selectMenu).addClass(selector).on("mousedown." + this.name, BDFDB.dotCN.selectoption, (e2) => {
				var language = e2.currentTarget.getAttribute("value");
				selectWrap.setAttribute("value", language);
				selectControl.querySelector(BDFDB.dotCN.title).innerText = this.languages[language].name;
				BDFDB.saveData(type, language, this, "choices");
			});
			$(document).on("mousedown.select" + this.name, (e2) => {
				if (e2.target.parentElement == selectMenu) return;
				$(document).off("mousedown.select" + this.name);
				selectMenu.remove();
				$("li").has(selectWrap).css("overflow", "auto");
				setTimeout(() => {selectWrap.classList.remove(BDFDB.disCN.selectisopen);},100);
			});
		}
		
		createDropdownMenu (choice, type) {
			var menuhtml = `<div class="${BDFDB.disCN.selectmenuouter}"><div class="${BDFDB.disCN.selectmenu}">`;
			for (var key in this.languages) {
				if (this.defaults.choices[type].direction == "Output" && key == "auto") continue;
				var isSelected = key == choice ? ` ${BDFDB.disCN.selectselected}` : ``;
				menuhtml += `<div value="${key}" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectoption + isSelected}" style="flex: 1 1 auto; display:flex;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 42%;">${this.languages[key].name}</div></div>`
			}
			menuhtml += `</div></div>`;
			return $(menuhtml)[0];
		}
		
		string2binary (string) {
			var binary = "";
			for (var character of string) binary += parseInt(character.charCodeAt(0).toString(2)).toPrecision(8).split(".").reverse().join("").toString() + " ";
			return binary;
		}
		
		binary2string (binary) {
			var string = "";
			binary = binary.replace(new RegExp(" ", "g"), "");
			if (/^[0-1]*$/.test(binary)) {
				var eightdigits = "";
				var counter = 0;
				for (var digit of binary) {
					eightdigits += digit;
					counter++;
					if (counter > 7) {
						string += String.fromCharCode(parseInt(eightdigits,2).toString(10));
						eightdigits = "";
						counter = 0;
					}
				}
			}
			else {
				BDFDB.showToast("Invalid binary format. Only use 0s and 1s.", {type:"error"});
			}
			return string;
		}
		
		getGoogleTranslateApiURL (input, output, text) {
			return "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + input + "&tl=" + output + "&dt=t&ie=UTF-8&oe=UTF-8&q=" + encodeURIComponent(text);
		}
		
		getGoogleTranslatePageURL (input, output, text) {
			return "https://translate.google.com/#" + input + "/" + output + "/" + encodeURIComponent(text);
		}
		
		getSettingsPanel () {
			var choices = 	BDFDB.getAllData(this, "choices"); 
			var settings = 	BDFDB.getAllData(this, "settings"); 
			var translators = 	BDFDB.getAllData(this, "translators"); 
			var settingshtml = `<div class="DevilBro-settings ${this.name}-settings">`;
			for (let key in choices) {
				let choice = this.getLanguageChoice(key);
				settingshtml += `<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild} marginBottom8-1mABJ4 marginTop8-2gOa2N" style="flex: 1 1 auto;">${this.defaults.choices[key].description}</h3><div class="ui-form-item ${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.selectwrap}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.select + BDFDB.disCNS.selectsingle + BDFDB.disCN.selecthasvalue}" type="${key}" value="${choice}"><div class="${BDFDB.disCN.selectcontrol}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectvalue}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="padding:0;">${this.languages[choice].name}</div></div><span class="${BDFDB.disCN.selectarrowzone}"><span class="${BDFDB.disCN.selectarrow}"></span></span></div></div></div></div>`
			}
			for (let key in settings) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" option="settings" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
			}
			for (let key in translators) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="flex-3B1Tl4 justifyStart-2yIZo0 ${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Translator:</h3><h3 class="flex-3B1Tl4 justifyStart-2yIZo0 ${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.translators[key].choice1}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" option="translators" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${translators[key] ? " checked" : ""}></div><h3 class="flex-3B1Tl4 justifyEnd-1ceqOU ${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.translators[key].choice2}</h3></div>`;
			}
			settingshtml += `</div>`;
			
			var settingspanel = $(settingshtml)[0];

			$(settingspanel)
				.on("click", BDFDB.dotCN.selectcontrol, (e) => {this.openDropdownMenu("inSettings", e);})
				.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);});
				
			return settingspanel;
		}

		setLabelsByLanguage () {
			switch (BDFDB.getDiscordLanguage().id) {
				case "hr":		//croatian
					return {
						context_messagetranslateoption_text:	"Prijevod poruke",
						context_googletranslateoption_text:		"Traži prijevod",
						popout_translateoption_text:			"Prevedi",
						translated_watermark_text:				"preveo"
					};
				case "da":		//danish
					return {
						context_messagetranslateoption_text:	"Oversæt Besked",
						context_googletranslateoption_text:		"Søg oversættelse",
						popout_translateoption_text:			"Oversætte",
						translated_watermark_text:				"oversat"
					};
				case "de":		//german
					return {
						context_messagetranslateoption_text:	"Nachricht übersetzen",
						context_googletranslateoption_text:		"Suche Übersetzung",
						popout_translateoption_text:			"Übersetzen",
						translated_watermark_text:				"übersetzt"
					};
				case "es":		//spanish
					return {
						context_messagetranslateoption_text:	"Traducir mensaje",
						context_googletranslateoption_text:		"Buscar traducción",
						popout_translateoption_text:			"Traducir",
						translated_watermark_text:				"traducido"
					};
				case "fr":		//french
					return {
						context_messagetranslateoption_text:	"Traduire le message",
						context_googletranslateoption_text:		"Rechercher une traduction",
						popout_translateoption_text:			"Traduire",
						translated_watermark_text:				"traduit"
					};
				case "it":		//italian
					return {
						context_messagetranslateoption_text:	"Traduci messaggio",
						context_googletranslateoption_text:		"Cerca la traduzione",
						popout_translateoption_text:			"Tradurre",
						translated_watermark_text:				"tradotto"
					};
				case "nl":		//dutch
					return {
						context_messagetranslateoption_text:	"Vertaal bericht",
						context_googletranslateoption_text:		"Zoek vertaling",
						popout_translateoption_text:			"Vertalen",
						translated_watermark_text:				"vertaalde"
					};
				case "no":		//norwegian
					return {
						context_messagetranslateoption_text:	"Oversett melding",
						context_googletranslateoption_text:		"Søk oversettelse",
						popout_translateoption_text:			"Oversette",
						translated_watermark_text:				"oversatt"
					};
				case "pl":		//polish
					return {
						context_messagetranslateoption_text:	"Przetłumacz wiadomość",
						context_googletranslateoption_text:		"Wyszukaj tłumaczenie",
						popout_translateoption_text:			"Tłumaczyć",
						translated_watermark_text:				"przetłumaczony"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						context_messagetranslateoption_text:	"Traduzir mensagem",
						context_googletranslateoption_text:		"Pesquisar tradução",
						popout_translateoption_text:			"Traduzir",
						translated_watermark_text:				"traduzido"
					};
				case "fi":		//finnish
					return {
						context_messagetranslateoption_text:	"Käännä viesti",
						context_googletranslateoption_text:		"Etsi käännös",
						popout_translateoption_text:			"Kääntää",
						translated_watermark_text:				"käännetty"
					};
				case "sv":		//swedish
					return {
						context_messagetranslateoption_text:	"Översätt meddelande",
						context_googletranslateoption_text:		"Sök översättning",
						popout_translateoption_text:			"Översätt",
						translated_watermark_text:				"översatt"
					};
				case "tr":		//turkish
					return {
						context_messagetranslateoption_text:	"Mesajı çevir",
						context_googletranslateoption_text:		"Arama tercümesi",
						popout_translateoption_text:			"Çevirmek",
						translated_watermark_text:				"tercüme"
					};
				case "cs":		//czech
					return {
						context_messagetranslateoption_text:	"Přeložit zprávu",
						context_googletranslateoption_text:		"Hledat překlad",
						popout_translateoption_text:			"Přeložit",
						translated_watermark_text:				"přeloženo"
					};
				case "bg":		//bulgarian
					return {
						context_messagetranslateoption_text:	"Превод на съобщението",
						context_googletranslateoption_text:		"Търсене на превод",
						popout_translateoption_text:			"Превеждам",
						translated_watermark_text:				"преведена"
					};
				case "ru":		//russian
					return {
						context_messagetranslateoption_text:	"Перевести сообщение",
						context_googletranslateoption_text:		"Поиск перевода",
						popout_translateoption_text:			"Переведите",
						translated_watermark_text:				"переведенный"
					};
				case "uk":		//ukrainian
					return {
						context_messagetranslateoption_text:	"Перекласти повідомлення",
						context_googletranslateoption_text:		"Пошук перекладу",
						popout_translateoption_text:			"Перекласти",
						translated_watermark_text:				"перекладений"
					};
				case "ja":		//japanese
					return {
						context_messagetranslateoption_text:	"メッセージを翻訳する",
						context_googletranslateoption_text:		"翻訳の検索",
						popout_translateoption_text:			"翻訳",
						translated_watermark_text:				"翻訳された"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						context_messagetranslateoption_text:	"翻譯消息",
						context_googletranslateoption_text:		"搜索翻譯",
						popout_translateoption_text:			"翻譯",
						translated_watermark_text:				"翻譯"
					};
				case "ko":		//korean
					return {
						context_messagetranslateoption_text:	"메시지 번역",
						context_googletranslateoption_text:		"검색 번역",
						popout_translateoption_text:			"옮기다",
						translated_watermark_text:				"번역 된"
					};
				default:		//default: english
					return {
						context_messagetranslateoption_text:	"Translate Message",
						context_googletranslateoption_text:		"Search translation",
						popout_translateoption_text:			"Translate",
						translated_watermark_text:				"translated"
					};
			}
		}
	}
};
