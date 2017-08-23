//META{"name":"ShowEmojiServer"}*//

class ShowEmojiServer {
	constructor () {
		this.emojiPickerObserver;
		
		this.emojiList = {};
	}

	getName () {return "showEmojiServer";}

	getDescription () {return "Shows the server of the emoji, when you hover over it";}

	getVersion () {return "1.2.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	unload () {}

	start () {
		this.emojiPickerObserver = new MutationObserver((changes, _) => {
			changes.forEach(
				(change, i) => {
					if (change.addedNodes) {
						change.addedNodes.forEach((node) => {
							if ($(node).find('.emoji-item')) {
								this.hoverEmoji();
							}
							if (node && node.id && node.id == "bda-qem") {
								this.loadEmojiList();
							}
						});
					}
				}
			);
		});
		this.emojiPickerObserver.observe($("#app-mount>:first-child")[0], {childList: true, subtree: true});
	}

	stop () {
		this.emojiPickerObserver.disconnect();
	}
	
	loadEmojiList () {
		var emojiList = this.emojiList;

		var firstEmoji = document.getElementsByClassName("emoji-item")[0];
		if (firstEmoji) {
			var firstEmojiObj = this.getReactObject(firstEmoji);
			var rows = firstEmojiObj.cachedMetaDataNoSearch;
			var categories = firstEmojiObj.categories;
			
			for (var i = 0; i < rows.length; i++) {
				var currentServer = rows[i].category;
				if (currentServer.indexOf("custom") != -1){	
					var emojis = rows[i].items;
					for (var j = 0; j < emojis.length; j++) {
						var emoji = emojis[j].emoji;
						var emojiUrl = emoji.url;
						var emojiName = emoji.allNamesString;
						var serverName = this.getNameOfServer(currentServer, categories);
						emojiList[emojiUrl] = JSON.stringify({emojiName:emojiName,serverName:serverName});
					}
				}
			}
		}
	}
	
	hoverEmoji () {
		var emojiList = this.emojiList;
		$(".emoji-item").hover(
			function () {
				if (!this.hovering) {
					this.hovering = true;
					var emojiUrl = $(this).css("background-image");
					emojiUrl = emojiUrl.replace("url(\"","").replace("\")","");
					if (emojiList[emojiUrl]){
						var data = JSON.parse(emojiList[emojiUrl]);
						var emojiName = data.emojiName;
						var serverName = data.serverName;
						$(this).attr("title", emojiName + "\n" + serverName);
					}
				}
			},
			function () {
				this.hovering = false;
			}
		);
	}
	
	getNameOfServer (server, categories) {
		var name = "";
		for (var i = 0; i < categories.length; i++) {
			if (server == categories[i].category) {
				name = categories[i].title;
				break;
			}
		}
		return name;
	}
	
	getReactInstance (node) { 
		return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
	}

	getReactObject (node) { 
		return ((inst) => (inst._currentElement._owner._instance))(this.getReactInstance(node));
	}
}
