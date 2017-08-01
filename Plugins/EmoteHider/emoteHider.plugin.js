//META{"name":"EmoteHider"}*//

class EmoteHider {
	constructor () { 
		this.labels = {};
		
		this.savedEmoteContainers = {};
		this.savedRowsStrings = {};
		
		this.css = `
			<style class='emotehider'>
			
			.emotehider-container .my-scroller {
				width: 338px;
				height: 269px;
			}
			
			.emotehider-container .my-emote-container {
				width: 28px;
				height: 28px;
			}
			
			.emotehider-container .my-emote-icon {
				margin: 2px;
				width: 28px;
				height: 28px;
			}
			
			.emotehider-container .my-category {
				width: 222px;
				display: inline-block;
			}
			
			.emotehider-container .my-hiddencounter {
				width: 62px;
				text-align: right;
				display: inline-block;
				float: right;
			}
			
			.emotehider-container .my-category-emote-container {
			}
			
			.emotehider-container .my-emote-menu-inner {
				padding-left: 0px;
				padding-right: 0px;
			}
			
			'</style>
		`;
		
		this.scrollerContainerMarkup =
			`<div class="emotehider-container scroller-wrap fade">
				<div class="my-scroller scroller">
					<div class="my-emote-menu-inner emote-menu-inner"></div>
				</div>
			</div>`;

		this.categoryContainerMarkup = 
			`<div class="my-category-container">
				<div class="my-category category" name=""></div>
				<div class="my-hiddencounter category" id=""></div>
				<div class="my-category-emote-container" id=""></div>
			</div>`;
			
		this.emojiContainerMarkup = 
			`<div class="my-emote-container emote-container">
				<img class="my-emote-icon emote-icon" id="" alt="" src="" title="">    
			</div>`;
	}

	getName () {return "EmoteHider";}

	getDescription () {return "Hides Emotes that are unuseable in the current server, similar to the mobile app";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	unload () {}

	start () {
		/*const contextmo = new MutationObserver((changes, _) => {
			changes.forEach(
				(change, i) => {
					if (change.addedNodes) {
						[ ...change.addedNodes ].forEach((node) => {
							if (node.nodeType == 1 && node.className.includes("popout")) {
								this.onPopoutMenu(node);
							}
						});
					}
				}
			);
		});
		var themes = document.getElementsByClassName("theme-dark");
		for (var i = 0; i < themes.length; i++) {
			if (themes[i].classList.length == 1) {
				contextmo.observe(themes[i], { childList: true });
			}
		}
		
		$('head').append(this.css);
		
		this.labels = this.setLabelsByLanguage();
		//this.changeLanguageStrings();
		//this.updateAllDivStates();*/
	}
	stop () {
		$('.emotehider').remove();
	}

	
	// begin of own functions

	getReactInstance (node) { 
		return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
	}

	getReactObject (node) { 
		return ((inst) => (inst._currentElement._owner._instance))(this.getReactInstance(node));
	}

	changeLanguageStrings () {
	}
	
	onPopoutMenu (popout) {
		var emojiPickerDiv = this.getEmojiPickerDiv(popout);
		if (emojiPickerDiv) {
			var scrollerDiv = this.getScrollerDiv(emojiPickerDiv);
			var categoriesDiv = this.getCategoriesDiv(emojiPickerDiv);
			if (scrollerDiv && categoriesDiv) {
				$(emojiPickerDiv).css("border", "0px");
				
				var firstEmoji = this.getFirstEmojiInScroller(scrollerDiv);
				
				scrollerDiv.remove();
				categoriesDiv.remove();
				
				if (firstEmoji) {
					var firstEmojiObj = this.getReactObject(firstEmoji);
					if (firstEmojiObj) {
						var rows = firstEmojiObj.cachedMetaDataNoSearch;
						var rowsString = this.getStringOfRows(rows);
						
						var currentServerId = this.getIdOfCurrentServer();
						
						if (this.savedEmoteContainers[currentServerId] && rowsString == this.savedRowsStrings[currentServerId]) {
							var savedEmoteContainer = this.savedEmoteContainers[currentServerId];
							savedEmoteContainer.appendTo(emojiPickerDiv);
						}
						else {
							var scrollContainer = $(this.scrollerContainerMarkup);
							scrollContainer.appendTo(emojiPickerDiv);
							
							var categories = firstEmojiObj.categories;
							var category = "";
							var hiddenCounter;
							
							var emotemenuinner = document.getElementsByClassName("my-emote-menu-inner emote-menu-inner")[0];
							
							for (var i = 0; i < rows.length; i++) {
								if (rows[i].category != category) {
									category = rows[i].category;
									hiddenCounter = 0;
									var title = this.getTitleOfCategory(category, categories);
									
									var categoryContainer = $(this.categoryContainerMarkup);
									categoryContainer.find(".my-category").attr("name", category);
									categoryContainer.find(".my-category").text(title);
									categoryContainer.find(".my-hiddencounter").attr("name", category);
									categoryContainer.find(".my-hiddencounter").attr("id", "hiddencounter_" + category);
									categoryContainer.find(".my-hiddencounter").text(hiddenCounter + " hidden");
									categoryContainer.find(".my-category-emote-container").attr("id", "emotecontainer_" + category);
									categoryContainer.appendTo(emotemenuinner);
								}
								for (var j = 0; j < rows[i].items.length; j++) {
									var emojiObj = rows[i].items[j].emoji;
									var serverIdOfEmote = emojiObj.guildId;
									if (emojiObj.managed || currentServerId == serverIdOfEmote) {
										var url = emojiObj.defaultUrl ? emojiObj.defaultUrl : emojiObj.url;
										var name = emojiObj.allNamesString.split(" ")[0];
										
										var emojiContainer = $(this.emojiContainerMarkup);
										emojiContainer.find(".my-emote-icon").attr("src", url);
										emojiContainer.find(".my-emote-icon").attr("id", name);
										emojiContainer.find(".my-emote-icon").attr("title", name);
										emojiContainer.appendTo("#emotecontainer_" + category);
									}
									else {
										categoryContainer.find("#hiddencounter_" + category).text(++hiddenCounter + " hidden");
									}
								}
							}
							this.savedEmoteContainers[currentServerId] = scrollContainer;
							this.savedRowsStrings[currentServerId] = rowsString;
						}
					}
				}
			}
		}
	}

	getStringOfRows (rows) {
		var string = "";
		var currentServerId = this.getIdOfCurrentServer();
		for (var i = 0; i < rows.length; i++) {
			for (var j = 0; j < rows[i].items.length; j++) {
				var emojiObj = rows[i].items[j].emoji;
				var serverIdOfEmote = emojiObj.guildId;
				if (emojiObj.managed || currentServerId == serverIdOfEmote) {
					string += emojiObj.allNamesString.split(" ")[0];
				}
			}
		}
		return string;
	}
	
	getEmojiPickerDiv (popout) {
		var emojiPicker;
		for (var i = 0; i < popout.childElementCount; i++) {
			if (popout.children[i].className.includes("emoji-picker")) {
				emojiPicker = popout.children[i];
				break;
			}
		}
		return emojiPicker;
	}
	
	getScrollerDiv (emojiPicker) {
		var scrollerWrap;
		var scroller;
		if (emojiPicker) {
			for (var j = 0; j < emojiPicker.children.length; j++) {
				if (emojiPicker.children[j].className.includes("scroller-wrap")) {
					scrollerWrap = emojiPicker.children[j];
					break;
				}
			}
			if (scrollerWrap) {
				for (var k = 0; k < scrollerWrap.children.length; k++) {
					if (scrollerWrap.children[k].className.includes("scroller")) {
						scroller = scrollerWrap.children[k];
						break;
					}
				}
			}
		}
		return scroller;
	}
	
	getCategoriesDiv (emojiPicker) {
		var categories;
		if (emojiPicker) {
			for (var i = 0; i < emojiPicker.children.length; i++) {
				if (emojiPicker.children[i].className.includes("categories")) {
					categories = emojiPicker.children[i];
					break;
				}
			}
		}
		return categories;
	}
	
	getFirstEmojiInScroller (scroller) {
		var row;
		var emojiItem;
		if (scroller) {
			for (var i = 0; i < scroller.children.length; i++) {
				if (scroller.children[i].className.includes("row")) {
					row = scroller.children[i];
					break;
				}
			}
			if (row) {
				for (var j = 0; j < row.children.length; j++) {
					if (row.children[j].className.includes("emoji-item")) {
						emojiItem = row.children[j];
						break;
					}
				}
			}
		}
		return emojiItem;
	}
	
	getTitleOfCategory (category, categories) {
		var title;
		for (var i = 0; categories.length > i; i++) {
			if (category == categories[i].category) {
				title = categories[i].title;
				break;
			}
		}
		return title;
	}
	
	getIdOfCurrentServer () {
		var id;
		var servers = document.getElementsByClassName("guild");
		for (var i = 0; i < servers.length; i++) {
			var childNodes = servers[i].getElementsByTagName("*");
			for (var j = 0; j < childNodes.length; j++) {
				if (childNodes[j].className.indexOf("avatar") != -1 && servers[i].className.includes("selected")) {
					id = childNodes[j].href.split("/")[4];
					break;
				}
			}
		}
		return id;
	}
	
	//TODO
	checkIfEmojiAlreadyAdded (emoji, emojies) {	
		var alreadyAdded = false;
		for (var i = 0; i < emojies.length; i++) {
			if (emojies[m].allNamesString.split(" ")[0] == emoji.allNamesString.split(" ")[0]) {
				alreadyAdded = true;
				break;
			}
		}
		return alreadyAdded;
	}
	
	setLabelsByLanguage () {
		
	}
}