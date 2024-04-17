// SPDX-License-Identifier: MIT 

pragma solidity 0.8.20;

interface IEmployer {
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
        AdvanceRequest advanceReq;
        LoanRequest loanReq;
    }

    struct AdvanceRequest {
        uint amount;
        AdvanceRequestStatus status;
    }

    struct LoanRequest {
        uint amount;
        uint interest;
        LoanRequestStatus status;
    }

    struct EmployerInfo {
        bool isEmployer;
        uint id;
    }
}