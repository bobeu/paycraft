import React from "react";
import Box from "@mui/material/Box";
import { AdvanceRequestStatus, Callback, EmployeePayload, LoanOrAdvanceStr, LoanRequestStatus, LoanStatus } from "@/contractApis/readContract";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import { bn, toBigInt } from "../utilities";
import { requestAdvanceOrLoan } from "@/contractApis/requestAdvanceOrLoan";
import { useAccount, useConfig } from "wagmi";
import { formatAddr } from "@/contractApis/contractAddress";

export default function RequestLoan({payload : pl, callback} : {payload: EmployeePayload, callback: Callback}) {
    const loanCondition = bn(pl.loanReq.amount).isZero() || (pl.loanReq.status === LoanRequestStatus.NONE || pl.loanReq.status === LoanRequestStatus.SERVICED);
    const advanceCondition = bn(pl.advanceReq.amount).isZero() || (pl.advanceReq.status === AdvanceRequestStatus.NONE || pl.advanceReq.status === AdvanceRequestStatus.SERVICED);
    const [loan, setLoan] = React.useState<string>('0');
    const [advance, setAdvance] = React.useState<string>('0');

    const { address, isConnected } = useAccount();
    const config = useConfig();

    const sendRequest = async(loanOrAdvanceStr: LoanOrAdvanceStr, value: string) => {
        if(!isConnected) return null;
        await requestAdvanceOrLoan({
            account: formatAddr(address),
            config,
            amount: bn(value).toNumber(),
            callback,
            employerAddr: pl.employer,
            employeeId: pl.workId,
            loanOrAdvanceStr
        })
    }

    return(
        <section id="Request Loan" >  
            <div style={{
                padding: "22px", 
                borderRadius: '6px',
                border: "1px solid green",
                height: "100%"
            }}>
                <div style={{marginBottom: '12px',}}
                >
                    <Box sx={{display: "flex",justifyContent: "start", alignItems: "center"}}>
                        <Button variant="outlined" sx={{width: "fit-content"}}><Typography variant="h6">Request loan</Typography></Button>
                    </Box>

                    <div style={{ display: "flex", flexDirection: "column", gap: '8px', justifyContent: "center", padding: '18px'}}>
                        <Button variant="text">{loan}</Button>
                        <Box sx={{display: "flex", justifyContent: "space-between"}}>
                            <TextField 
                                type="number"
                                placeholder="500"
                                required
                                label="Enter loan amount"
                                title="Request loan"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setLoan(event.currentTarget.value);
                                }}
                            />
                        </Box>
                    </div>
                    <div style={{width: "100%"}}>
                        <Button 
                            disabled={!loanCondition || loan === '0' || loan === ''} 
                            size="medium" 
                            variant="outlined" 
                            sx={{width: "100%"}}
                            onClick={async() => await sendRequest("LOAN", loan)}
                        >
                            Request
                        </Button>
                    </div>
                </div>
                <Divider />
                {/* Advances */}
                <div style={{
                        marginTop: '12px',
                    }}
                >
                    <Box sx={{display: "flex",justifyContent: "start", alignItems: "center"}}>
                        <Button variant="outlined" sx={{width: "fit-content"}}><Typography variant="h6">Request Advance</Typography></Button>
                    </Box>

                    <div style={{ display: "flex", flexDirection: "column", gap: '8px', justifyContent: "center", padding: '18px'}}>
                        <Button variant="text">{advance}</Button>
                        <Box sx={{display: "flex", justifyContent: "space-between"}}>
                            <TextField 
                                type="number"
                                placeholder="500"
                                required
                                label="Enter advance amount"
                                title="Request loan"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setAdvance(event.currentTarget.value);
                                }}
                            />
                        </Box>
                        
                    </div>
                    <div style={{width: "100%"}}>
                        <Button 
                            disabled={!advanceCondition || advance === '0' || advance === ''} 
                            size="medium" 
                            variant="outlined" 
                            sx={{width: "100%"}}
                            onClick={async() => await sendRequest("ADVANCE", advance)}
                        >
                            Request
                        </Button>
                    </div>
                </div>

            </div>
        </section>
    );
}
