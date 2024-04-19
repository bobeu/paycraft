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
import Stack from "@mui/material/Stack";
import { bn, toBigInt } from "../utilities";

export default function AddEmployee({callback} : {callback: Callback}) {
    const [employee, setAdress] = React.useState<string>(`0x`);
    const [payment, setPayment] = React.useState<string>('0');
    const [saveForMeRate, setSaveForMeRate] = React.useState<string>('0');

    const { address, isConnected } = useAccount();
    const config = useConfig();

    const sendRequest = async() => {
        if(!isConnected) return null;
        await addEmployee({
            account: formatAddr(address),
            config,
            callback,
            // amortizationRate: bn(amortizationRate).toNumber(),
            employeeAddr: formatAddr(employee),
            payment: toBigInt(payment),
            saveForMeRate: bn(saveForMeRate).toNumber()
        });
    }

    return(
        <section id="Add Employee" >
            <div style={{
                padding: "22px",
                borderRadius: '6px',
                border: "1px solid green",
                height: "100%"
            }}>
                <div style={{marginBottom: '12px',}}>
                    <Box sx={{display: "flex",justifyContent: "start", alignItems: "center"}}>
                        <Button variant="outlined" sx={{width: "fit-content"}}><Typography variant="h6">Add Employee</Typography></Button>
                    </Box>

                    <div style={{ display: "flex", flexDirection: "column", gap: '8px',justifyContent: "center", padding: '18px'}}>
                        <Typography >{employee}</Typography>
                        <Box sx={{display: 'flex', justifyContent:'space-around'}}>
                            {/* <Typography >{amortizationRate}</Typography> */}
                            <Typography >{payment}</Typography>
                            <Typography >{saveForMeRate}</Typography>
                        </Box>
                        <Stack spacing={3} sx={{ width: '100%' }}>
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
                                placeholder="Employee salary or wage"
                                label="Payment"
                                required
                                title="Payment"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setPayment(event.currentTarget.value);
                                }}
                            />
                            {/* <TextField
                                type="number"
                                placeholder="0"
                                // required
                                label="Amortization"
                                title="Amortization in %"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setRate(event.currentTarget.value);
                                }}
                            /> */}
                            <TextField
                                type="number"
                                placeholder="0"
                                // required
                                label="Save4Me"
                                title="Save4MeRate"
                                onChange={(event) => {
                                    event.preventDefault();
                                    setSaveForMeRate(event.currentTarget.value);
                                }}
                            />
                        </Stack>
                    </div>
                    <Divider />
                    <div style={{width: "100%"}}>
                        <Button
                            disabled={(!employee || employee === '0x') || (!payment || payment === '0')}
                            size="medium"
                            variant="outlined"
                            sx={{width: "100%"}}
                            onClick={sendRequest}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
