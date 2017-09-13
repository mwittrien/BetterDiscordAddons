//META{"name":"ReverseImageSearch"}*//

class ReverseImageSearch {
	constructor () {
		
		this.messageContextObserver;

		this.messageContextEntryMarkup =
			`<div class="item-group">
				<div class="item reverseimagesearch-item">
					<span>Reverse Image Search</span>
					<div class="hint"></div>
				</div>
			</div>`;
	}
		
	getName () {return "ReverseImageSearch";}

	getDescription () {return "Adds a reverse image search option to the context menu.";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}

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
	
	onContextMenu (context) {
		var inst = this.getReactInstance(context);
		if (!inst) return;
		var ele = inst._currentElement;
		if (ele.props && ele.props.children) {
			var children = Array.isArray(ele.props.children) ? ele.props.children : [ele.props.children];
			for (var i = 0; i < children.length; i++) {
				if (children[i] && children[i].props && children[i].props.src && children[i].type && children[i].type.displayName == "NativeLinkGroup") {
					// discords default emotes are not publicly accessible, so they can't be reverse image searched
					if (children[i].props.src.indexOf("https://discordapp.com/assets/") == -1) {
						var { src } = children[i].props;
						var data = { src };
						$(context).append(this.messageContextEntryMarkup)
						.on("click", ".reverseimagesearch-item", data, this.reverseImageSearch.bind(this));
						break;
					}
				}
			}
		}
	}
	
	reverseImageSearch (e) {
		$(e.delegateTarget).hide();
		var imageUrl = e.data.src;
		var searchurl = "https://images.google.com/searchbyimage?image_url=" + imageUrl;
		window.open(searchurl, "_blank");
	}
}
