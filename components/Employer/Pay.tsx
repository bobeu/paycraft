import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Callback, EmployeePayload } from "@/contractApis/readContract";
import { useAccount, useConfig } from "wagmi";
import { confirmPayment } from "@/contractApis/confirmPayment";
import { formatAddr } from "@/contractApis/contractAddress";
import { SectionButton, SectionContainer } from "../common/SectionContainer";

export default function Pay({payload : pl, callback} : {payload: EmployeePayload, callback: Callback}) {
    const { address, isConnected } = useAccount();
    const config = useConfig();
    const [acceptSaveForMe, setSave4Me] = React.useState<boolean>(false);

    const handleClick = async() => setSave4Me((prev) => !prev);
    const sendRequest = async() => {
        if(!isConnected) return null;
        await confirmPayment({
            account: formatAddr(address),
            callback,
            employeeId: pl.workId,
            config,
            acceptSaveForMe,
            employeeAddr: pl.identifier,
            amount: pl.pay
        });
        // try {
        // } catch (error: any) {
        //     console.log("Error: ", error?.message || error?.data?.message);
        // }
    }

    return(
        <SectionContainer sectionId='Pay' title='Pay'>
            <Stack className='place-items-start p-4 text-white space-y-4'>
                <div className='w-full flex justify-between items-center'>
                    <Typography>{"Salary due"}</Typography>
                    <Typography>{pl.pay.toString()}</Typography>
                </div>
                <div className='bg-white text-wood text-xs font-semibold space-y-2 rounded p-2'>
                    <h3 className='text-pretty'>Do you wish to accept <span className='italic font-serif'>SaveForMe</span> {'from this individual?'}</h3>
                    <SectionButton buttonText={`${acceptSaveForMe? "Accepted" : "Accept"}`} handleClick={handleClick} disableButton={false}/>
                </div>
                <SectionButton disableButton={false} buttonText="Pay" handleClick={sendRequest}/>
                {/* <div style={{marginTop: "12px"}}> */}
                    {/* <Button onClick={sendRequest} sx={{width: "100%", color: "#22668D", bgcolor: "#FFCC70"}} variant="text" >Pay</Button> */}
                    {/* <Button onClick={approve} sx={{width: "50%"}} variant="text" >Unlock</Button> */}
                {/* </div> */}
            </Stack>
        </SectionContainer>
    );
}

        // <section id="Pay">
        //     <div style={{
        //         padding: "22px",
        //         borderRadius: '6px',
        //         background: "#22668D",
        //         borderBottom: "0.7rem solid #8ECDDD",
        //         height: "100%"
        //     }}>
        //         <div style={{display: "flex", flexDirection: 'column', gap: "22px"}}>
        //             <Button variant="text" sx={{width: "fit-content", color: "white"}}><Typography variant="body2">Pay</Typography></Button>
                    
        //         </div>
        //     </div>
        // </section>


