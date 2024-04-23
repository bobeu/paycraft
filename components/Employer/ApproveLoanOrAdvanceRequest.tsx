import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AcceptOrRejectLoan, AdvanceRequestStatus, Callback, EmployeePayload, LoanOrAdvanceStr, LoanRequestStatus, TxType } from "@/contractApis/readContract";
import { bn, inputStyle } from "../utilities";
import { useAccount, useConfig } from "wagmi";
import { approveLoanOrAdvanceRequest } from "@/contractApis/approveLoanOrAdvanceRequest";
import { formatAddr } from "@/contractApis/contractAddress";
import TextField from "@mui/material/TextField";

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
        <section id="Approve">
            <div style={{
                padding: "22px",
                borderRadius: '6px',
                borderBottom: "0.7rem solid #8ECDDD",
                background: "#22668D",
                height: "100%"
            }}>
                <div style={{display: "flex", flexDirection: 'column',}}>
                    <Stack spacing={2} sx={{width : "100%", mb: 4}}>
                        <Button variant="text" sx={{width: {xs: "100%"}, color: "white"}}><Typography variant="body1">Approve loan request</Typography></Button>
                        <Button 
                            variant="outlined"
                            sx={{width: "100%", color: "#8ECDDD"}}
                            startIcon={"Advance request"}
                            endIcon={pl.advanceReq.amount.toString()}
                        />
                        <Button 
                            variant="outlined"
                            sx={{width: "100%", color: "#8ECDDD"}}
                            startIcon={"Loan request"}
                            endIcon={pl.loanReq.amount.toString()}
                        />
                    </Stack>
                    <Stack spacing={0} sx={{ width: '100%' }}>
                        <Box sx={{marginY: "6px", }} >
                            <Button 
                                disabled
                                variant="outlined"
                                sx={{width: {xs: "100%", md: "50%", color: "#8ECDDD"}}}
                                startIcon={"Amortization Rate"}
                                endIcon={amortizationRate}
                            />
                            <Button 
                                disabled
                                variant="outlined"
                                sx={{width: {xs: "100%", md: "50%", color: "#8ECDDD"}, color: "white"}}
                                startIcon={"Interest Rate"}
                                endIcon={interestRate}
                            />
                        </Box>
                        <Stack spacing={3} sx={{ width: '100%' }}>
                            <input
                                style={inputStyle}
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
                                style={inputStyle}
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
                        
                        <div style={{marginTop: "12px"}}>
                            <Button 
                                sx={{width: {xs: "100%", md: "50%"}, background: "#FFCC70", color: "#22668D"}} 
                                variant="contained" 
                                disabled={bn(pl.loanReq.amount).isZero() || !(pl.loanReq.status === LoanRequestStatus.REQUESTED)} 
                                onClick={async() => sendRequest("ACCEPTED", "LOAN")}
                            >
                                Aprrove loan
                            </Button>
                            <Button 
                                sx={{width: {xs: "100%", md: "50%"}, background: "#FFCC70", color: "#22668D"}}
                                variant="contained" 
                                disabled={bn(pl.advanceReq.amount).isZero() || pl.advanceReq.status === AdvanceRequestStatus.DISBURSED}
                                onClick={async() => sendRequest("REJECTED", "ADVANCE")}
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
