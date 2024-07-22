import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AcceptOrRejectLoan, AdvanceRequestStatus, Callback, EmployeePayload, LoanOrAdvanceStr, LoanRequestStatus, TxType } from "@/contractApis/readContract";
import { bn, INPUT_CLASSNAME, inputStyle } from "../utilities";
import { useAccount, useConfig } from "wagmi";
import { approveLoanOrAdvanceRequest } from "@/contractApis/approveLoanOrAdvanceRequest";
import { formatAddr } from "@/contractApis/contractAddress";
import TextField from "@mui/material/TextField";
import { SectionButton, SectionContainer } from "../common/SectionContainer";

export default function ApproveLoanOrAdvanceRequest({payload : pl, callback} : {payload: EmployeePayload, callback: Callback}) {
    const { address, isConnected } = useAccount();
    const config = useConfig();
    const [amortizationRate, setRate] = React.useState<string>('0');
    const [interestRate, setInterestRate] = React.useState<string>('0');

    const sendRequest = async(acceptOrRejectStr: AcceptOrRejectLoan, loanOrAdvanceStr: LoanOrAdvanceStr) => {
        if(!isConnected) return null;
        const isLoan = loanOrAdvanceStr === "LOAN";
        try {
            await approveLoanOrAdvanceRequest({
                account: formatAddr(address),
                callback,
                employeeId: pl.workId,
                config,
                amortizationRate: bn(amortizationRate).toNumber(),
                interestRate: bn(interestRate).toNumber(),
                acceptOrRejectStr,
                amount: isLoan? pl.loanReq.amount : pl.advanceReq.amount,
                employeeAddr: pl.identifier,
                txType: TxType.LOAN
            });
        } catch (error: any) {
            console.log("Error: ", error?.message || error?.data?.message);
        }
    }

    return(
        <SectionContainer sectionId='Approve' title='Approve loan request'>
            <Stack className='place-items-start p-4 text-white space-y-4'>
                <div className='w-full flex justify-between items-center'>
                    <Typography variant='body2'>Advance</Typography>
                    <Typography variant='body2'>{`${pl.advanceReq.amount.toString() === '0'? 'No Request' : pl.advanceReq.amount.toString()}`}</Typography>
                </div>
                <div className='w-full flex justify-between items-center'>
                    <Typography variant='body2'>Loan</Typography>
                    <Typography variant='body2'>{`${pl.loanReq.amount.toString() === '0'? 'No Request' : pl.loanReq.amount.toString()}`}</Typography>
                </div>

            </Stack>
            <Stack className='place-items-start p-4 text-white space-y-4'>
                <div className='w-full bg-white rounded p-2'>
                    <div className='flex justify-between items-center text-wood text-sm'>
                        <h3>Amortization Rate</h3>
                        <h3>{amortizationRate}</h3>
                    </div>
                    <div className='flex justify-between items-center text-wood text-sm'>
                        <h3>Interest Rate</h3>
                        <h3>{interestRate}</h3>
                    </div>
                </div>
                <Stack spacing={2}>
                    <input
                        className={INPUT_CLASSNAME}
                        type="number"
                        placeholder="0"
                        required
                        id="Amortization"
                        name="Amortization in %"
                        onChange={(event) => {
                            event.preventDefault();
                            setRate(event.currentTarget.value);
                        }}
                    />
                    <input
                        className={INPUT_CLASSNAME}
                        type="number"
                        placeholder="0"
                        required
                        id="InterestRate"
                        name="Interest Rate"
                        onChange={(event) => {
                            event.preventDefault();
                            setInterestRate(event.currentTarget.value);
                        }}
                    />
                </Stack>
                
                <div className='space-y-2'>
                    <SectionButton buttonText='Approve Loan' disableButton={bn(pl.loanReq.amount).isZero() || !(pl.loanReq.status === LoanRequestStatus.REQUESTED)} handleClick={async() => sendRequest("ACCEPTED", "LOAN")}/>
                    <SectionButton buttonText='Approve advance' disableButton={bn(pl.advanceReq.amount).isZero() || pl.advanceReq.status === AdvanceRequestStatus.DISBURSED} handleClick={async() => sendRequest("REJECTED", "ADVANCE")}/>
                </div>
            </Stack>
        </SectionContainer>
    );
}
