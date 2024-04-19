import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Callback, EmployeePayload } from "@/contractApis/readContract";
import { useAccount, useConfig } from "wagmi";
import { sendPayment } from "@/contractApis/sendPayment";
import { formatAddr } from "@/contractApis/contractAddress";

export default function Pay({selectedEmployee: sem, callback} : {selectedEmployee: EmployeePayload, callback: Callback}) {
    const { address, isConnected } = useAccount();
    const config = useConfig();
    const [acceptSaveForMe, setSave4Me] = React.useState<boolean>(false);

    const sendRequest = async() => {
        if(!isConnected) return null;
        await sendPayment({
            account: formatAddr(address),
            callback,
            employeeId: sem.workId,
            config,
            acceptSaveForMe
        });
    }

    const approve = async() => {

    }

    return(
        <section id="Pay">
            <div style={{
                padding: "22px",
                borderRadius: '6px',
                border: "1px solid green",
                height: "100%"
            }}>
                <div style={{display: "flex", flexDirection: 'column', gap: "22px"}}>
                    <Button variant="outlined" sx={{width: "fit-content"}}><Typography variant="h6">Pay</Typography></Button>
                    <Stack spacing={3} sx={{ width: '100%' }}>
                        <Typography variant="body2">{sem.identifier}</Typography>
                        <Box sx={{display: "flex", justifyContent: 'space-between', alignItems: "center"}}>
                            <Typography variant="body2">Amount Payable</Typography>
                            <Typography variant="body2">{sem.pay.toString()}</Typography>
                        </Box>
                        <Box style={{marginTop: "12px", float: "right"}}>
                            <Typography variant="body2">Accept save4Me <span style={{fontWeight: "bold", fontSize: "12px"}}>{"(Default is false)"}</span></Typography>
                            <Button onClick={() => setSave4Me((prev) => !prev)} sx={{width: "20%"}} variant="text" >{`${acceptSaveForMe? "Accepted" : "Accept"}`}</Button>
                        </Box>
                        <Box style={{marginTop: "12px"}}>
                            <Button onClick={sendRequest} sx={{width: "50%"}} variant="text" >Pay</Button>
                            <Button onClick={approve} sx={{width: "50%"}} variant="text" >Approve Spending</Button>
                        </Box>
                    </Stack>
                </div>
            </div>
        </section>
    );
}