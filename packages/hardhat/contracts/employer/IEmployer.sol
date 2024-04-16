// SPDX-License-Identifier: MIT 

pragma solidity 0.8.19;

interface IEmployer {
    struct EmployeePayload {
        address identifier;
        // bytes name;
        uint workId;
        bool active;
        AdvanceRequest advanceReq;
        LoanRequest loanReq;
    }

    struct AdvanceRequest {
        uint amount;
    }

    struct LoanRequest {
        uint amount;
        uint interest;
    }
}