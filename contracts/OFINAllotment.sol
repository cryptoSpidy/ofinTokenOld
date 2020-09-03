// SPDX-License-Identifier: Copyright@ofin.io
/**
 * ░▄▀▄▒█▀░█░█▄░█░░░▀█▀░▄▀▄░█▄▀▒██▀░█▄░█
 * ░▀▄▀░█▀░█░█▒▀█▒░░▒█▒░▀▄▀░█▒█░█▄▄░█▒▀█
 * 
 * URL: https://ofin.io/
 * Symbol: ON
 * 
 */

 pragma solidity 0.6.12;

 import "./TokenTimelock.sol";
 import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
 import "@openzeppelin/contracts/math/SafeMath.sol";
 import "@openzeppelin/contracts/access/AccessControl.sol";
//  import "./interfaces/IOFINToken.sol";
import "./OFINToken.sol";

/**
* @dev This contract handles allotment of OFIN Token
*/
 contract OFINAllotment is AccessControl {
    
    using SafeERC20 for OFINToken;
    // using SafeERC20 for IOFINToken;
    using SafeMath for uint256;

    // OFIN token Contract
    // IOFINToken private _ofinToken;
    OFINToken private _ofinToken;

    bytes32 public constant ALLOTER_ROLE = keccak256("ALLOTER_ROLE");
    
    mapping( address => address[] ) private beneficiaryAllotments;
    address[] private allotments;

    event TokenVested(address indexed vestingContract, address indexed beneficiary);
    event TokenReleased(address indexed vestingContract, address indexed beneficiary, uint256 indexed tokenCount);

    /**
     * @dev Initialize the contract with OFIN token address
     *
     * @param ofinToken - OFIN Token address
     * 
     */
    constructor(address ofinToken) public {
        require(ofinToken != address(0), "OFINAllotment: token is zero address");

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ALLOTER_ROLE, _msgSender());

        // Set OFIN ERC20 token Contract
        // _ofinToken = IOFINToken(ofinToken);
        _ofinToken = OFINToken(ofinToken);
    }

    /**
    * @dev Get OFIN token contract address.
    *
    * @return account - Address of OFIN Token contract
    */
    function getOFINTokenContract() public view returns (address) {
        return address(_ofinToken);
    }

    /**
    * @dev Grant alloter role.
    * @param account - Address of the alloter to be granted the role
    * Requirements:
    *
    * - the caller must have the admin role.
    */
    function grantAlloterRole(address account) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "OFINAllotment: sender must be an admin to grant");
        super.grantRole(ALLOTER_ROLE, account);
    }

    /**
    * @dev create allotments and freeze tokens
    * @param beneficiary - Address of the beneficiary
    * @param releaseTime - time in the future till when it is locked
    * Requirements:
    *
    * - the caller must have the alloter role. 
    */
    function allotTokens(address beneficiary, uint256 releaseTime, uint256 tokenCount) public {
        
        require(hasRole(ALLOTER_ROLE, _msgSender()), "OFINAllotment: sender must be an alloter to allot tokens");
        require(beneficiary != address(0), "OFINAllotment: beneficiary is zero address");

        TokenTimelock allotment = new TokenTimelock(_ofinToken, beneficiary, releaseTime);

        address allotmentAddress = address(allotment);
        _ofinToken.mint(allotmentAddress, tokenCount);

        allotments.push(allotmentAddress);
        
        beneficiaryAllotments[beneficiary].push( allotmentAddress);

        emit TokenVested(allotmentAddress, beneficiary);
    }

    /**
    * @dev sets the release time
    * @param allotment - Address of the TokenTimeLock
    * @param newReleaseTime - time in the future till when it is locked
    * Requirements:
    *
    * - the caller must have the alloter role. 
    */
    function setNewReleaseTime(address allotment, uint256 newReleaseTime) external {
        
        require(hasRole(ALLOTER_ROLE, _msgSender()), "OFINAllotment: sender must be an alloter to extend release time");
        require(allotment != address(0), "OFINAllotment: allotment contract is zero address");

        TokenTimelock(allotment).setIncreasedReleaseTime(newReleaseTime);
    }

    /**
    * @dev releases the specified allotment is applicable
    * @param allotment - Address of the TokenTimeLock
    */
    function releaseAllotment(address allotment) external {
        require(address(allotment) != address(0), "OFINAllotment: allotment contract is zero address");
        TokenTimelock(allotment).release();
        emit TokenReleased(allotment, TokenTimelock(allotment).beneficiary(), _ofinToken.balanceOf(allotment));
    }

    /**
    * @dev releases all the allotments for the sender
    */
    function release() external {
        address[] memory myAllotments = beneficiaryAllotments[_msgSender()];
        for(uint i =0; i< myAllotments.length; i++ ){
            address allotment = myAllotments[i];
            uint256 balance = _ofinToken.balanceOf(allotment);
            TokenTimelock(allotment).release();
            emit TokenReleased(allotment, TokenTimelock(allotment).beneficiary(), balance);
        }
    }

    /**
    * @dev gets all the allotment address
    */
    function getAllAllotments() external view returns (address[] memory ){
        return allotments;
    }

    /**
    * @dev gets all senders allotments
    */
    function getAllotments() external view returns (address[] memory ){
        return beneficiaryAllotments[_msgSender()];
    }

    /**
    * @dev gets sender's total balance (released + locked)
    */
    function getTotalBalance() external view returns (uint256 ){
        address[] memory myAllotments = beneficiaryAllotments[_msgSender()];
        uint256 balance = _ofinToken.balanceOf(_msgSender());

        for(uint i =0; i< myAllotments.length; i++ ){
            balance.add(_ofinToken.balanceOf(myAllotments[i]));
        }

        return balance;
    }
}