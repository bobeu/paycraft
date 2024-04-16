// SPDX-License-Identifier: MIT 

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
// import {IERC20} from "../interfaces/IERC20.sol";

pragma solidity 0.8.19;

contract Employer is Context {
    uint8 public loanInterestRate;

    // uint public generateWorkId;

    // mapping (address => mapping(uint => bytes)) private employersPhoneMap;
    mapping (address => EmployeePayload[]) private employees;
    mapping (address => mapping (address => bool)) isAdded;
    // EmployeePayload[] private employees;

    function addEmployee(address[] memory addresses, uint256[] memory payments) public returns(bool done) {
        uint addressLength = addresses.length;
        address sender = _msgSender();
        require(addressLength == payments.length, "Addresses to payment mismatch");
        // uint workId = generateWorkId;
        for(uint8 i = 0; i < addressLength; i++) {
            address addr = addresses[i];
            // workId += i;
            if(addr != address(0)) {
                if(!isAdded[sender][addr]) {
                    isAdded[sender][addr] = true;
                    employees[sender].push(EmployeePayload( addr, i, true, AdvanceRequest(0), LoanRequest(0, 0)));
                }
            }
        }
        // generateWorkId = workId;
        return done;
    }

    function disableEmployee(uint workId) public returns(bool) {
        address sender = _msgSender();
        require(workId < employees[sender].length, "Invalid workId");
        EmployeePayload memory emp = employees[sender][workId];
        require(emp.active, "Disabled");
        employees[sender][workId] = false;

        return true;
    }

    function requestSalaryAdvance() returns(bool) {

    }

    function requestLoan() returns(bool) {

    }

    function save4Me() returns(bool) {

    }

}