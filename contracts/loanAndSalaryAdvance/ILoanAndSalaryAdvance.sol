// SPDX-License-Identifier: MIT 

pragma solidity 0.8.20;

interface ILoanAndSalaryAdvance {
    error TransferFromFailed();
    enum TxType {NONE, LOAN, SALARYPAY}
    enum LoanStatus {NONE, REQUESTED, DISBURSED, SERVICED}
    struct EmployeePayload {
        address identifier;
        address employer;
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
        LoanStatus status;
    }

    struct LoanRequest {
        uint amount;
        uint interest;
        uint amortizationAmt;
        LoanStatus status;
    }

    struct PendingPayment {
        EmployeePayload payload;
        TxType txType;
        uint snapshotBal;
        uint64 callTime;
    }

}