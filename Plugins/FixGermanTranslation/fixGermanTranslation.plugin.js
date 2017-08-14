//META{"name":"FixGermanTranslation"}*//

class FixGermanTranslation {
	constructor () {
	}

	getName () {return "FixGermanTranslation";}

	getDescription () {return "Fixes some german translation errors.";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	unload () {}

	start () {
		if (document.getElementsByTagName("html")[0].lang.split("-")[0] == "de") {
			const contextmo = new MutationObserver((changes, _) => {
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
			contextmo.observe($("#app-mount>:first-child")[ 0 ], { childList: true });
		}
	}

	stop () {}

	
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
		var curEle = inst._currentElement;
		if (curEle.props && curEle.props.children) {
			var children = Array.isArray(curEle.props.children) ? curEle.props.children : [curEle.props.children];
			for (var i = 0; i < children.length; i++) {
				if (children[i] && children[i].props && children[i].props.guild && children[i].type && children[i].type.displayName == "GuildLeaveGroup") {
					var allLabels = Array.from(context.getElementsByClassName("label"));
					allLabels.forEach(function(label) {
						if (label.innerText.indexOf("Serverweit Mikrofone deaktivieren") != -1) {
							label.innerText = "Server stummschalten";
						}
						if (label.innerText.indexOf("Hide Muted Channels") != -1) {
							label.innerText = "Verstecke stumme Kanäle";
						}
					});
					break;
				}
			}
		}
	}
}