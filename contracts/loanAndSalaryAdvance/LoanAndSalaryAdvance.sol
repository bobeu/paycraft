// SPDX-License-Identifier: MIT 

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ILoanAndSalaryAdvance } from "./ILoanAndSalaryAdvance.sol";

interface IERC20 {
    function decimals() external view returns(uint8);
    function balanceOf(address _of) external view returns(uint256);
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

    // mapping (address => EmployeePayload[]) public employees;
    mapping (address => mapping (address => bool)) private isAdded;

    mapping (address => PendingPayment) private pendingPayments;

    EmployeePayload[] private employees;

    modifier validateEmployeeId(uint employeeId, address employer) {
        require(employeeId < employees.length, "Invalid employeeId");
        require(employees[employeeId].employer == employer, "Not an employer of employeeId");
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

    function _amortize(uint employeeId, EmployeePayload memory pld) internal returns(uint payBalance) {
        uint loanBal = pld.loanReq.amount;
        if(loanBal > 0) {
            pld.loanReq.amortizationAmt <= loanBal? 
                (loanBal -= pld.loanReq.amortizationAmt, payBalance = pld.pay - pld.loanReq.amortizationAmt) : 
                    (loanBal -= loanBal, payBalance = pld.pay - loanBal);
            employees[employeeId].loanReq.amount = loanBal;
            if(loanBal == 0) {
                employees[employeeId].loanReq.status = LoanStatus.SERVICED;
            }
        }

        loanBal = pld.advanceReq.amount;
        if(loanBal > 0) {
            pld.advanceReq.amortizationAmt <= loanBal? 
                (loanBal -= pld.advanceReq.amortizationAmt, payBalance = pld.pay - pld.advanceReq.amortizationAmt) : 
                    (loanBal -= loanBal, payBalance = pld.pay - loanBal);
            employees[employeeId].advanceReq.amount = loanBal;
            if(loanBal == 0) {
                employees[employeeId].advanceReq.status = LoanStatus.SERVICED;
            }
        }
    }
    
    function addEmployee(address employee, uint256 payment, uint8 saveForMeRate) public returns(bool done) {
        address sender = _msgSender();
        require(employee != address(0), "Addresses is empty");
        // require(employee != sender, "Employer is the employer");
        if(!isAdded[sender][employee]) {
            isAdded[sender][employee] = true;
            employees.push(EmployeePayload(employee, sender, employees.length, true, false, payment, saveForMeRate, 0, AdvanceRequest(0, 0, LoanStatus(0)), LoanRequest(0, 0, 0, LoanStatus(0))));
        } else {
            revert("Employee exist");
        }
        return done;
    }

    function disableOrEnableEmployee(uint employeeId, bool value) 
        public 
        validateEmployeeId(employeeId, _msgSender()) 
        returns(bool) 
    {
        EmployeePayload memory pld = employees[employeeId];
        if(value) {
            require(!pld.active, "Enabled");
        } else {
            require(pld.active, "Disabled");
        }

        employees[employeeId].active = value;
        return true;
    }

    function requestAdvanceOrLoan(address employerAddr, uint employeeId, uint24 amount, string memory loanOrAdvanceStr) 
        public 
        validateEmployeeId(employeeId, employerAddr) 
        returns(bool) 
    {
        EmployeePayload memory pld = employees[employeeId];
        string memory errorMessage = "You have pending request";
        bool condition;
        uint amount_ = amount * (10 ** IERC20(cUSD).decimals());
        if(_toHash(loanOrAdvanceStr) == ADVANCE_HASH) {
            condition = pld.advanceReq.status == LoanStatus.NONE || pld.advanceReq.status == LoanStatus.SERVICED;
            require(amount_ <= pld.pay, "Advance cannot exceed Salary");
            employees[employeeId].advanceReq = AdvanceRequest(amount_, 0, LoanStatus.REQUESTED);
        } else if(_toHash(loanOrAdvanceStr) == LOAN_HASH) {
            condition = pld.loanReq.status == LoanStatus.NONE || pld.loanReq.status == LoanStatus.SERVICED;
            errorMessage = "You have pending loan request";
            employees[employeeId].loanReq = LoanRequest(amount_, 0, 0, LoanStatus.REQUESTED);
        } else {
            revert(loanOrAdvanceStr);
        }
        require(condition, errorMessage);

        return true;
    }

    function preparePaymentRequest(uint employeeId, uint8 txType) 
        public 
        validateEmployeeId(employeeId, _msgSender())
        returns(bool) 
    {
        require(txType < 3, "Invalid txn type");
        EmployeePayload memory pld = employees[employeeId];
        pendingPayments[_msgSender()] = PendingPayment(
            employees[employeeId],
            TxType(txType), 
            IERC20(cUSD).balanceOf(pld.identifier),
            uint64(block.timestamp)
        );
        return true;
    }

    function approveLoanOrAdvanceRequest(uint8 interestRate, uint8 amortizationRate, string memory acceptOrRejectStr) 
        public 
        returns(bool) 
    {
        PendingPayment memory pdp = pendingPayments[_msgSender()];
        bool isLoan = pdp.payload.loanReq.amount > 0;
        require(pdp.txType == TxType.LOAN, "Invalid Transaction");
        require(isLoan? pdp.payload.loanReq.status == LoanStatus.REQUESTED : pdp.payload.advanceReq.status == LoanStatus.REQUESTED, "Invalid request");
        uint interest = pdp.payload.loanReq.amount > 0? (pdp.payload.loanReq.amount * interestRate) / 100 : 0;
        if(_toHash(acceptOrRejectStr) == ACCEPTED_HASH) {
            uint amortizationAmt;
            require(IERC20(cUSD).balanceOf(pdp.payload.identifier) >= (pdp.snapshotBal + (isLoan? pdp.payload.loanReq.amount : pdp.payload.advanceReq.amount)), "Balances anomally");
            if(isLoan) {
                amortizationAmt = ((pdp.payload.loanReq.amount + interest) * amortizationRate) / 100;
                employees[pdp.payload.workId].loanReq = LoanRequest(
                    pdp.payload.loanReq.amount + interest,
                    interest,
                    amortizationAmt,
                    LoanStatus.DISBURSED
                );
            } else {
                amortizationAmt = (pdp.payload.advanceReq.amount * amortizationRate) / 100;
                employees[pdp.payload.workId].advanceReq = AdvanceRequest(pdp.payload.advanceReq.amount, amortizationAmt, LoanStatus.DISBURSED);
            }
            require(amortizationAmt <= pdp.payload.pay, "Amortization exceeds pay");
        } else {
            isLoan? delete employees[pdp.payload.workId].loanReq : delete employees[pdp.payload.workId].advanceReq; 
        }

        return true;
    }

    function save4Me(address employerAddr, uint employeeId, bool value)
        public
        validateEmployeeId(employeeId, employerAddr) 
        returns(bool) 
    {
        address sender = _msgSender();
        EmployeePayload memory emp = employees[employeeId];
        require(sender == emp.identifier, "UnAuthorized call");
        employees[employeeId].saveForMe = value;

        return true;
    }

    /**@dev Employers pay employees
     * Employees addition are not accepted at this point. 
     * Prior to this call, employer should use { disableOrEnableEmployee } to filter ones that should not be paid
     * 
     * Note: Employer should send an ammount correspond to cUSD balance to cover the expected payment range.
     */
       function confirmPayment() public returns(bool) 
    {
        PendingPayment memory pdp = pendingPayments[_msgSender()];
        uint pay = _amortize(pdp.payload.workId, pdp.payload);
        if(!pdp.payload.saveForMe) {
            require(IERC20(cUSD).balanceOf(pdp.payload.identifier) >= (pdp.snapshotBal + pdp.payload.pay), "Balances anomally"); 
        } else {
            employees[pdp.payload.workId].pay = (pay + ((pay * pdp.payload.saveForMeRate) / 100)); 
        }
        
        return true;
    }

    function getEmployees() public view returns(EmployeePayload[] memory _returnData) {
        _returnData = employees;
        return _returnData;
    }
}