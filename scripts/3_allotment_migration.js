const OFINAllotment = artifacts.require("OFINAllotment");
const OFINToken = artifacts.require("OFINToken");

module.exports = function (deployer) {
  deployer.deploy( OFINAllotment, OFINToken.address )
  .then(() => OFINToken.deployed())
    .then((instance) => {
        instance.grantMinterRole(OFINAllotment.address);
    }).then(() => console.log("Granted Minter Role to Allotment Contract"));
};