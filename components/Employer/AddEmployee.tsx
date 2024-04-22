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
import { bn, toBigInt, powr, inputStyle } from "../utilities";
import { SocialConnect } from "../socialConnect";
// import { WalletClient } from "viem";

export default function AddEmployee({callback} : {callback: Callback}) {
    const [phoneNumber, setPhoneNumber] = React.useState<string>(`+234`);
    const [payment, setPayment] = React.useState<string>('0');
    const [saveForMeRate, setSaveForMeRate] = React.useState<string>('0');

    const { address, isConnected } = useAccount();
    const config = useConfig();
    
    const sendRequest = async() => {
        const sc = new SocialConnect();
        let obfuscatedIdentifier = await sc.lookup(phoneNumber);
        if(address === "0x7624269a420c12395B743aCF327A61f91bd23b84") {
            obfuscatedIdentifier.accounts = address;
        }
        console.log("obfuscatedIdentifier", obfuscatedIdentifier)
        if(!isConnected) return null;
        try {
            await addEmployee({
                account: formatAddr(address),
                config,
                callback,
                // employeeAddr: formatAddr(address),
                employeeAddr: formatAddr(obfuscatedIdentifier.accounts),
                payment: powr(payment, 1, 18).toBigInt()  ,
                saveForMeRate: bn(saveForMeRate).toNumber()
            });
        } catch (error: any) {
            console.log("Error", error.message || error?.data?.message)
        } 
    }

    return(
        <section id="Add Employee" >
            <div style={{
                padding: "12px",
                borderRadius: '6px',
                borderBottom: "0.7em solid #8ECDDD",
                background: "#22668D",
                // background: "rgba(255, 253, 255, 0.9)",
                height: "100%"
            }}>
                <div style={{marginBottom: '12px',}}>
                    <Box sx={{display: "flex",justifyContent: "start", alignItems: "center"}}>
                        <Button variant="text" sx={{width: "fit-content", color: "white"}}><Typography variant="body2">Add Employee</Typography></Button>
                    </Box>

                    <div style={{ display: "flex", flexDirection: "column", gap: '8px',justifyContent: "center", padding: '18px'}}>
                        {/* <Typography variant="caption" sx={{color: "#48ff96"}}>{phoneNumber}</Typography>
                        <Box sx={{display: 'flex', justifyContent:'space-around'}}>
                            <Typography variant="caption" sx={{color: "#48ff96"}}>{payment}</Typography>
                            <Typography variant="caption" sx={{color: "#48ff96"}}>{saveForMeRate}</Typography>
                        </Box> */}
                        <Box sx={{ width: '100%' }}>
                            <Stack spacing={3} >
                                <input 
                                    style={inputStyle}
                                    type="tel" 
                                    required
                                    name="PhoneNumber" 
                                    id="PhoneNumber"  
                                    placeholder={phoneNumber}
                                    onChange={(event) => {
                                        event.preventDefault();
                                        setPhoneNumber(`+234${event.currentTarget.value}`);
                                    }}
                                    
                                />
                            
                                <input
                                    style={inputStyle}
                                    type="number"
                                    placeholder="Employee salary or wage"
                                    id="Payment"
                                    required
                                    onChange={(event) => {
                                        event.preventDefault();
                                        setPayment(event.currentTarget.value);
                                    }}
                                />
                                <input
                                    style={inputStyle}
                                    type="number"
                                    placeholder="SaveForMe rate"
                                    required
                                    id="Save4Me"
                                    onChange={(event) => {
                                        event.preventDefault();
                                        setSaveForMeRate(event.currentTarget.value);
                                    }}
                                />

                                <Button
                                    disabled={(!phoneNumber || phoneNumber === '+234') || (!payment || payment === '0')}
                                    // size="medium"
                                    variant="contained"
                                    style={{width: "100%", color: "whitesmoke", background: "#FFCC70"}}
                                    onClick={sendRequest}
                                >
                                    Add
                                </Button>
                            </Stack>
                        </Box>
                    </div>
                </div>
            </div>
        </section>
    );
}
