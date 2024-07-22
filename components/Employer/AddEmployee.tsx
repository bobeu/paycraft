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
import { bn, toBigInt, powr, inputStyle, INPUT_CLASSNAME } from "../utilities";
import { SocialConnect } from "../socialConnect";
import { SectionButton, SectionContainer } from "../common/SectionContainer";
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
        <SectionContainer sectionId="Add Employee" title="Add Employee">
            <Stack spacing={3} className='place-items-center p-4'>
                <input 
                    type="tel" 
                    required
                    name="PhoneNumber" 
                    id="PhoneNumber"  
                    placeholder={phoneNumber}
                    onChange={(event) => {
                        event.preventDefault();
                        setPhoneNumber(`+234${event.currentTarget.value}`);
                    }}
                    className={INPUT_CLASSNAME}
                />
            
                <input
                    className={INPUT_CLASSNAME}
                    type="number"
                    placeholder="Remuneration*"
                    id="Payment"
                    required
                    onChange={(event) => {
                        event.preventDefault();
                        setPayment(event.currentTarget.value);
                    }}
                />
                <input
                    className={INPUT_CLASSNAME}
                    type="number"
                    placeholder="SaveForMe rate"
                    required
                    id="Save4Me"
                    onChange={(event) => {
                        event.preventDefault();
                        setSaveForMeRate(event.currentTarget.value);
                    }}
                />
                <SectionButton buttonText="Add" disableButton={(!phoneNumber || phoneNumber === '+234') || (!payment || payment === '0')} handleClick={sendRequest}/>
            </Stack>
        </SectionContainer>
    );
}