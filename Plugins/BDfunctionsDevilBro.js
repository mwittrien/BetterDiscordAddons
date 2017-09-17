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
	alert("Fatal Error could not create FunctionClass.");
}
