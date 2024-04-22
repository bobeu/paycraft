import React from "react";
import Box from "@mui/material/Box";
import { AdvanceRequestStatus, Callback, EmployeePayload, LoanOrAdvanceStr, LoanRequestStatus, LoanStatus } from "@/contractApis/readContract";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { bn, inputStyle, toBigInt } from "../utilities";
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
        try {
            await requestAdvanceOrLoan({
                account: formatAddr(address),
                config,
                amount: bn(value).toNumber(),
                callback,
                employerAddr: pl.employer,
                employeeId: pl.workId,
                loanOrAdvanceStr
            })
        } catch (error: any) {
            console.log("Error: ", error?.message || error?.data?.message);
        }
    }

    return(
        <section id="Request Loan" >  
            <div style={{
                padding: "22px", 
                borderRadius: '6px',
                borderBottom: "0.7rem solid #8ECDDD",
                background: "#22668D",
                height: "100%"
            }}>
                <div style={{marginBottom: '12px',}}
                >
                    <Box sx={{display: "flex",justifyContent: "start", alignItems: "center"}}>
                        <Button variant="text" sx={{width: "fit-content", color: "white"}}><Typography variant="h6">Request loan</Typography></Button>
                    </Box>

                    <Box style={{padding: '12px'}}>
                        <Stack sx={{width :"100%", display: "flex", justifyContent: "center",alignItems: "center"}}>
                            <input 
                                style={inputStyle}
                                type="number"
                                placeholder="500"
                                required
                                id="Enter loan amount"
                                name="Request loan"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setLoan(event.currentTarget.value);
                                }}
                            />
                            <Button variant="text">{loan}</Button>
                            <Button 
                                disabled={!loanCondition || loan === '0' || loan === ''} 
                                size="medium" 
                                variant="contained" 
                                sx={{width: "100%",  background: "#FFCC70", color: "#22668D"}}
                                onClick={async() => await sendRequest("LOAN", loan)}
                            >
                                Request
                            </Button>
                        </Stack>
                    </Box>
                </div>
                {/* <Divider /> */}
                {/* Advances */}
                <div style={{
                        marginTop: '12px',
                    }}
                >
                    <Box sx={{display: "flex",justifyContent: "start", alignItems: "center"}}>
                        <Button variant="text" sx={{width: "fit-content", color: "white"}}><Typography variant="h6">Request Advance</Typography></Button>
                    </Box>

                    <Box style={{padding: '12px'}}>
                        <Stack sx={{width :"100%", display: "flex", justifyContent: "center",alignItems: "center"}}>
                            <input 
                                style={inputStyle}
                                type="number"
                                placeholder="500"
                                required
                                id="Enter advance amount"
                                name="Request loan"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setAdvance(event.currentTarget.value);
                                }}
                            />
                            <Button variant="text">{advance}</Button>
                            <Button 
                                disabled={!advanceCondition || advance === '0' || advance === ''} 
                                size="medium" 
                                variant="contained" 
                                sx={{width: "100%", background: "#FFCC70", color: "#22668D"}}
                                onClick={async() => await sendRequest("ADVANCE", advance)}
                            >
                                Request
                            </Button>
                        </Stack>
                    </Box>
                </div>
            </div>
        </section>
    );
}
