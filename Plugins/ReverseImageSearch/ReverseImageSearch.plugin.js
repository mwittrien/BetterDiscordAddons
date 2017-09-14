//META{"name":"ReverseImageSearch"}*//

class ReverseImageSearch {
	constructor () {
		
		this.imageUrlReplaceString = "DEVILBRO_BD_REVERSEIMAGESEARCH_REPLACE_IMAGEURL";
		
		this.searchEngines = [
			{"name":"Baidu", 	"url":"http://image.baidu.com/pcdutu?queryImageUrl=" + this.imageUrlReplaceString},
			{"name":"Bing", 	"url":"https://www.bing.com/images/search?q=imgurl:" + this.imageUrlReplaceString + "&view=detailv2&iss=sbi&FORM=IRSBIQ"},
			{"name":"Google", 	"url":"https://images.google.com/searchbyimage?image_url=" + this.imageUrlReplaceString},
			{"name":"Reddit", 	"url":"http://karmadecay.com/search?q=" + this.imageUrlReplaceString},
			{"name":"Sogou", 	"url":"http://pic.sogou.com/ris?flag=1&drag=0&query=" + this.imageUrlReplaceString + "&flag=1"},
			{"name":"TinEye", 	"url":"https://tineye.com/search?url=" + this.imageUrlReplaceString},
			{"name":"Yandex", 	"url":"https://yandex.com/images/search?url=" + this.imageUrlReplaceString + "&rpt=imageview"}
		].sort(function(a, b) {
			var x = a.name; var y = b.name;
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
		
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
					<div class="item alldisabled-item disabled">
						<span>All disabled</span>
						<div class="hint"></div>
					</div>
					${ this.searchEngines.map((val, i) => `<div class="item ${val.name.replace(" ","")} RIS-item"><span>${val.name}</span><div class="hint"></div></div>`).join("")}
				</div>
			</div>`;
	}
		
	getName () {return "ReverseImageSearch";}

	getDescription () {return "Adds a reverse image search option to the context menu.";}

	getVersion () {return "2.1.0";}

	getAuthor () {return "DevilBro";}

    getSettingsPanel () {
		var settings = this.getSettings();
		var settingspanel = `<label>Reverse Search Engines</label><br>\n`;
		for (var i in this.searchEngines) {
			var engine = this.searchEngines[i].name;
			var checked = settings[engine] ? " checked" : "";
			settingspanel += `<input type="checkbox" onchange="ReverseImageSearch.updateSettings(this.parentNode)" value="` + engine + `"` + checked + `> ` + engine + `<br>\n`;
		}
		return settingspanel;
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
	
	getSettings () {
		var oldSettings = bdPluginStorage.get("ReverseImageSearch", "settings") ? bdPluginStorage.get("ReverseImageSearch", "settings") : {};
		var newSettings = {};
		for (var i in this.searchEngines) {
			var key = this.searchEngines[i].name;
			newSettings[key] = oldSettings[key] != null ? oldSettings[key] : true;
		}
		bdPluginStorage.set("ReverseImageSearch", "settings", newSettings);
		return newSettings;
	}

    static updateSettings (settingspanel) {
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
		
		var targetDiv = e.target.tagName != "SPAN" ? e.target : e.target.parentNode;
		
		var messageContextSubMenu = $(this.messageContextSubMenuMarkup);
		
		$(targetDiv).append(messageContextSubMenu)
			.off("click", ".RIS-item")
			.on("click", ".RIS-item", (e) => {
				$(".context-menu").hide();
				
				var choice = e.target.tagName != "SPAN" ? e.target : e.target.parentNode;
				for (var i in this.searchEngines) {
					var engine = this.searchEngines[i].name;
					if (choice.classList.contains(engine.replace(" ",""))) {
						var searchurl = this.searchEngines[i].url;
						searchurl = searchurl.replace(this.imageUrlReplaceString,imageurl);
						window.open(searchurl, "_blank");
						break;
					}
				}
				
			});
		$(messageContextSubMenu)
			.addClass(theme)
			.css("left", $(targetDiv).offset().left + "px")
			.css("top", $(targetDiv).offset().top + "px");
		
		var settings = this.getSettings();
		for (var key in settings) {
			if (!settings[key]) {
				$(targetDiv).find("." + key).remove();
			}
		}
		if ($(".reverseImageSearchSubMenu .RIS-item").length > 0) {$(targetDiv).find(".alldisabled-item").remove();};
	}
	
	deleteContextSubMenu (e) {
		$(".reverseImageSearchSubMenu").remove();
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
