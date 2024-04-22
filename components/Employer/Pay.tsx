import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Callback, EmployeePayload } from "@/contractApis/readContract";
import { useAccount, useConfig } from "wagmi";
import { sendPayment } from "@/contractApis/sendPayment";
import { formatAddr } from "@/contractApis/contractAddress";

export default function Pay({payload : pl, callback} : {payload: EmployeePayload, callback: Callback}) {
    const { address, isConnected } = useAccount();
    const config = useConfig();
    const [acceptSaveForMe, setSave4Me] = React.useState<boolean>(false);

    const sendRequest = async() => {
        if(!isConnected) return null;
        
        try {
            await sendPayment({
                account: formatAddr(address),
                callback,
                employeeId: pl.workId,
                config,
                acceptSaveForMe,
                employeeAddr: pl.identifier
            });
        } catch (error: any) {
            console.log("Error: ", error?.message || error?.data?.message);
        }
    }

    return(
        <section id="Pay">
            <div style={{
                padding: "22px",
                borderRadius: '6px',
                background: "#22668D",
                borderBottom: "0.7rem solid #8ECDDD",
                height: "100%"
            }}>
                <div style={{display: "flex", flexDirection: 'column', gap: "22px"}}>
                    <Button variant="text" sx={{width: "fit-content", color: "white"}}><Typography variant="body2">Pay</Typography></Button>
                    <Stack spacing={3} sx={{ width: '100%' }}>
                        {/* <Typography variant="body2">{pl.identifier}</Typography> */}
                        <Box sx={{display: "flex", justifyContent: 'space-between', alignItems: "center", color: "#8ECDDD"}}>
                            <Typography variant="body1">{"Salary/Wage"}</Typography>
                            <Typography variant="body2">{pl.pay.toString()}</Typography>
                        </Box>
                        <Box style={{marginTop: "12px", float: "right", color: "#8ECDDD"}}>
                            <Typography variant="body2">Accept save4Me <span style={{fontWeight: "bold", fontSize: "12px", color: "cyan"}}>{"(Default is false)"}</span></Typography>
                            <Button variant="outlined" onClick={() => setSave4Me((prev) => !prev)} sx={{width: "20%", color: "#8ECDDD"}}>{`${acceptSaveForMe? "Accepted" : "Accept"}`}</Button>
                        </Box>
                        <Box style={{marginTop: "12px"}}>
                            <Button onClick={sendRequest} sx={{width: "100%", color: "#22668D", bgcolor: "#FFCC70"}} variant="text" >Pay</Button>
                            {/* <Button onClick={approve} sx={{width: "50%"}} variant="text" >Unlock</Button> */}
                        </Box>
                    </Stack>
                </div>
            </div>
        </section>
    );
}



