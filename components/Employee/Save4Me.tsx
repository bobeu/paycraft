import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Callback, EmployeePayload } from "@/contractApis/readContract";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { save4Me } from "@/contractApis/saveForMe";
import { useAccount } from "wagmi";
import { useConfig } from "wagmi";
import { formatAddr } from "@/contractApis/contractAddress";

export default function Save4Me({payload : pl, callback} : {payload: EmployeePayload, callback: Callback}) {
    const { address, isConnected } = useAccount();
    const config = useConfig();
    const sendRequest = async(value: boolean) => {
        if(!isConnected) return null;
        try {
            await save4Me({
                account: formatAddr(address),
                callback,
                config,
                employerAddr: pl.employer,
                employeId: pl.workId,
                value
            });
        } catch (error: any) {
            console.log("Error: ", error?.message || error?.data?.message);
        }
    }

    return(
        <section id="Save4Me">
            <div style={{
                padding: "22px", 
                borderRadius: '6px',
                borderBottom: "0.7rem solid #8ECDDD",
                background: "#22668D",
                height: "100%",
            }}>
                <Box sx={{display: "flex",justifyContent: "start", alignItems: "center"}}>
                    <Button variant="text" sx={{width: "fit-content", color: "white"}}><Typography variant="h6">Save4Me</Typography></Button>
                </Box>
                <Typography sx={{marginBottom: 2, color: "white"}}><span style={{color: "#8ECDDD", fontSize:"18px"}}>Save4Me</span> allows you to save your earnings with your employer until the next payment or until you disable it. You will earn a compounded interest so long the instruction remains active.</Typography>
                <Stack spacing={2}>
                    <Button onClick={async() => await sendRequest(true)} disabled={pl.saveForMe} sx={{width: {xs: "100%", md: "50%"}, background: "#FFCC70", color: "22668D"}}>Enable</Button>
                    <Button onClick={async() => await sendRequest(false)} disabled={!pl.saveForMe} sx={{width: {xs: "100%", md: "50%"}, background: "#FFCC70", color: "22668D"}}>Disable</Button>
                </Stack>
            </div>
        </section>
    );
}