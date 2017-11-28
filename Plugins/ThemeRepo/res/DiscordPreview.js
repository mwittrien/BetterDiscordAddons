function receiveMessage(event) {
	event.source.postMessage("hi", event.origin);
}

window.addEventListener("message", receiveMessage, false);
