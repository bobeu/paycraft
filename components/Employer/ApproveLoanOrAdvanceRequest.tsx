import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AdvanceRequestStatus, Callback, EmployeePayload, LoanOrAdvanceStr, LoanRequestStatus } from "@/contractApis/readContract";
import { bn } from "../utilities";
import { useAccount, useConfig } from "wagmi";
import { approveLoanOrAdvanceRequest } from "@/contractApis/approveLoanOrAdvanceRequest";
import { formatAddr } from "@/contractApis/contractAddress";
import TextField from "@mui/material/TextField";

export default function ApproveLoanOrAdvanceRequest({payload : pl, callback} : {payload: EmployeePayload, callback: Callback}) {
    const { address, isConnected } = useAccount();
    const config = useConfig();
    const [amortizationRate, setRate] = React.useState<string>('0');
    const [interestRate, setInterestRate] = React.useState<string>('0');

    const sendRequest = async(loanOrAdvanceStr: LoanOrAdvanceStr) => {
        if(!isConnected) return null;
        await approveLoanOrAdvanceRequest({
            account: formatAddr(address),
            callback,
            employeeId: pl.workId,
            config,
            amortizationRate: bn(amortizationRate).toNumber(),
            interestRate: bn(interestRate).toNumber(),
            loanOrAdvanceStr
        });
    }
    return(
        <section id="Approve">
            <div style={{
                padding: "22px",
                borderRadius: '6px',
                border: "1px solid green",
                height: "100%"
            }}>
                <div style={{display: "flex", flexDirection: 'column', gap: "22px"}}>
                    <Box sx={{marginY: "6px", display: "flex", justifyContent: "space-between"}} >
                        <Button variant="outlined" sx={{width: "fit-content"}}><Typography variant="h6">Approve loan request</Typography></Button>
                        <Stack spacing={2} >
                            <Button 
                                sx={{width: "100%"}}
                                startIcon={"Advance request"}
                                endIcon={pl.advanceReq.amount.toString()}
                            />
                            <Button 
                                sx={{width: "100%"}}
                                startIcon={"Loan request"}
                                endIcon={pl.loanReq.amount.toString()}
                            />
                        </Stack>
                    </Box>
                    <Stack spacing={0} sx={{ width: '100%' }}>
                        {/* <Box sx={{marginY: "6px"}}>
                            <Typography variant="body2">{pl.identifier}</Typography>
                        </Box> */}
                        <Box sx={{marginY: "6px", display: "flex", justifyContent: "space-between"}} >
                            <Button 
                                sx={{width: "50%"}}
                                startIcon={"Amortization Rate"}
                                endIcon={amortizationRate}
                            />
                            <Button 
                                sx={{width: "50%"}}
                                startIcon={"Interest Rate"}
                                endIcon={interestRate}
                            />
                        </Box>
                        <Stack spacing={3} sx={{ width: '100%' }}>
                            <TextField
                                type="number"
                                placeholder="0"
                                required
                                label="Amortization"
                                title="Amortization in %"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setRate(event.currentTarget.value);
                                }}
                            />
                            <TextField
                                type="number"
                                placeholder="0"
                                required
                                label="InterestRate"
                                title="Interest Rate"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setInterestRate(event.currentTarget.value);
                                }}
                            />
                        </Stack>
                        
                        <div style={{marginTop: "12px"}}>
                            <Button 
                                sx={{width: "50%"}} 
                                variant="text" 
                                disabled={bn(pl.loanReq.amount).isZero() || !(pl.loanReq.status === LoanRequestStatus.REQUESTED)} 
                                onClick={async() => sendRequest("LOAN")}
                            >
                                Aprrove loan
                            </Button>
                            <Button 
                                sx={{width: "50%"}} 
                                variant="text" 
                                disabled={bn(pl.advanceReq.amount).isZero() || pl.advanceReq.status === AdvanceRequestStatus.DISBURSED}
                                onClick={async() => sendRequest("ADVANCE")}
                            >
                                Approve advance
                                </Button>
                        </div>
                    </Stack>
                </div>
            </div>
        </section>
    );
}
