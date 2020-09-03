const OFINToken = artifacts.require("OFINToken");
const TokenTimelock = artifacts.require("TokenTimelock");
const OFINAllotment = artifacts.require("OFINAllotment");
const BigNumber = require("bignumber.js");
const {time} = require("@openzeppelin/test-helpers");
const truffleAssert = require("truffle-assertions");

contract("Token Allotment Contract", async function(accounts){

    var admin = accounts[0];
    var alloter = accounts[1];
    var stakingWallet = accounts[2];
    var promoWallet = accounts[3];
    var teamWallet = accounts[4];
    var privateRoundWallet = accounts[5];

    const stakingWalletTime = 1600128000;
    const promoWalletTime = 1604534400;
    const teamWalletTime = 1661731200;
    const privateRoundTime = 1601856000;

    const extendedPromoWalletTime = 1604536400;

    const stakingFund = "3888888";
    const promoFund = "777777";
    const teamFund = "777777";
    const privateRoundFund = "388888";
    const releasedFund = "1944447";

    var stakingAllotment;
    var promoAllotment;
    var teamAllotment;
    var privateRoundAllotment;
    
    var ofin;
    var ofinAllotment;

    before(async function (){
        ofin = await OFINToken.new({from: admin});
        ofinAllotment = await OFINAllotment.new(ofin.address,{from: admin});
    });

    it("Positive Test - Add alloter grantBurnerRole", async()=> {
        const result = await ofinAllotment.grantAlloterRole(alloter);
        var event = result.logs[0].event;
    
        assert.equal( event, "RoleGranted", "RoleGranted event should be fired" );
    });


    it('Negative Test - create staking allotment without MinterRole', async function () {

        try{
            await ofinAllotment.allotTokens( stakingWallet, stakingWalletTime, web3.utils.toWei(stakingFund, "ether") );
            assert.fail("Minting of the token should not be done");
        } catch( error ){
            assert.include(error.toString(), "OFINToken: must have minter role to mint", error.message);
        }
    });

    it("Positive Test - grant token mint role to allotment", async()=> {
        const result = await ofin.grantMinterRole(ofinAllotment.address);
        var event = result.logs[0].event;
    
        assert.equal( event,"RoleGranted", "RoleGranted event should be fired"
          );
    });

    it('Positive Test - create staking allotment', async function () {

        let tx = await ofinAllotment.allotTokens.sendTransaction( stakingWallet, stakingWalletTime, web3.utils.toWei(stakingFund, "ether") );

        let vestingContractAddress;

        truffleAssert.eventEmitted(tx, 'TokenVested', (ev) => {
            vestingContractAddress = ev.vestingContract;
            return ev.vestingContract != 0x0 && ev.beneficiary===stakingWallet;
        });

        stakingAllotment = await TokenTimelock.at(vestingContractAddress);

        assert.equal(await stakingAllotment.token(), ofin.address,"Incorrect TokenTimeLock contract creation");
        assert.equal(await stakingAllotment.beneficiary(), stakingWallet,"Incorrect TokenTimeLock contract creation");
        assert.equal(BigNumber(await stakingAllotment.releaseTime()), stakingWalletTime, "Incorrect TokenTimeLock contract creation");
        assert.equal(await stakingAllotment.isReleased(), false, "Incorrect TokenTimeLock contract creation");

        let stakingWalletBalance = await ofinAllotment.getTotalBalance.call({from:stakingWallet});
        assert.equal(BigNumber(stakingWalletBalance), 0, "Incorrect Balance for user");

        let stakingAllotmentBalance = await ofinAllotment.getTotalBalance.call({from:stakingAllotment.address});
        console.log(BigNumber(stakingAllotmentBalance));
        assert.equal(stakingAllotmentBalance, web3.utils.toWei(stakingFund, "ether"), "Incorrect Balance for vestingContract");

    });

    it('Positive Test - create promo allotment from alloter', async function () {
        
        let tx = await ofinAllotment.allotTokens.sendTransaction( promoWallet, promoWalletTime, web3.utils.toWei(promoFund, "ether"),{from: alloter} );

        let vestingContractAddress;

        truffleAssert.eventEmitted(tx, 'TokenVested', (ev) => {
            vestingContractAddress = ev.vestingContract;
            return ev.vestingContract != 0x0 && ev.beneficiary===promoWallet;
        });

        promoAllotment = await TokenTimelock.at(vestingContractAddress);

        assert.equal(await promoAllotment.token(), ofin.address,"Incorrect TokenTimeLock contract creation");
        assert.equal(await promoAllotment.beneficiary(), promoWallet,"Incorrect TokenTimeLock contract creation");
        assert.equal(BigNumber(await promoAllotment.releaseTime()), promoWalletTime, "Incorrect TokenTimeLock contract creation");
        assert.equal(await promoAllotment.isReleased(), false, "Incorrect TokenTimeLock contract creation");

        let promoWalletBalance = await ofinAllotment.getTotalBalance.call({from:promoWallet});
        assert.equal(BigNumber(promoWalletBalance), 0, "Incorrect Balance for user");

        let promoAllotmentBalance = await ofinAllotment.getTotalBalance.call({from:promoAllotment.address});
        console.log(BigNumber(promoAllotmentBalance));
        assert.equal(promoAllotmentBalance, web3.utils.toWei(promoFund, "ether"), "Incorrect Balance for vestingContract");

    });

    it('Positive Test - create team allotment', async function () {
        
        let tx = await ofinAllotment.allotTokens.sendTransaction( teamWallet, teamWalletTime, web3.utils.toWei(teamFund, "ether") );

        let vestingContractAddress;

        truffleAssert.eventEmitted(tx, 'TokenVested', (ev) => {
            vestingContractAddress = ev.vestingContract;
            return ev.vestingContract != 0x0 && ev.beneficiary===teamWallet;
        });

        teamAllotment = await TokenTimelock.at(vestingContractAddress);

        assert.equal(await teamAllotment.token(), ofin.address,"Incorrect TokenTimeLock contract creation");
        assert.equal(await teamAllotment.beneficiary(), teamWallet,"Incorrect TokenTimeLock contract creation");
        assert.equal(BigNumber(await teamAllotment.releaseTime()), teamWalletTime, "Incorrect TokenTimeLock contract creation");
        assert.equal(await teamAllotment.isReleased(), false, "Incorrect TokenTimeLock contract creation");

        let teamWalletBalance = await ofinAllotment.getTotalBalance.call({from:teamWallet});
        assert.equal(BigNumber(teamWalletBalance), 0, "Incorrect Balance for user");

        let teamAllotmentBalance = await ofinAllotment.getTotalBalance.call({from:teamAllotment.address});
        console.log(BigNumber(teamAllotmentBalance));
        assert.equal(teamAllotmentBalance, web3.utils.toWei(teamFund, "ether"), "Incorrect Balance for vestingContract");

    });

    it('Positive Test - create privateRound allotment', async function () {
        
        let tx = await ofinAllotment.allotTokens.sendTransaction( privateRoundWallet, privateRoundTime, web3.utils.toWei(privateRoundFund, "ether") );

        let vestingContractAddress;

        truffleAssert.eventEmitted(tx, 'TokenVested', (ev) => {
            vestingContractAddress = ev.vestingContract;
            return ev.vestingContract != 0x0 && ev.beneficiary===privateRoundWallet;
        });

        privateRoundAllotment = await TokenTimelock.at(vestingContractAddress);

        assert.equal(await privateRoundAllotment.token(), ofin.address,"Incorrect TokenTimeLock contract creation");
        assert.equal(await privateRoundAllotment.beneficiary(), privateRoundWallet,"Incorrect TokenTimeLock contract creation");
        assert.equal(BigNumber(await privateRoundAllotment.releaseTime()), privateRoundTime, "Incorrect TokenTimeLock contract creation");
        assert.equal(await privateRoundAllotment.isReleased(), false, "Incorrect TokenTimeLock contract creation");

        let privateRoundWalletBalance = await ofinAllotment.getTotalBalance.call({from:privateRoundWallet});
        assert.equal(BigNumber(privateRoundWalletBalance), 0, "Incorrect Balance for user");

        let privateRoundAllotmentBalance = await ofinAllotment.getTotalBalance.call({from:privateRoundAllotment.address});
        console.log(BigNumber(privateRoundAllotmentBalance));
        assert.equal(privateRoundAllotmentBalance, web3.utils.toWei(privateRoundFund, "ether"), "Incorrect Balance for vestingContract");

    });

    it('Positive Test - mint releasedFund to owner', async function () {
        
        let result = await ofin.mint(admin, web3.utils.toWei(releasedFund, "ether"));
        var event = result.logs[0].event;
    
        assert.equal( event, "Transfer", "Transfer event should be fired" );

        let ownerBalance = await ofinAllotment.getTotalBalance.call({from:admin});
        assert.equal(ownerBalance, web3.utils.toWei(releasedFund, "ether"), "Incorrect Balance for user");

    });

    it('Negative Test - mint more than cap', async function () {       
        try {
            await ofinAllotment.allotTokens.sendTransaction( privateRoundWallet, privateRoundTime, web3.utils.toWei("1", "ether") )
            assert.fail("Minter can mint tokens more than token supply");
        } catch (error) {
            assert.include(error.toString(), "ERC20Capped: cap exceeded.", error.message);
        }
    });

    it('Negative Test - release before releaseTime', async function () {       
        try {
            await ofinAllotment.release.sendTransaction( {from: teamWallet} )
            assert.fail("Owner released funds before release time");
        } catch (error) {
            assert.include(error.toString(), "TokenTimelock: current time is before release time", error.message);
        }
    });

    it('Positive Test - Admin releases stacking fund', async function (){
        let allotments = await ofinAllotment.getAllAllotments.call();
        assert.equal(allotments.length,4,"More than expected allotments seen overall");

        await time.increaseTo(stakingWalletTime);
        let stakingAllotmentAddress = allotments[0];
        let tx = await ofinAllotment.releaseAllotment(stakingAllotmentAddress, {from: admin});
        truffleAssert.eventEmitted(tx, 'TokenReleased', (ev) => {
            return ev.vestingContract === stakingAllotment.address && ev.beneficiary===stakingWallet;
        });

        let stakingWalletBalance = await ofinAllotment.getTotalBalance.call({from:stakingWallet});
        assert.equal(stakingWalletBalance, web3.utils.toWei(stakingFund, "ether"), "Incorrect Balance for user");

        let stakingAllotmentBalance = await ofinAllotment.getTotalBalance.call({from:stakingAllotment.address});
        assert.equal(BigNumber(stakingAllotmentBalance), 0, "Incorrect Balance for vestingContract");

    });

    it('Negative Test - extend releasetime and release on older releaseTime', async function () {       
        try {

            let allotments = await ofinAllotment.getAllotments.call({from:promoWallet});
            assert.equal(allotments.length,1,"More than expected allotments seen for user");

            await ofinAllotment.setNewReleaseTime(allotments[0],extendedPromoWalletTime);

            await time.increaseTo(promoWalletTime);
            await ofinAllotment.release.sendTransaction( {from: promoWallet} );
            assert.fail("User released funds before release time");
        } catch (error) {
            assert.include(error.toString(), "TokenTimelock: current time is before release time", error.message);
        }
    });

    it('Positive Test - release after extended releaseTime', async function () {       
        await time.increaseTo(extendedPromoWalletTime);
        let tx = await ofinAllotment.release.sendTransaction( {from: promoWallet} );

        truffleAssert.eventEmitted(tx, 'TokenReleased', (ev) => {
            return ev.vestingContract === promoAllotment.address && ev.beneficiary===promoWallet;
        });

        let promoWalletBalance = await ofinAllotment.getTotalBalance.call({from:promoWallet});
        assert.equal(promoWalletBalance, web3.utils.toWei(promoFund, "ether"), "Incorrect Balance for user");

        let promoAllotmentBalance = await ofinAllotment.getTotalBalance.call({from:promoAllotment.address});
        assert.equal(BigNumber(promoAllotmentBalance), 0, "Incorrect Balance for vestingContract");
    
    });

    it('Positive Test - release after releaseTime', async function () {       
        await time.increaseTo(teamWalletTime+100);
        let tx = await ofinAllotment.release.sendTransaction( {from: teamWallet} );

        truffleAssert.eventEmitted(tx, 'TokenReleased', (ev) => {
            return ev.vestingContract === teamAllotment.address && ev.beneficiary===teamWallet;
        });

        let teamWalletBalance = await ofinAllotment.getTotalBalance.call({from:teamWallet});
        assert.equal(teamWalletBalance, web3.utils.toWei(teamFund, "ether"), "Incorrect Balance for user");

        let teamAllotmentBalance = await ofinAllotment.getTotalBalance.call({from:teamAllotment.address});
        console.log(BigNumber(teamAllotmentBalance));
        assert.equal(BigNumber(teamAllotmentBalance), 0, "Incorrect Balance for vestingContract");
    
    });

});