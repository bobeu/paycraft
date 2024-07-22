import React, { FC, ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { Container, PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import getLPTheme from './getLPTheme';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Employer from './Employer';
import FAQ from './Faq';
import Employee from './Employee';
import { Callback, EmployeePayload, EmployeePayloads, Status, getEmployees } from "@/contractApis/readContract";
import { filterUser, initEmployeePayload } from "./utilities";
import { useAccount, useConfig } from "wagmi";
import { formatAddr } from "@/contractApis/contractAddress";
import SelectPayload from "./SelectPayload";
import Image from "next/image";
import SignIn from "./SignIn/Index";

interface Props {
  children: ReactNode;
}

interface ToggleCustomThemeProps {
  isEmployer: Boolean;
  toggleUsers: () => void;
}
  
function ToggleCustomTheme({ isEmployer, toggleUsers }: ToggleCustomThemeProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100dvw', position: 'fixed', bottom: 24,}}>
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={isEmployer}
        onChange={toggleUsers}
        aria-label="Platform"
        sx={{
          backgroundColor: 'background.default',
          '& .Mui-selected': {
            pointerEvents: 'none',
          },
        }}
      >
        <ToggleButton value>Employer</ToggleButton>
        <ToggleButton value={false}>Employee</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

const AppMain = () => {
  const [mode, setMode] = React.useState<PaletteMode>('light');
  const [isEmployer, setShowCustomTheme] = React.useState(true);
  const LPtheme = createTheme(getLPTheme(mode));
  const [payloads, setPayloads] = React.useState<EmployeePayloads>([initEmployeePayload]);
  const [payload, setPayload] = React.useState<EmployeePayload>(initEmployeePayload);
  const [filteredPayloads, setFilteredPayloads] = React.useState<EmployeePayloads>([initEmployeePayload]);
  const [txStatus, setStatus] = React.useState<Status>("Pending");
  const [isAuthenticated, authenticate] = React.useState<boolean>(false);
  // const defaultTheme = createTheme({ palette: { mode } });
  
  const { isConnected, address } = useAccount();
  const config = useConfig();

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setSelectedPayload = (x: EmployeePayload) => {
    setPayload(x);
  };

  const toggleUsers = () => {
    setShowCustomTheme((prev) => {
      const newValue = !prev;
      setFilteredPayloads(filterUser(formatAddr(address), payloads, newValue));
      return newValue;
    });
  };

  const callback : Callback = (args: {txStatus? : Status, result?: EmployeePayloads}) => {
    const { txStatus, result } = args; 
    if(txStatus) setStatus(txStatus);
    if(result) setPayloads(result);
  };

  React.useEffect(() => {
    const controller = new AbortController();
    try {
      
      if(isConnected) {
        const readContract = async() => {
          await getEmployees({
            config,
            account: formatAddr(address),
            callback
          });
        }
        readContract();
        return () => {
          controller.abort();
        }
      }
    } catch (error: any) {
      console.log("Error: ", error?.message || error?.data?.message)
    }
  }, [isConnected, address, config]);

  const appContent = () => {
    return(
      <Stack sx={{width: "100%", marginTop: 4}} >
        {
          isEmployer? <Image src={"/employer2/2636676.jpg"} width={350} height={350} alt="image by Freepick"/> : <Image src={"/employee/20922.jpg"} width={250} height={250} alt="image by Freepick"/>
        }
        <SelectPayload { ...{filteredPayloads, setSelectedPayload, isEmployer}} selectedUser={isEmployer? payload.employer : payload.identifier} />
        { isEmployer? <Employer {...{callback, payload} } /> : <Employee {...{callback, payload} } /> }
      </Stack>
    );
  }

  return (
    // <ThemeProvider theme={LPtheme}>
    //   <CssBaseline />
    // </ThemeProvider>
    <Container>
      <Header { ...{ mode, toggleColorMode, isEmployer } } />
      <Box sx={{width: "100%", marginTop: 10}}>
        {
          !isAuthenticated?
            <SignIn /> : <React.Fragment>
              { appContent() }
              <ToggleCustomTheme { ...{ isEmployer, toggleUsers } } />
            </React.Fragment>
        }
      </Box>
      {/* <FAQ /> */}
      <Footer />
    </Container>
  );
};

export default AppMain;
