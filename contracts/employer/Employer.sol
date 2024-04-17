// SPDX-License-Identifier: MIT 

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { IEmployer } from "./IEmployer.sol";

interface IERC20 {
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

pragma solidity 0.8.20;

contract Employer is Context, IEmployer {
    uint8 public loanInterestRate;
    
    address public immutable cUSD;
    bytes32 public immutable LOAN_HASH;
    bytes32 public immutable ADVANCE_HASH;
    bytes32 public immutable ACCEPTED_HASH;
    bytes32 public immutable REJECTED_HASH;


    mapping (address => EmployeePayload[]) private employees;
    mapping (address => mapping (address => bool)) isAdded;

    modifier validateEmployeeId(uint employeeId, address employer) {
        require(employeeId < employees[employer].length, "Invalid employeeId");
        _;
    }

    constructor (address _cUSD) {
        if(_cUSD == address(0)) revert();
        cUSD = _cUSD;
        LOAN_HASH = _toHash("LOAN");
        ADVANCE_HASH = _toHash("ADVANCE");
        ACCEPTED_HASH = _toHash("ACCEPTED");
        REJECTED_HASH = _toHash("REJECTED");
    }

    receive() external payable { revert(); }

    function _toHash(string memory loanOrHashStr) internal pure returns(bytes32 _hash) {
        return keccak256(abi.encode(loanOrHashStr));
    }
    
    function addEmployee(address[] memory addresses, uint256[] memory payments, uint8 saveForMeRate) public returns(bool done) {
        address sender = _msgSender();
        uint addressLength = addresses.length;
        require(addressLength == payments.length, "Addresses to payment mismatch");
        for(uint8 i = 0; i < addressLength; i++) {
            address addr = addresses[i];
            if(addr != address(0)) {
                if(!isAdded[sender][addr]) {
                    isAdded[sender][addr] = true;
                    employees[sender].push(EmployeePayload( addr, i, true, false, payments[i], saveForMeRate, AdvanceRequest(0, AdvanceRequestStatus(0)), LoanRequest(0, 0, LoanRequestStatus(0))));
                }
            }
        }
        return done;
    }

    function disableOrEnableEmployee(uint employeeId, bool value) 
        public 
        validateEmployeeId(employeeId, _msgSender()) 
        returns(bool) 
    {
        address sender = _msgSender();
        EmployeePayload memory emp = employees[sender][employeeId];
        if(value) {
            require(!emp.active, "Enabled");
        } else {
            require(emp.active, "Disabled");
        }
        employees[sender][employeeId] = value;

        return true;
    }

    function requestAdvanceOrLoan(address employerAddr, uint employeeId, uint amount, string memory loanOrAdvanceStr) 
        public 
        validateEmployeeId(employeeId, employerAddr) 
        returns(bool) 
    {
        EmployeePayload memory pld = employees[employerAddr][employeeId];
        string memory errorMessage = "You have pending request";
        bool condition;
        if(_toHash(loanOrAdvanceStr) == ADVANCE_HASH) {
            pld.advanceReq.status == AdvanceRequestStatus.NONE;
            require(amount <= pld.pay, "Advance cannot exceed Salary");
            employees[employerAddr][employeeId].advanceReq = AdvanceRequest(amount, AdvanceRequestStatus.PENDING);
        } else if(_toHash(loanOrAdvanceStr) == LOAN_HASH) {
            pld.loanReq.status == LoanRequestStatus.NONE;
            errorMessage = "You have pending loan request";
            employees[employerAddr][employeeId].loanReq = LoanRequest(amount, 0, LoanRequestStatus.REQUESTED);
        } else {
            revert(loanOrAdvanceStr);
        }
        require(condition, errorMessage);

        return true;
    }

    function approveLoanOrAdvanceRequest(uint employeeId, uint8 rate, string memory loanOrAdvanceStr) 
        public 
        validateEmployeeId(employeeId, _msgSender()) 
        returns(bool) 
    {
        address sender = _msgSender();
        EmployeePayload memory emp = employees[sender][employeeId];
        require(emp.active, "Disabled");
        uint allowance = IERC20(cUSD).allowance(sender, address(this));
        if(_toHash(loanOrAdvanceStr) == ADVANCE_HASH) {
            require(emp.advanceReq.status == AdvanceRequestStatus.PENDING, "Invalid request");
            employees[sender][employeeId].advanceReq = AdvanceRequest(allowance, AdvanceRequestStatus.DISBURSED);
            if(!IERC20(cUSD).transferFrom(sender, emp.identifier, allowance)) revert TransferFromFailed();
        } else if(_toHash(loanOrAdvanceStr) == LOAN_HASH) {
            require(emp.loanReq.status == LoanRequestStatus.REQUESTED, "Invalid request");
            employees[sender][employeeId].loanReq = LoanRequest(
                allowance,
                (allowance * rate) / 100,
                LoanRequestStatus.RESPONDED
            );
        } else {
            revert (loanOrAdvanceStr);
        }
    }

    function acceptOrRejectLoanApproval(address employerAddr, uint employeeId, string memory acceptOrRejectStr) 
        public 
        validateEmployeeId(employeeId, employerAddr)
        returns(bool) 
    {
        address sender = _msgSender();
        EmployeePayload memory emp = employees[sender][employeeId];
        uint allowance = IERC20(cUSD).allowance(employerAddr, address(this));
        require(sender == emp.identifier, "UnAuthorized call");
        if(allowance > 0) {
            if(_toHash(acceptOrRejectStr) == ACCEPTED_HASH) {
                employees[sender][employeeId].loanReq.status = LoanRequestStatus.ACCEPTED;
                if(!IERC20(cUSD).transferFrom(employerAddr, emp.identifier, allowance)) revert TransferFromFailed();
            } else if(_toHash(acceptOrRejectStr) == REJECTED_HASH) {
                delete employees[sender][employeeId].loanReq;
            } else {
                revert (acceptOrRejectStr);
            }
        } else {
            delete employees[sender][employeeId].loanReq;
        }

        return true;
    }

    function save4Me(address employerAddr, uint employeeId, bool value)
        public
        validateEmployeeId(employeeId, employerAddr) 
        returns(bool) 
    {
        address sender = _msgSender();
        EmployeePayload memory emp = employees[sender][employeeId];
        require(sender == emp.identifier, "UnAuthorized call");
        employees[sender][employeeId].saveForMe = value;

        return true;
    }

    /**@dev Employers pay employees
     * Employees addition are not accepted at this point. 
     * Prior to this call, employer should use { disableOrEnableEmployee } to filter ones that should not be paid
     * Note: pay() is atomic by context i.e transfer to all employees must pass simultaneously.
     *      Employers should ensure enough allowance is given to cover the pays.
     */
    function pay(uint employeeId, bool acceptSaveForMe) 
        public 
        validateEmployeeId(employeeId, _msgSender())
        returns(bool) 
    {
        address sender = _msgSender();
        uint allowance = IERC20(cUSD).allowance(sender, address(this));
        EmployeePayload[] memory plds = employees[sender];

        for(uint i = 0; i < plds.length; i++) {
            EmployeePayload memory pld = plds[i];
            if(!pld.saveForMe) {
            }
            if(pld.saveForMe) {
                employees[sender][employeeId].pay += (pld.pay + ((pld.pay * pld.saveForMeRate) / 100));
            }
        }
    }

}