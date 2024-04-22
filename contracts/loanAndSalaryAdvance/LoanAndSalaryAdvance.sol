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

    mapping (address => PendingPayment) private pendingPayment;

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
                employees[employeeId].loanReq.status = LoanRequestStatus.SERVICED;
            }
        }

        loanBal = pld.advanceReq.amount;
        if(loanBal > 0) {
            pld.advanceReq.amortizationAmt <= loanBal? 
                (loanBal -= pld.advanceReq.amortizationAmt, payBalance = pld.pay - pld.advanceReq.amortizationAmt) : 
                    (loanBal -= loanBal, payBalance = pld.pay - loanBal);
            employees[employeeId].advanceReq.amount = loanBal;
            if(loanBal == 0) {
                employees[employeeId].advanceReq.status = AdvanceRequestStatus.SERVICED;
            }
        }
    }
    
    function addEmployee(address employee, uint256 payment, uint8 saveForMeRate) public returns(bool done) {
        address sender = _msgSender();
        require(employee != address(0), "Addresses is empty");
        // require(employee != sender, "Employer is the employer");
        if(!isAdded[sender][employee]) {
            isAdded[sender][employee] = true;
            employees.push(EmployeePayload( employee, sender, employees.length, true, false, payment, saveForMeRate, 0, AdvanceRequest(0, 0, AdvanceRequestStatus(0)), LoanRequest(0, 0, 0, LoanRequestStatus(0))));
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
            condition = pld.advanceReq.status == AdvanceRequestStatus.NONE || pld.advanceReq.status == AdvanceRequestStatus.SERVICED;
            require(amount_ <= pld.pay, "Advance cannot exceed Salary");
            employees[employeeId].advanceReq = AdvanceRequest(amount_, 0, AdvanceRequestStatus.PENDING);
        } else if(_toHash(loanOrAdvanceStr) == LOAN_HASH) {
            condition = pld.loanReq.status == LoanRequestStatus.NONE || pld.loanReq.status == LoanRequestStatus.SERVICED;
            errorMessage = "You have pending loan request";
            employees[employeeId].loanReq = LoanRequest(amount_, 0, 0, LoanRequestStatus.REQUESTED);
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
        EmployeePayload memory pld = employees[employeeId];
        require(pld.active, "Disabled");
        uint allowance = IERC20(cUSD).allowance(sender, address(this));
        uint interest = (allowance * interestRate) / 100;
        uint amortizationAmt = ((allowance + interest) * amortizationRate) / 100;
        require(amortizationAmt <= pld.pay, "Amortization exceeds pay");
        if(_toHash(loanOrAdvanceStr) == ADVANCE_HASH) {
            require(pld.advanceReq.status == AdvanceRequestStatus.PENDING, "Invalid request");
            employees[employeeId].advanceReq = AdvanceRequest(allowance, amortizationAmt, AdvanceRequestStatus.DISBURSED);
            _sendPayment(sender, pld.identifier, allowance);
        } else if(_toHash(loanOrAdvanceStr) == LOAN_HASH) {
            require(pld.loanReq.status == LoanRequestStatus.REQUESTED, "Invalid request");
            employees[employeeId].loanReq = LoanRequest(
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
        EmployeePayload memory emp = employees[employeeId];
        uint allowance = IERC20(cUSD).allowance(employerAddr, address(this));
        require(sender == emp.identifier, "UnAuthorized call");
        if(allowance > 0) {
            if(_toHash(acceptOrRejectStr) == ACCEPTED_HASH) {
                employees[employeeId].loanReq.status = LoanRequestStatus.ACCEPTED;
                _sendPayment(employerAddr, emp.identifier, allowance);
            } else if(_toHash(acceptOrRejectStr) == REJECTED_HASH) {
                delete employees[employeeId].loanReq;
            } else {
                revert (acceptOrRejectStr);
            }
        } else {
            delete employees[employeeId].loanReq;
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
     * Note: pay() is atomic by context i.e transfer to all employees must pass simultaneously.
     *      Employers should ensure enough allowance is given to cover the pays.
     * 
     * Note: Employers can select the range of empployees to pay. This is done using the { start } and { stop } flags.
     *       These flags neither can exceed the number of employees in storage nor can start eceeds stop.
     * @param employeeId : Id assigned to employee at registration point. It corresponds to their position in the EmployeePayload array.
     * @param acceptSaveForMe : Employer should specify if they're willing to save for employees by holding their pay in custody until otherwise canceled by the employee. 
     *                          This attracts interests compounded on the principal pay. 
     * Note: Employer should give enough allowance correspond to cUSD balance to cover the expected payment range.
     */
       function sendPayment(uint employeeId, bool acceptSaveForMe) 
        public 
        validateEmployeeId(employeeId, _msgSender())
        returns(bool) 
    {
        address sender = _msgSender();
        EmployeePayload memory pld = employees[employeeId]; 
        uint allowance = IERC20(cUSD).allowance(sender, address(this));
        uint pay = _amortize(employeeId, pld);
        require(allowance >= pay, "Not enough balance");
        if(!pld.saveForMe) {
            _sendPayment(sender, pld.identifier, pay);
        }
        if(pld.saveForMe && acceptSaveForMe) {
            employees[employeeId].pay = (pay + ((pay * pld.saveForMeRate) / 100));
        }
        
        return true;
    }

    function preparePayment(uint employeeId) 
        public 
        validateEmployeeId(employeeId, _msgSender())
        returns(bool) 
    {
        address sender = _msgSender();
        EmployeePayload memory pld = employees[employeeId];
        pendingPayment[sender] = PendingPayment(pld, IERC20(cUSD).balanceOf(pld.identifier), uint64(block.timestamp));
        // uint allowance = msg.value;
        // require(allowance >= pay, "Not enough balance");
        // uint pay = _amortize(employeeId, pld);
        // if(!pld.saveForMe) {
        //     _sendPayment(sender, pld.identifier, pay);
        // }
        // if(pld.saveForMe && acceptSaveForMe) {
        //     employees[employeeId].pay = (pay + ((pay * pld.saveForMeRate) / 100));
        // }
        
        return true;
    }

    function getEmployees() public view returns(EmployeePayload[] memory _returnData) {
        _returnData = employees;
        return _returnData;
    }
}