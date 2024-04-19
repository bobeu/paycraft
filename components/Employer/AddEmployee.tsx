import React from "react";
import Box from "@mui/material/Box";
import { Callback, EmployeePayload } from "@/contractApis/readContract";
import { useAccount, useConfig } from "wagmi";
import { addEmployee } from "@/contractApis/addEmployee";
import { OxString, formatAddr } from "@/contractApis/contractAddress";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

export default function AddEmployee({selectedData, callback} : {selectedData: EmployeePayload, callback: Callback}) {
    // const loanCondition = bn(sem.loanReq.amount).isZero() || (sem.loanReq.status === LoanRequestStatus.NONE || sem.loanReq.status === LoanRequestStatus.SERVICED);
    // const advanceCondition = bn(sem.advanceReq.amount).isZero() || (sem.advanceReq.status === AdvanceRequestStatus.NONE || sem.advanceReq.status === AdvanceRequestStatus.SERVICED);
    const [amortizationRate, setRate] = React.useState<string>('0');
    const [employee, setAdress] = React.useState<string>(`0x`);
    const [payment, setPayment] = React.useState<string>('0');
    const [saveForMeRate, setSaveForMeRate] = React.useState<string>('0');

    const { address, isConnected } = useAccount();
    const config = useConfig();

    const sendRequest = async(value: string) => {
        if(!isConnected) return null;
        await addEmployee({
            account: formatAddr(address),
            config,
            callback,
            amortizationRate,
            employeeAddrs,
            payments,
            saveForMeRate            
        })
    }

    return(
        <section id="Add Employee" >  
            <div style={{
                padding: "22px", 
                borderRadius: '6px',
                border: "1px solid green",
                height: "100%"
            }}>
                <div style={{
                        marginBottom: '12px',
                    }}
                >
                    <Box sx={{display: "flex",justifyContent: "start", alignItems: "center"}}>
                        <Button variant="outlined" sx={{width: "50%"}}><Typography variant="h5">Add Employee</Typography></Button>
                    </Box>

                    <div style={{ display: "flex", flexDirection: "column", gap: '8px', justifyContent: "center", padding: '18px'}}>
                        <Box sx={{maxHeight: "50px", overflow: "auto"}}>
                            <Typography >{employee}</Typography>
                            <Typography >{amortizationRate}</Typography>
                            <Typography >{payment}</Typography>
                            <Typography >{saveForMeRate}</Typography>
                        </Box>
                        <Box sx={{display: "flex", justifyContent: "space-between"}}>
                            <TextField 
                                type="text"
                                placeholder="0x..."
                                required
                                label="Employee"
                                title="Enter employee address"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setAdress(event.currentTarget.value);
                                }}
                            />
                            <TextField 
                                type="number"
                                placeholder="Amount employee will pay in %"
                                label="Amortization"
                                title="Amortization rate"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setRate(event.currentTarget.value);
                                }}
                            />
                            <TextField 
                                type="text"
                                placeholder="0x..."
                                required
                                label="Employee"
                                title="Enter employee address"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setAdress(event.currentTarget.value);
                                }}
                            />
                            <TextField 
                                type="text"
                                placeholder="0x..."
                                required
                                label="Employee"
                                title="Enter employee address"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setAdress(event.currentTarget.value);
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
                        <Button variant="outlined" sx={{width: "50%"}}><Typography variant="h5">Request Advance</Typography></Button>
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
