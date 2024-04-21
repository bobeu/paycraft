import React from "react";
import Box from "@mui/material/Box";
import { Callback } from "@/contractApis/readContract";
import { useAccount, useConfig, useClient } from "wagmi";
import { addEmployee } from "@/contractApis/addEmployee";
import { formatAddr } from "@/contractApis/contractAddress";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { bn, toBigInt } from "../utilities";
import { SocialConnect } from "../socialConnect";
// import { WalletClient } from "viem";

export default function AddEmployee({callback} : {callback: Callback}) {
    const [phoneNumber, setPhoneNumber] = React.useState<string>(`+234`);
    const [payment, setPayment] = React.useState<string>('0');
    const [saveForMeRate, setSaveForMeRate] = React.useState<string>('0');

    const { address, isConnected } = useAccount();
    const config = useConfig();
    
    const sendRequest = async() => {
        // const sc = new SocialConnect();
        // const obfuscatedIdentifier = await sc.lookup(phoneNumber);
        // console.log("obfuscatedIdentifier", obfuscatedIdentifier)
        if(!isConnected) return null;
        await addEmployee({
            account: formatAddr(address),
            config,
            callback,
            employeeAddr: formatAddr(address),
            // employeeAddr: formatAddr(obfuscatedIdentifier.accounts),
            payment: toBigInt(payment),
            saveForMeRate: bn(saveForMeRate).toNumber()
        });
    }

    return(
        <section id="Add Employee" >
            <div style={{
                padding: "12px",
                borderRadius: '6px',
                borderBottom: "0.7em solid #48ff96",
                background: "rgba(255, 253, 255, 0.9)",
                height: "100%"
            }}>
                <div style={{marginBottom: '12px',}}>
                    <Box sx={{display: "flex",justifyContent: "start", alignItems: "center"}}>
                        <Button disabled variant="text" sx={{width: "fit-content", }}><Typography sx={{color: "#48ff96"}} variant="body2">Add Employee</Typography></Button>
                    </Box>

                    <div style={{ display: "flex", flexDirection: "column", gap: '8px',justifyContent: "center", padding: '18px'}}>
                        <Typography variant="caption" sx={{color: "#48ff96"}}>{phoneNumber}</Typography>
                        <Box sx={{display: 'flex', justifyContent:'space-around'}}>
                            {/* <Typography >{amortizationRate}</Typography> */}
                            <Typography variant="caption" sx={{color: "#48ff96"}}>{payment}</Typography>
                            <Typography variant="caption" sx={{color: "#48ff96"}}>{saveForMeRate}</Typography>
                        </Box>
                        <Box sx={{ width: '100%' }}>
                            <Stack spacing={3} >
                                <TextField
                                    type="tel"
                                    placeholder="+234..."
                                    // sx={{width: "20%"}}
                                    required
                                    label="PhoneNumber"
                                    title="Enter employee phone number"
                                    onChange={(event) => {
                                        event.preventDefault();
                                        setPhoneNumber(event.currentTarget.value);
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

                                <Button
                                    disabled={(!phoneNumber || phoneNumber === '+234') || (!payment || payment === '0')}
                                    // size="medium"
                                    variant="contained"
                                    style={{width: "100%", color: "whitesmoke", background: "brown"}}
                                    onClick={sendRequest}
                                >
                                    Add
                                </Button>
                            </Stack>
                        </Box>
                    </div>
                    <div style={{width: "100%"}}>
                    </div>
                </div>
            </div>
        </section>
    );
}
