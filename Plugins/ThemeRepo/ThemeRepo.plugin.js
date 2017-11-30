//META{"name":"ThemeRepo"}*//

class ThemeRepo {
	constructor () {
		this.settingsWindowObserver = new MutationObserver(() => {});
		
		this.loading = false;
		
		this.loadedThemes = {};
		
		this.themeFixerCSS = `#voice-connection,#friends,.friends-header,.friends-table,.guilds-wrapper,.guild-headerheader,.channels-wrap,.private-channels.search-bar,.private-channels,.guild-channels,.account,.friend-table-add-header,.chat,.content,.layers,.title-wrap:not(.search-bar),.messages-wrapper,.messages.dividerspan,.messages.divider:before,.content,.message-group-blocked,.is-local-bot-message,.channel-members-loading,.channel-members-loading.heading,.channel-members-loading.member,.typing,.layer,.layers,.container-RYiLUQ,.theme-dark.ui-standard-sidebar-view,.theme-dark.ui-standard-sidebar-view.sidebar-region,.theme-dark.ui-standard-sidebar-view.content-region,.theme-dark.channel-members,.layer,.layers,.container-2OU7Cz,.theme-dark.title-qAcLxz,.theme-dark.chatform,.channels-3g2vYe,.theme-dark.friends-table,.theme-dark.messages-wrapper,.content.flex-spacer,.theme-dark.chat>.content,.theme-dark.chat,.container-2OU7Cz,.theme-dark.channel-members,.channel-members,.channels-3g2vYe,.guilds-wrapper,.search.search-bar,.theme-dark.chatform,.container-iksrDt,.container-3lnMWU,.theme-dark.title-qAcLxz{background:transparent!important;}.theme-dark.layer,.theme-dark.layers,.typeWindows-15E0Ys{background:rgba(0,0,0,0.18)!important;}`
		
		this.themeRepoButtonMarkup = 
			`<button class="bd-pfbtn bd-themerepobutton" style="left: 220px;">Theme Repo</button>`;
		
		this.frameMarkup = 
			`<iframe class="discordPreview" src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/DiscordPreview.html"></iframe>`;

		this.themeEntryMarkup =
			`<li class="themeEntry" style="position:relative;">
				<div class="bda-left">
					<span class="bda-name"></span>
					<div class="scrollerWrap-2uBjct scrollerThemed-19vinI">
						<div class="scroller-fzNley bda-description"></div>
					</div>
				</div>
				<div class="bda-right">
					<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU previewCheckboxWrapper" style="flex: 0 0 auto;">
						<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm previewCheckbox">
					</div>
					<svg class="favStar" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><path fill="none" stroke="black" d="M 19.542, 9.092 c 0.393 -0.383, 0.532 -0.946, 0.362 -1.468 c -0.17 -0.523 -0.613 -0.896 -1.157 -0.975 l -4.837 -0.703 c -0.206 -0.03 -0.384 -0.159 -0.476 -0.346 L 11.273, 1.217 c -0.243 -0.492 -0.736 -0.798 -1.285 -0.798 c -0.549, 0 -1.042, 0.306 -1.284, 0.798 L 6.541, 5.6 c -0.092, 0.187 -0.27, 0.316 -0.476, 0.346 L 1.228, 6.649 c -0.544, 0.079 -0.987, 0.452 -1.157, 0.975 c -0.17, 0.523 -0.031, 1.085, 0.362, 1.468 l 3.5, 3.411 c 0.149, 0.146, 0.218, 0.355, 0.182, 0.56 L 3.29, 17.88 c -0.073, 0.424, 0.038, 0.836, 0.312, 1.162 c 0.426, 0.507, 1.171, 0.661, 1.766, 0.348 l 4.326 -2.274 c 0.181 -0.095, 0.408 -0.094, 0.589, 0 l 4.326, 2.274 c 0.21, 0.111, 0.435, 0.167, 0.666, 0.167 c 0.423, 0, 0.824 -0.188, 1.099 -0.515 c 0.275 -0.325, 0.386 -0.738, 0.312 -1.162 l -0.826 -4.817 c -0.035 -0.205, 0.033 -0.414, 0.182 -0.56 L 19.542, 9.092 z"/></svg>
					<button type="button" class="btn-download buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu">
						<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">Download</div>
					</button>
				</div>
			</li>`;
			
		this.themeRepoModalMarkup =
			`<span class="themerepo-modal recent-mentions-popout DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeMedium-1-2BNS">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
								<div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
									<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl themeAmount">Theme Repository</h4>
									<div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn"></div>
								</div>
								<svg class="btn-cancel close-3ejNTg flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="header inner-tqJwAU">
								<div class="header-tab-bar-wrapper" style="margin-top:0;">
									<div class="tab-bar TOP">
										<div tab="themes" class="tab-bar-item selected">Themes</div>
										<div tab="settings" class="tab-bar-item">Settings</div>
									</div>
									<div class="mention-filter sort-filter">
										<div class="label">Sort by:</div>
										<div option="name" class="value" style="text-transform:none;">Name</div>
									</div>
									<div class="mention-filter order-filter">
										<div class="label">Order:</div>
										<div option="asc" class="value" style="text-transform:none;">Ascending</div>
									</div>
								</div>
							</div>
							<div tab="themes" class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW tab-content">
								<div class="scroller-fzNley inner-tqJwAU ui-standard-sidebar-view">
									<ul class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO bda-slist themes" style="flex: 1 1 auto;"></ul>
								</div>
							</div>
							<div tab="settings" class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO inner-tqJwAU tab-content" style="flex: 1 1 auto;">
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">You can toggle this menu with the "Ctrl" key to take a better look at the preview.</h3>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Preview in light mode</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-darklight">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Include Custom CSS in Preview</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-customcss">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Include ThemeFixer CSS in Preview</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-themefixer">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto; padding-top:8px;">Download ThemeFixer</h3>
									<button type="button" id="download-themefixer" class="flexChild-1KGW5q buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu" style="flex: 0 0 auto;">
										<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">Download</div>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</span>`;
			
		this.sortPopoutMarkup =
			`<div class="popout popout-bottom-right no-shadow themerepo-sort-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="context-menu recent-mentions-filter-popout">
						<div class="item-group">
							<div option="name" class="item">Name</div>
							<div option="author" class="item">Author</div>
							<div option="version" class="item">Version</div>
							<div option="fav" class="item">Favorites</div>
						</div>
					</div>
				</div>
			</div>`;
			
		this.orderPopoutMarkup =
			`<div class="popout popout-bottom-right no-shadow themerepo-order-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="context-menu recent-mentions-filter-popout">
						<div class="item-group">
							<div option="asc" class="item">Ascending</div>
							<div option="desc" class="item">Descending</div>
						</div>
					</div>
				</div>
			</div>`;
		
		this.css = `
			.discordPreview {
				width:100vw !important;
				height:100vh !important;
				position: relative !important;
				z-index: 3499 !important;
			}
			.themerepo-modal {
				position: relative !important;
				z-index: 3500 !important;
			}
			.themerepo-modal .inner-1_1f7b {
				min-height: 100%;
			}
			.themerepo-modal .previewCheckboxWrapper {
				position: absolute;
				right: 10px;
				top: 10px;
			}
			.themerepo-modal .favStar {
				position: absolute;
				right: 60px;
				top: 11px;
			}
			.themerepo-modal .favStar path {
				stroke: yellow;
				fill: none;
			}
			.themerepo-modal .favStar.favorized path {
				stroke: yellow;
				fill: yellow;
			}
			.themerepo-modal .btn-download {
				position: absolute;
				right: 5px; 
				bottom: 10px;
			}`;
	}

	getName () {return "ThemeRepo";}

	getDescription () {return "Allows you to preview all themes from the themerepo and download them on the fly. Repo button is in the theme settings.";}

	getVersion () {return "1.0.2";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
		}
	}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
									var settingsObserver = new MutationObserver((changes2, _) => {
										changes2.forEach(
											(change2, j) => {
												if (change2.addedNodes) {
													change2.addedNodes.forEach((node2) => {
														if (node2 && node2.tagName && node2.querySelector(".bd-pfbtn") && node2.querySelector("h2") && node2.querySelector("h2").innerText.toLowerCase() === "themes") {
															this.addThemeRepoButton(node2);
														}
													});
												}
											}
										);
									});
									settingsObserver.observe(node, {childList:true, subtree:true});
								}
							});
						}
					}
				);
			});
			this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.loadThemes();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
			
			this.settingsWindowObserver.disconnect();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			$(".discordPreview, .themerepo-modal").remove();
		}
	}

	
	// begin of own functions
	
	addThemeRepoButton (container) {
		if (container && !container.querySelector(".bd-themerepobutton")) {
			$(this.themeRepoButtonMarkup)
				.insertAfter(container.querySelector(".bd-pfbtn"))
				.on("click", () => {
					if (!this.loading) this.openDiscordPreview(); 
					else BDfunctionsDevilBro.showToast(`Themes are still being fetched. Try again in some seconds.`, {type:"danger"});
				})
				.on("onmouseenter", (e) => {
					BDfunctionsDevilBro.createTooltip("Open Theme Repo", e.currentTarget, {type:"right",selector:"update-button-tooltip"});
				});
		}
	}
	
	openDiscordPreview () {
		var frame = $(this.frameMarkup)[0];
		var lightTheme = BDfunctionsDevilBro.getDiscordTheme() == "theme-light";
		var themeRepoModal = $(this.themeRepoModalMarkup);
		themeRepoModal.find(".themeAmount").text(themeRepoModal.find(".themeAmount").text() + " " + Object.keys(this.loadedThemes).length + " Themes");
		themeRepoModal.find("#input-darklight").prop("checked", lightTheme);
		themeRepoModal.find("#input-customcss").prop("checked", false);
		themeRepoModal.find("#input-themefixer").prop("checked", false);
		themeRepoModal
			.on("click." + this.getName(), ".btn-cancel, .backdrop-2ohBEd", () => {
				frame.remove();
				$(document).off("keyup." + this.getName());
				$(window).off("message." + this.getName());
			})
			.on("click." + this.getName(), "#download-themefixer", (e) => {
				this.createThemeFile("ThemeFixer.theme.css", `//META{"name":"ThemeFixer","description":"ThemeFixerCSS for transparent themes","author":"xNightWulf","version":"1.0.0"}*//\n\n` + this.themeFixerCSS);
			})
			.on("click." + this.getName(), ".sort-filter", (e) => {
				this.openSortPopout(e, this.sortPopoutMarkup, themeRepoModal, frame);
			})
			.on("click." + this.getName(), ".order-filter", (e) => {
				this.openSortPopout(e, this.orderPopoutMarkup, themeRepoModal, frame);
			})
			.on("change." + this.getName(), "#input-darklight", (e) => {
				frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"DarkLight",checked:$(e.target).prop("checked")},"*");
			})
			.on("change." + this.getName(), "#input-customcss", (e) => {
				var customCSS = document.querySelector("style#customcss");
				if (customCSS && customCSS.innerText.length > 0) 
					frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"CustomCSS",checked:$(e.target).prop("checked"),css:customCSS.innerText},"*");
			})
			.on("change." + this.getName(), "#input-themefixer", (e) => {
				frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"ThemeFixer",checked:$(e.target).prop("checked"),css:this.themeFixerCSS},"*");
			});
			
		$(document).off("keyup." + this.getName())
			.on("keyup." + this.getName(), (e) => {
				keyPressed(e.which);
			});
		$(window).off("message." + this.getName())
			.on("message." + this.getName(), (e) => {
				e = e.originalEvent;
				if (typeof e.data === "object" && e.data.origin == "DiscordPreview") {
					switch (e.data.reason) {
						case "OnLoad":
							var container = document.querySelector(".container-iksrDt");
							if (!container) return;
							var username = container.querySelector(".username").innerText;
							var avatar = container.querySelector(".avatar-small").style.backgroundImage;
							var discriminator = container.querySelector(".discriminator").innerText;
							
							frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"OnLoad",username,avatar,discriminator},"*");
							frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"DarkLight",checked:lightTheme},"*");
							break;
						case "KeyUp":
							keyPressed(e.data.key);
							break;
					}
				}
			});
			
		this.addThemeEntries(themeRepoModal, frame);
			
		BDfunctionsDevilBro.appendModal(themeRepoModal);
		$(frame).insertBefore("#app-mount");
			
		function keyPressed (key) {
			if (key == 17) themeRepoModal.toggle();
			if (key == 27) frame.remove();
		}
	}
	
	openSortPopout (e, markup, modal, frame) {
		var wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		var value = $(wrapper).find(".value");
		var popout = $(markup);
		$(wrapper).append(popout)
			.off("click", ".item")
			.on("click", ".item", (e2) => {
				value.text($(e2.currentTarget).text());
				value.attr("option", $(e2.currentTarget).attr("option"));
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				this.addThemeEntries(modal, frame);
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			});
			
		popout
			.css("left", $(wrapper).offset().left + $(wrapper).outerWidth() + "px")
			.css("top", $(wrapper).offset().top + value.outerHeight() + "px")
			.find(".context-menu").addClass(BDfunctionsDevilBro.getDiscordTheme());
			
		$(document).on("mousedown.sortpopout" + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0) {
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			}
		});
	}
	
	addThemeEntries (modal, frame) {
		modal.find(".themeEntry").remove();
		var favorites = BDfunctionsDevilBro.loadAllData(this.getName(), "favorites");
		var themes = [];
		for (var url in this.loadedThemes) {
			this.loadedThemes[url].fav = favorites[url] ? false : true;
			themes.push(this.loadedThemes[url]);
		}
		themes = BDfunctionsDevilBro.sortArrayByKey(themes, modal.find(".sort-filter .value").attr("option"));
		if (modal.find(".order-filter .value").attr("option") == "desc") themes.reverse();
		for (let theme of themes) {
			let entry = $(this.themeEntryMarkup);
			modal.find(".themes").append(entry);
			entry.find(".bda-name").text(theme.name + (theme.version ? " v" + theme.version : "") + (theme.author ? " by " + theme.author : ""));
			entry.find(".bda-description").text(theme.description);
			if (!theme.fav) entry.find(".favStar")[0].classList.add("favorized");
			entry
				.on("change." + this.getName(), ".previewCheckbox", (e) => {
					modal.find(".previewCheckbox").not(e.target).prop("checked", false);
					modal.find(".previewCheckbox").each((_, checkBox) => {
						$(checkBox.parentElement)
							.toggleClass("valueChecked-3Bzkbm", $(checkBox).prop("checked"))
							.toggleClass("valueUnchecked-XR6AOk", $(checkBox).prop("checked"));
					});
					frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"NewTheme",checked:$(e.target).prop("checked"),css:theme.css},"*");
				})
				.on("click." + this.getName(), ".favStar", (e) => {
					e.currentTarget.classList.toggle("favorized");
					if (e.currentTarget.classList.contains("favorized")) favorites[theme.url] = true;
					else delete favorites[theme.url];
					BDfunctionsDevilBro.saveAllData(favorites, this.getName(), "favorites");
				})
				.on("click." + this.getName(), ".btn-download", () => {
					this.downloadTheme(theme);
				});
		}
	}
	
	loadThemes () {
		var i = 0;
		var grabbedThemes = [];
		var tags = ["name","description","author","version"];
		let request = require("request");
		request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, result) => {
			if (response) {
				grabbedThemes = response.body.split("\n");
				this.loading = true;
				getThemeInfo(this.loadedThemes, () => {
					this.loading = false;
					if (document.querySelector(".bd-themerepobutton")) BDfunctionsDevilBro.showToast(`Finished fetching Themes.`, {type:"success"});
				});
			}
		});
		
		function getThemeInfo (loadedThemes, callback) {
			if (i >= grabbedThemes.length) {
				callback();
				return;
			}
			let url = grabbedThemes[i].replace(new RegExp("[\\r|\\n|\\t]", "g"), "");
			request(url, (error, response, body) => {
				if (response) {
					let theme = {};
					let text = body;
					if (text.split("*//").length > 1 && text.split("\n").length > 1) {
						for (let tag of tags) {
							let temp = text.replace(new RegExp("\\s*\:\\s*", "g"), ":").split('"' + tag + '":"');
							temp = temp.length > 1 ? temp[1].split('",')[0].split('"}')[0] : null;
							temp = temp && tag != "version" ? temp.charAt(0).toUpperCase() + temp.slice(1) : temp;
							theme[tag] = temp;
						}
						theme.css = text.split("\n").slice(1).join("\n").replace(new RegExp("[\\r|\\n|\\t]", "g"), "");
						theme.url = url;
						loadedThemes[url] = theme;
					}
				}
				i++;
				getThemeInfo(loadedThemes, callback);
			});
		}
	}
	
	downloadTheme (theme) {
		let request = require("request");
		request(theme.url, (error, response, body) => {
			if (error) {
				BDfunctionsDevilBro.showToast(`Unable to download Theme "${theme.name}".`, {type:"danger"});
			}
			else {
				let filename = theme.url.split("/");
				this.createThemeFile(filename[filename.length - 1], body);
			}
		});
	}
	
	createThemeFile (filename, content) {
		let fileSystem = require("fs");
		let path = require("path");
		var file = path.join(BDfunctionsDevilBro.getThemesFolder(), filename);
		fileSystem.writeFile(file, content, (error) => {
			if (error) {
				BDfunctionsDevilBro.showToast(`Unable to save Theme "${filename}".`, {type:"danger"});
			}
			else {
				BDfunctionsDevilBro.showToast(`Successfully saved Theme "${filename}".`, {type:"success"});
			}
		});
	}
}
