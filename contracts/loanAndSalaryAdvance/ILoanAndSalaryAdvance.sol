// SPDX-License-Identifier: MIT 

pragma solidity 0.8.20;

interface ILoanAndSalaryAdvance {
    error TransferFromFailed();

    enum AdvanceRequestStatus {NONE, PENDING, DISBURSED, SERVICED}
    enum LoanRequestStatus {NONE, REQUESTED, RESPONDED, ACCEPTED, SERVICED}
    struct EmployeePayload {
        address identifier;
        uint workId;
        bool active;
        bool saveForMe;
        uint pay;
        uint8 saveForMeRate;
        uint8 amortizationRate;
        AdvanceRequest advanceReq;
        LoanRequest loanReq;
    }

    struct AdvanceRequest {
        uint amount;
        uint amortizationAmt;
        AdvanceRequestStatus status;
    }

    struct LoanRequest {
        uint amount;
        uint interest;
        uint amortizationAmt;
        LoanRequestStatus status;
    }

    struct EmployerInfo {
        bool isEmployer;
        uint id;
    }

    function sendPayment(uint employeeId, bool acceptSaveForMe, uint start, uint stop) external returns(bool);
    function save4Me(address employerAddr, uint employeeId, bool value) external returns(bool);
    function acceptOrRejectLoanApproval(address employerAddr, uint employeeId, string memory acceptOrRejectStr) external returns(bool);
    function approveLoanOrAdvanceRequest(uint employeeId, uint8 interestRate, uint8 amortizationRate, string memory loanOrAdvanceStr) external returns(bool);
    function requestAdvanceOrLoan(address employerAddr, uint employeeId, uint amount, string memory loanOrAdvanceStr) external returns(bool);
    function disableOrEnableEmployee(uint employeeId, bool value) external returns(bool);
    function addEmployee(address[] memory addresses, uint256[] memory payments, uint8 saveForMeRate, uint8 amortizationRate) external returns(bool done);
    
}