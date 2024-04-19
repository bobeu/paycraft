import React from "react";
import Box from "@mui/material/Box";
import { Callback, EmployeePayload } from "@/contractApis/readContract";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { save4Me } from "@/contractApis/saveForMe";
import { useAccount } from "wagmi";
import { useConfig } from "wagmi";
import { formatAddr } from "@/contractApis/contractAddress";

export default function Save4Me({selectedEmployer : sem, callback} : {selectedEmployer: EmployeePayload, callback: Callback}) {
    const { address, isConnected } = useAccount();
    const config = useConfig();
    const sendRequest = async(value: boolean) => {
        if(!isConnected) return null;
        await save4Me({
            account: formatAddr(address),
            callback,
            config,
            employerAddr: sem.employer,
            employeId: sem.workId,
            value
        });
    }

    return(
        <section id="Save4Me">
            <div style={{
                padding: "22px", 
                borderRadius: '6px',
                border: "1px solid green",
                height: "100%",
            }}>
                <Box sx={{display: "flex",justifyContent: "start", alignItems: "center"}}>
                    <Button variant="outlined" sx={{width: "fit-content"}}><Typography variant="h6">Save4Me</Typography></Button>
                </Box>
                <Typography sx={{marginBottom: 2}}><span style={{color: "green", fontSize:"18px"}}>Save4Me</span> allows you to save your earnings with your employer until the next payment or until you disable it. You will earn a compounded interest so long the instruction remains active.</Typography>
                <div>
                    <Button onClick={async() => await sendRequest(true)} disabled={sem.saveForMe} style={{width: "50%"}}>Enable</Button>
                    <Button onClick={async() => await sendRequest(false)} disabled={!sem.saveForMe} style={{width: "50%"}}>Disable</Button>
                </div>
            </div>
        </section>
    );
}