var BDfunctionsDevilBro;
if (typeof BDfunctionsDevilBroClass === "undefined") {
	class BDfunctionsDevilBroClass {
		static test () {
			console.log("HI");
		}
	}
	BDfunctionsDevilBro = new BDfunctionsDevilBroClass();
}
else {
	alert("Fatal Error: Could not create FunctionClass.");
}
