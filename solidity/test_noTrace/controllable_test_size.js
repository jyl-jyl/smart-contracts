var YourContract = artifacts.require("Controllable");

contract('Controllable', function(accounts) {
  it("get the size of the Controllable contract", function() {
    return YourContract.deployed().then(function(instance) {
      var bytecode = instance.constructor._json.bytecode;
      var deployed = instance.constructor._json.deployedBytecode;
      var sizeOfB  = bytecode.length / 2;
      var sizeOfD  = deployed.length / 2;
      console.log("Controllable size of bytecode in bytes = ", sizeOfB);
      console.log("Controllable size of deployed in bytes = ", sizeOfD);
      console.log("Controllable initialisation and constructor code in bytes = ", sizeOfB - sizeOfD);
    });  
  });
});