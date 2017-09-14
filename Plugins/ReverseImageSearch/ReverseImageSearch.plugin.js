//META{"name":"ReverseImageSearch"}*//

class ReverseImageSearch {
	constructor () {
		
		this.messageContextObserver;

		this.messageContextEntryMarkup =
			`<div class="item-group">
				<div class="item reverseimagesearch-item item-subMenu">
					<span>Reverse Image Search</span>
					<div class="hint"></div>
				</div>
			</div>`;
			
		this.messageContextSubMenuMarkup = 
			`<div class="context-menu reverseImageSearchSubMenu">
				<div class="item-group">
					<div class="item RIS-alldisabled-item disabled">
						<span>All disabled</span>
						<div class="hint"></div>
					</div>
					<div class="item RIS-baidu-item">
						<span>Baidu</span>
						<div class="hint"></div>
					</div>
					<div class="item RIS-bing-item">
						<span>Bing</span>
						<div class="hint"></div>
					</div>
					<div class="item RIS-google-item">
						<span>Google</span>
						<div class="hint"></div>
					</div>
					<div class="item RIS-reddit-item">
						<span>Reddit</span>
						<div class="hint"></div>
					</div>
					<div class="item RIS-sogou-item">
						<span>Sogou</span>
						<div class="hint"></div>
					</div>
					<div class="item RIS-tineye-item">
						<span>TinEye</span>
						<div class="hint"></div>
					</div>
					<div class="item RIS-yandex-item">
						<span>Yandex</span>
						<div class="hint"></div>
					</div>
				</div>
			</div>`;
	}
		
	getName () {return "ReverseImageSearch";}

	getDescription () {return "Adds a reverse image search option to the context menu.";}

	getVersion () {return "2.0.0";}

	getAuthor () {return "DevilBro";}

    getSettingsPanel () {
		return `<label>Reverse Search Engines</label><br>\n<input type="checkbox" onchange="ReverseImageSearch.updateSettings(this.parentNode)" value="enableBaidu"${(ReverseImageSearch.getSettings().enableBaidu ? " checked" : void 0)}> Baidu<br>\n<input type="checkbox" onchange="ReverseImageSearch.updateSettings(this.parentNode)" value="enableBing"${(ReverseImageSearch.getSettings().enableBing ? " checked" : void 0)}> Bing<br>\n<input type="checkbox" onchange="ReverseImageSearch.updateSettings(this.parentNode)" value="enableGoogle"${(ReverseImageSearch.getSettings().enableGoogle ? " checked" : void 0)}> Google<br>\n<input type="checkbox" onchange="ReverseImageSearch.updateSettings(this.parentNode)" value="enableReddit"${(ReverseImageSearch.getSettings().enableReddit ? " checked" : void 0)}> Reddit<br>\n<input type="checkbox" onchange="ReverseImageSearch.updateSettings(this.parentNode)" value="enableSogou"${(ReverseImageSearch.getSettings().enableSogou ? " checked" : void 0)}> Sogou<br>\n<input type="checkbox" onchange="ReverseImageSearch.updateSettings(this.parentNode)" value="enableTinEye"${(ReverseImageSearch.getSettings().enableTinEye ? " checked" : void 0)}> TinEye<br>\n<input type="checkbox" onchange="ReverseImageSearch.updateSettings(this.parentNode)" value="enableYandex"${(ReverseImageSearch.getSettings().enableYandex ? " checked" : void 0)}> Yandex<br>`;
    }

	//legacy
	load () {}

	start () {
		this.messageContextObserver = new MutationObserver((changes, _) => {
			changes.forEach(
				(change, i) => {
					if (change.addedNodes) {
						change.addedNodes.forEach((node) => {
							if (node.nodeType == 1 && node.className.includes("context-menu")) {
								this.onContextMenu(node);
							}
						});
					}
				}
			);
		});
		this.messageContextObserver.observe($("#app-mount>:first-child")[0], {childList: true});
	}

	stop () {
		this.messageContextObserver.disconnect();
	}
	
	// begin of own functions

	getReactInstance (node) { 
		return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
	}

	getReactObject (node) { 
		return ((inst) => (inst._currentElement._owner._instance))(this.getReactInstance(node));
	}
	
	static getSettings () {
		var defaultSettings = {
			enableBaidu: true,
			enableBing: true,
			enableGoogle: true,
			enableReddit: true,
			enableSogou: true,
			enableTinEye: true,
			enableYandex: true
		};
		var settings = bdPluginStorage.get("ReverseImageSearch", "settings");
		if (settings == null) {
			settings = {};
		}
		var saveSettings = false;
		for (var key in this.defaultSettings) {
			if (settings[key] == null) {
				settings[key] = this.defaultSettings[key];
				saveSettings = true;
			}
		}
		if (saveSettings) {
			bdPluginStorage.set("ReverseImageSearch", "settings", settings);
		}
		return settings;
	}

    static updateSettings (settingspanel) {
		var oldSettings = ReverseImageSearch.getSettings();
		var settings = {};
		var inputs = settingspanel.querySelectorAll("input");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		bdPluginStorage.set("ReverseImageSearch", "settings", settings);
    }
	
	onContextMenu (context) {
		var inst = this.getReactInstance(context);
		if (!inst) return;
		var ele = inst._currentElement;
		if (ele.props && ele.props.children) {
			var children = Array.isArray(ele.props.children) ? ele.props.children : [ele.props.children];
			for (var i = 0; i < children.length; i++) {
				if (children[i] && children[i].props && children[i].props.src && children[i].type && children[i].type.displayName == "NativeLinkGroup") {
					var url = children[i].props.src;
					if (url.indexOf("https://discordapp.com/assets/") == -1) {
						
						if (url.indexOf("https://images-ext-1.discordapp.net/external/") > -1) {
							if (url.split("/https/").length != 1) {
								url = "https://" + url.split("/https/")[url.split("/https/").length-1];
							}
							else if (url.split("/http/").length != 1) {
								url = "http://" + url.split("/http/")[url.split("/http/").length-1];
							}
						}
							
						var data = {"url": url};
						$(context).append(this.messageContextEntryMarkup)
							.on("mouseenter", ".reverseimagesearch-item", data, this.createContextSubMenu.bind(this))
							.on("mouseleave", ".reverseimagesearch-item", data, this.deleteContextSubMenu.bind(this));
					}
				}
			}
		}
	}
	
	createContextSubMenu (e) {
		var theme = this.themeIsLightTheme() ? "" : "theme-dark";
		
		var imageurl = e.data.url;
		var searchurl = "";
		
		var targetDiv = e.target.tagName != "SPAN" ? e.target : e.target.parentNode;
		
		var messageContextSubMenu = $(this.messageContextSubMenuMarkup);
		$(targetDiv).append(messageContextSubMenu)
			.off("click", ".RIS-baidu-item,.RIS-bing-item,.RIS-google-item,.RIS-reddit-item,.RIS-sogou-item,.RIS-tineye-item,.RIS-yandex-item")
			.on("click", ".RIS-baidu-item,.RIS-bing-item,.RIS-google-item,.RIS-reddit-item,.RIS-sogou-item,.RIS-tineye-item,.RIS-yandex-item", (e) => {
				$(".context-menu").hide();
				
				var choice = e.target.tagName != "SPAN" ? e.target : e.target.parentNode;
				switch (choice.className) {
					case "item RIS-baidu-item": 
						searchurl = "http://image.baidu.com/pcdutu?queryImageUrl=" + imageurl;
						break;
					case "item RIS-bing-item": 
						searchurl = "https://www.bing.com/images/search?q=imgurl:" + imageurl + "&view=detailv2&iss=sbi&FORM=IRSBIQ";
						break;
					case "item RIS-google-item": 
						searchurl = "https://images.google.com/searchbyimage?image_url=" + imageurl;
						break;
					case "item RIS-reddit-item": 
						searchurl = "http://karmadecay.com/search?q=" + imageurl;
						break;
					case "item RIS-sogou-item": 
						searchurl = "http://pic.sogou.com/ris?flag=1&drag=0&query=" + imageurl;
						break;
					case "item RIS-tineye-item": 
						searchurl = "https://tineye.com/search?url=" + imageurl;
						break;
					case "item RIS-yandex-item": 
						searchurl = "https://yandex.com/images/search?url=" + imageurl + "&rpt=imageview";
						break;
				}
				window.open(searchurl, "_blank");
			});
		$(messageContextSubMenu)
			.addClass(theme)
			.css("left", $(targetDiv).offset().left + "px")
			.css("top", $(targetDiv).offset().top + "px");
			
		var disabled = 0;
		if (!ReverseImageSearch.getSettings().enableBaidu) 	{$(targetDiv).find(".RIS-baidu-item").remove();disabled++;}
		if (!ReverseImageSearch.getSettings().enableBing) 	{$(targetDiv).find(".RIS-bing-item").remove();disabled++;}
		if (!ReverseImageSearch.getSettings().enableGoogle) {$(targetDiv).find(".RIS-google-item").remove();disabled++;}
		if (!ReverseImageSearch.getSettings().enableReddit) {$(targetDiv).find(".RIS-reddit-item").remove();disabled++;}
		if (!ReverseImageSearch.getSettings().enableSogou) 	{$(targetDiv).find(".RIS-sogou-item").remove();disabled++;}
		if (!ReverseImageSearch.getSettings().enableTinEye) {$(targetDiv).find(".RIS-tineye-item").remove();disabled++;}
		if (!ReverseImageSearch.getSettings().enableYandex) {$(targetDiv).find(".RIS-yandex-item").remove();disabled++;}
		if (disabled < 7) {$(targetDiv).find(".RIS-alldisabled-item").remove();};
	}
	
	deleteContextSubMenu (e) {
		$(".reverseImageSearchSubMenu").hide();
	}
	
	themeIsLightTheme () {
		if ($(".theme-light").length > $(".theme-dark").length) {
			return true;
		}
		else {
			return false;
		}
	}
}
