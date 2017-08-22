//META{"name":"ShowEmojiServer"}*//

class ShowEmojiServer {
	constructor () {
		this.emojiList = {};
		this.hovering = false;
	}

	getName () {return "showEmojiServer";}

	getDescription () {return "Shows the server of the emoji, when you hover over it";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	unload () {}

	start () {
		var that = this;
		if (document.getElementsByClassName("guild selected").length == 0) {
			document.getElementsByClassName("avatar-small")[0].click();
		}
		setTimeout(function(){
			$('.emojiButton-38mF6t').trigger("click");
		}, 100);
		setTimeout(function(){
			$('#bda-qem-emojis').trigger("click");
		}, 200);
		setTimeout(function(){
			var emojiList = that.emojiList;

			var firstEmoji = document.getElementsByClassName("emoji-item")[0];
			if (firstEmoji) {
				var firstEmojiObj = that.getReactObject(firstEmoji);
				var rows = firstEmojiObj.cachedMetaDataNoSearch;
				var categories = firstEmojiObj.categories;
				
				$('.emojiButton-38mF6t').trigger("click");
				
				for (var i = 0; i < rows.length; i++) {
					var currentServer = rows[i].category;
					if (currentServer.indexOf("custom") != -1){	
						var emojis = rows[i].items;
						for (var j = 0; j < emojis.length; j++) {
							var emoji = emojis[j].emoji;
							var url = emoji.url;
							var serverName = that.getNameOfServer(currentServer, categories);
							emojiList[url] = serverName;
						}
					}
				}
			}
			console.log(that.getName() + ": EmojiList loaded.");
		}, 300);
	}

	stop () {
	}
	
	observer (e) {
		var elem = e.addedNodes[0];
		
		if($(elem).find('.emoji-item')){
			this.hoverEmoji();
		}
	}
	
	hoverEmoji () {
		var emojiList = this.emojiList;
		$(".emoji-item").hover(
			function () {
				if (!this.hovering) {
					this.hovering = true;
					var url = $(this).css("background-image");
					url = url.replace("url(\"","").replace("\")","");
					var serverName = emojiList[url];
					if (serverName){
						$(this).attr("title",serverName);
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
