import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Callback, EmployeePayload } from "@/contractApis/readContract";
import { disableOrEnableEmployee } from "@/contractApis/disableOrEnableEmployee";
import { useAccount, useConfig } from "wagmi";
import { formatAddr } from "@/contractApis/contractAddress";
import { SectionButton, SectionContainer } from "../common/SectionContainer";

export default function Activate({payload : pl, callback} : {callback: Callback, payload: EmployeePayload}) {
    const { address, isConnected } = useAccount();
    const config = useConfig();

    const sendRequest = async(value: boolean) => {
        if(!isConnected) return null;
        try {
            await disableOrEnableEmployee({
                account: formatAddr(address),
                callback,
                employeeId: pl.workId,
                config,
                value
            });
        } catch (error: any) {
            console.log("Error: ", error?.message || error?.data?.message);
        }
    }

    return(
        <SectionContainer sectionId='Activate' title='Status'>
            <Stack className='place-items-start p-4 text-white space-y-4'>
                <Typography>{`Employee is ${pl.active? 'active' : 'inactive'}`}</Typography>
                <SectionButton buttonText={`${pl.active? 'Deactivate' : 'Activate'}`} handleClick={async() => sendRequest(false)} disableButton={!pl.active}/>
            </Stack>
        </SectionContainer>
    );
}


        // <section id="Activate">
        //     <div style={{
        //         padding: "12px",
        //         borderRadius: '6px',
        //         borderBottom: "0.7rem solid #8ECDDD",
        //         background: "#22668D",
        //         height: "100%"
        //     }}>
        //         <div style={{display: "flex", flexDirection: 'column', gap: "22px"}}>
        //             <Button variant="text" sx={{width: "fit-content", color: "white"}}><Typography variant="body2">Activate Employee</Typography></Button>
                    // <Stack spacing={2} sx={{ width: '100%' }}>
                    //     <Button variant="text" style={{width: "50%", color: "#22668D", background: "#FFCC70"}} onClick={async() => sendRequest(true)} sx={{width: "50%"}} disabled={pl.active} >Activate</Button>
                    //     <Button  onClick={async() => sendRequest(false)} style={{width: "50%"}} variant="text" disabled={!pl.active} >Deactivate</Button>
                    // </Stack>
        //         </div>
        //     </div>
        // </section>
// 22668D
// 8ECDDD
// FFFADD
// FFCC70

// 070F2B
// 82C3EC
// 3A98B9