// SPDX-License-Identifier: MIT
/**
 * ░▄▀▄▒█▀░█░█▄░█░░░▀█▀░▄▀▄░█▄▀▒██▀░█▄░█
 * ░▀▄▀░█▀░█░█▒▀█▒░░▒█▒░▀▄▀░█▒█░█▄▄░█▒▀█
 * 
 * URL: https://ofin.io/
 * Symbol: ON
 * 
 */
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 *
 * Useful for simple vesting schedules like "advisors get all of their tokens
 * after 1 year".
 */
contract TokenTimelock is Ownable {
    using SafeERC20 for IERC20;

    // ERC20 basic token contract being held
    IERC20 private _token;

    // beneficiary of tokens after they are released
    address private _beneficiary;

    // timestamp when token release is enabled
    uint256 private _releaseTime;

    // set to true when released
    bool private _released;

    constructor (IERC20 token, address beneficiary, uint256 releaseTime) Ownable() public {
        // solhint-disable-next-line not-rely-on-time
        require(releaseTime > block.timestamp, "TokenTimelock: release time is before current time");
        _token = token;
        _beneficiary = beneficiary;
        _releaseTime = releaseTime;
        _released = false;
    }

    /**
     * @return the token being held.
     */
    function token() public view returns (IERC20) {
        return _token;
    }

    /**
     * @return the beneficiary of the tokens.
     */
    function beneficiary() public view returns (address) {
        return _beneficiary;
    }

    /**
     * @return the time when the tokens are released.
     */
    function releaseTime() public view returns (uint256) {
        return _releaseTime;
    }

    /**
     * @return if token is released
     */
    function isReleased() public view returns (bool) {
        return _released;
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function release() public virtual {
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp >= _releaseTime, "TokenTimelock: current time is before release time");

        uint256 amount = _token.balanceOf(address(this));
        require(amount > 0, "TokenTimelock: no tokens to release");

        _released = true;
        _token.safeTransfer(_beneficiary, amount);
    }

    /**
     * @notice sets the revised time only if greater than the current release time
     */
    function setIncreasedReleaseTime( uint256 newReleaseTime ) public virtual onlyOwner {
        require(newReleaseTime >= _releaseTime, "TokenTimelock: newReleaseTime should be greater than older value");
        require(!_released,"TokenTimelock: tokens released already");
        _releaseTime = newReleaseTime;
    }
}