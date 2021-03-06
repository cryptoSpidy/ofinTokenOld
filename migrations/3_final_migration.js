const OFINAllotment = artifacts.require("OFINAllotment");
const OFINToken = artifacts.require("OFINToken");

module.exports = async function (deployer) {

    try{
        let ofin = await OFINToken.deployed();
        let ofinAllotment = await deployer.deploy( OFINAllotment, OFINToken.address );
        
        await ofin.grantMinterRole(OFINAllotment.address);
        
        console.log("OFIN Token :" , OFINToken.address);
        console.log("OFIN Allotment Contract :" , OFINAllotment.address);
        
        console.log("Granted Minter Role to Allotment Contract");

        var stakingWallet = "0x405399e3073aA13D6F50dEE11A82373e24Bd6fa1";
        var privateRoundWallet = "0x2a0BADFf27b8551b857198CE9285D251bbdAb358";
        var promoWallet = "0x10b0c2DB6E40aB9f950803CA166EdaAEf96286A3";
        var teamWallet = "0xdc2c5E930C722C247FfE27C539477953Cb41db92";
        var ownerWallet = "0x2AE891ABd7E0B527a86587baB3B9d00e5C64A813";
        
        const stakingReleaseTime = 1600128000;
        const privateRoundReleaseTime = 1601856000;
        const promoReleaseTime = 1604534400;
        const teamReleaseTime = 1661731200;
        
        const stakingFund = "3888888";
        const privateRoundFund = "388888";
        const promoFund = "777777";
        const teamFund = "777777";
        const releasedFund = "1944447";

        let tx = await ofinAllotment.allotTokens.sendTransaction( stakingWallet, stakingReleaseTime, web3.utils.toWei(stakingFund, "ether") );
        console.log("StakingFund Alloted : ", tx);

        tx = await ofinAllotment.allotTokens.sendTransaction( privateRoundWallet, privateRoundReleaseTime, web3.utils.toWei(privateRoundFund, "ether") );
        console.log("PrivateRoundFund Alloted : ", tx);

        tx = await ofinAllotment.allotTokens.sendTransaction( promoWallet, promoReleaseTime, web3.utils.toWei(promoFund, "ether") );
        console.log("PromoFund Alloted : ", tx);

        tx = await ofinAllotment.allotTokens.sendTransaction( teamWallet, teamReleaseTime, web3.utils.toWei(teamFund, "ether") );
        console.log("TeamFund Alloted : ", tx);

        tx = await ofin.mint(ownerWallet, web3.utils.toWei(releasedFund, "ether"));
        console.log("ReleasedFund Alloted : ", tx);
    
    } catch(error){
        console.log("Error : ", error.toString())
    }

};