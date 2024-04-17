// SPDX-License-Identifier: MIT 

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ILoanAndSalaryAdvance } from "./ILoanAndSalaryAdvance.sol";

interface IERC20 {
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

pragma solidity 0.8.20;

contract LoanAndSalaryAdvance is Context, ILoanAndSalaryAdvance {
    address public immutable cUSD;
    bytes32 public immutable LOAN_HASH;
    bytes32 public immutable ADVANCE_HASH;
    bytes32 public immutable ACCEPTED_HASH;
    bytes32 public immutable REJECTED_HASH;

    mapping (address => EmployeePayload[]) public employees;
    mapping (address => mapping (address => bool)) private isAdded;

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

    function _sendPayment(address from, address to, uint amount) private {
        if(!IERC20(cUSD).transferFrom(from, to, amount)) revert TransferFromFailed();
    }

    function _amortize(address employerAddr, uint employeeId, EmployeePayload memory pld) internal returns(uint payBalance) {
        if(pld.loanReq.amount > 0) {
            uint loanBal = pld.loanReq.amount;
            pld.loanReq.amortizationAmt <= loanBal? 
                (loanBal -= pld.loanReq.amortizationAmt, payBalance = pld.pay - pld.loanReq.amortizationAmt) : 
                    (loanBal -= loanBal, payBalance = pld.pay - loanBal);
            employees[employerAddr][employeeId].loanReq.amount = loanBal;
            if(loanBal > 0) {
                employees[employerAddr][employeeId].loanReq.status = LoanRequestStatus.SERVICED;
            }
        }

        if(pld.advanceReq.amount > 0) {
            uint loanBal = pld.advanceReq.amount;
            pld.advanceReq.amortizationAmt <= loanBal? 
                (loanBal -= pld.advanceReq.amortizationAmt, payBalance = pld.pay - pld.advanceReq.amortizationAmt) : 
                    (loanBal -= loanBal, payBalance = pld.pay - loanBal);
            employees[employerAddr][employeeId].advanceReq.amount = loanBal;
            if(loanBal > 0) {
                employees[employerAddr][employeeId].advanceReq.status = AdvanceRequestStatus.SERVICED;
            }
        }
    }
    
    function addEmployee(address[] memory addresses, uint256[] memory payments, uint8 saveForMeRate, uint8 amortizationRate) public returns(bool done) {
        address sender = _msgSender();
        uint addressLength = addresses.length;
        require(addressLength == payments.length, "Addresses to payment mismatch");
        for(uint8 i = 0; i < addressLength; i++) {
            address addr = addresses[i];
            if(addr != address(0)) {
                if(!isAdded[sender][addr]) {
                    isAdded[sender][addr] = true;
                    employees[sender].push(EmployeePayload( addr, i, true, false, payments[i], saveForMeRate, amortizationRate, AdvanceRequest(0, 0, AdvanceRequestStatus(0)), LoanRequest(0, 0, 0, LoanRequestStatus(0))));
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
        employees[sender][employeeId].active = value;

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
            condition = pld.advanceReq.status == AdvanceRequestStatus.NONE || pld.advanceReq.status == AdvanceRequestStatus.SERVICED;
            require(amount <= pld.pay, "Advance cannot exceed Salary");
            employees[employerAddr][employeeId].advanceReq = AdvanceRequest(amount, 0, AdvanceRequestStatus.PENDING);
        } else if(_toHash(loanOrAdvanceStr) == LOAN_HASH) {
            condition = pld.loanReq.status == LoanRequestStatus.NONE || pld.loanReq.status == LoanRequestStatus.SERVICED;
            errorMessage = "You have pending loan request";
            employees[employerAddr][employeeId].loanReq = LoanRequest(amount, 0, 0, LoanRequestStatus.REQUESTED);
        } else {
            revert(loanOrAdvanceStr);
        }
        require(condition, errorMessage);

        return true;
    }

    function approveLoanOrAdvanceRequest(uint employeeId, uint8 interestRate, uint8 amortizationRate, string memory loanOrAdvanceStr) 
        public 
        validateEmployeeId(employeeId, _msgSender()) 
        returns(bool) 
    {
        address sender = _msgSender();
        EmployeePayload memory pld = employees[sender][employeeId];
        require(pld.active, "Disabled");
        uint allowance = IERC20(cUSD).allowance(sender, address(this));
        uint interest = (allowance * interestRate) / 100;
        uint amortizationAmt = ((allowance + interest) * amortizationRate) / 100;
        require(amortizationAmt <= pld.pay, "Amortization exceeds pay");
        if(_toHash(loanOrAdvanceStr) == ADVANCE_HASH) {
            require(pld.advanceReq.status == AdvanceRequestStatus.PENDING, "Invalid request");
            employees[sender][employeeId].advanceReq = AdvanceRequest(allowance, amortizationAmt, AdvanceRequestStatus.DISBURSED);
            _sendPayment(sender, pld.identifier, allowance);
        } else if(_toHash(loanOrAdvanceStr) == LOAN_HASH) {
            require(pld.loanReq.status == LoanRequestStatus.REQUESTED, "Invalid request");
            employees[sender][employeeId].loanReq = LoanRequest(
                allowance + interest,
                interest,
                amortizationAmt,
                LoanRequestStatus.RESPONDED
            );
        } else {
            revert (loanOrAdvanceStr);
        }
        return true;
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
                _sendPayment(employerAddr, emp.identifier, allowance);
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
     * 
     * Note: Employers can select the range of empployees to pay. This is done using the { start } and { stop } flags.
     *       These flags neither can exceed the number of employees in storage nor can start eceeds stop.
     * @param employeeId : Id assigned to employee at registration point. It corresponds to their position in the EmployeePayload array.
     * @param acceptSaveForMe : Employer should specify if they're willing to save for employees by holding their pay in custody until otherwise canceled by the employee. 
     *                          This attracts interests compounded on the principal pay. 
     * @param start : The starting point precision to start payment.
     * @param stop : Position or index where payments should stop
     * 
     * Note: Employer should give enough allowance correspond to cUSD balance to cover the expected payment range.
     */
    function sendPayment(uint employeeId, bool acceptSaveForMe, uint start, uint stop) 
        public 
        validateEmployeeId(employeeId, _msgSender())
        returns(bool) 
    {
        address sender = _msgSender();
        EmployeePayload[] memory plds = employees[sender];
        require(start < stop && stop <= plds.length, "Invalid range selected");
        for(uint i = start > 0? start - 1 : start; i < stop; i++) {
            uint allowance = IERC20(cUSD).allowance(sender, address(this));
            EmployeePayload memory pld = plds[i];
            uint pay = _amortize(sender, i, pld);
            require(allowance >= pay, "Not enough balance");
            if(!pld.saveForMe) {
                _sendPayment(sender, pld.identifier, pay);
            }
            if(pld.saveForMe && acceptSaveForMe) {
                employees[sender][employeeId].pay += (pld.pay + ((pld.pay * pld.saveForMeRate) / 100));
            }
        }
        return true;
    }

    function getEmployees(address employerAddr) public view returns(EmployeePayload[] memory) {
        return employees[employerAddr];
    }
}