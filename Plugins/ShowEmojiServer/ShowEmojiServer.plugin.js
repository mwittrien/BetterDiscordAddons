//META{"name":"ShowEmojiServer"}*//

class ShowEmojiServer {
	constructor () {
		this.emojiList = {};
	}

	getName () {return "showEmojiServer";}

	getDescription () {return "Shows the server of the emoji, when you hover over it";}

	getVersion () {return "1.1.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	unload () {}

	start () {
	}

	stop () {
	}
	
	onEmojiPicker (ele) {
		console.log(ele);
	}
	
	observer (e) {
		var elem = e.addedNodes[0];
		
		if ($(elem).find('.emoji-item')) {
			this.hoverEmoji();
		}
		
		if (elem && elem.id && elem.id == "bda-qem") {
			this.loadEmojiList();
		}
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
						var url = emoji.url;
						var serverName = this.getNameOfServer(currentServer, categories);
						emojiList[url] = serverName;
					}
				}
			}
		}
	}
	
	hoverEmoji () {
		var emojiList = this.emojiList;
		$(".emoji-item").hover(
			function () {
				var url = $(this).css("background-image");
				url = url.replace("url(\"","").replace("\")","");
				var serverName = emojiList[url];
				if (serverName){
					$(this).attr("title", serverName);
				}
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
