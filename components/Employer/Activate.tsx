import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Callback, EmployeePayload } from "@/contractApis/readContract";
import { disableOrEnableEmployee } from "@/contractApis/disableOrEnableEmployee";
import { useAccount, useConfig } from "wagmi";
import { formatAddr } from "@/contractApis/contractAddress";

export default function Activate({payload : pl, callback} : {callback: Callback, payload: EmployeePayload}) {
    const { address, isConnected } = useAccount();
    const config = useConfig();

    const sendRequest = async(value: boolean) => {
        if(!isConnected) return null;
        await disableOrEnableEmployee({
            account: formatAddr(address),
            callback,
            employeeId: pl.workId,
            config,
            value
        });
    }

    return(
        <section id="Activate">
            <div style={{
                padding: "22px",
                borderRadius: '6px',
                border: "1px solid green",
                height: "100%"
            }}>
                <div style={{display: "flex", flexDirection: 'column', gap: "22px"}}>
                    <Button variant="outlined" sx={{width: "fit-content"}}><Typography variant="h6">Activate Employee</Typography></Button>
                    <Stack spacing={0} sx={{ width: '100%' }}>
                        {/* <Typography variant="body2">{pl.identifier}</Typography> */}
                        <div style={{marginTop: "12px"}}>
                            <Button onClick={async() => sendRequest(true)} sx={{width: "50%"}} variant="text" disabled={pl.active} >Activate</Button>
                            <Button onClick={async() => sendRequest(false)} sx={{width: "50%"}} variant="text" disabled={!pl.active} >Deactivate</Button>
                        </div>
                    </Stack>
                </div>
            </div>
        </section>
    );
}
