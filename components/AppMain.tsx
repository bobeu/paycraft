import React, { FC, ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import getLPTheme from './getLPTheme';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Employer from './Employer';
import FAQ from './Faq';
import Employee from './Employee';
import { Callback, EmployeePayloads, Status, getEmployees } from "@/contractApis/readContract";
import { initEmployeePayload } from "./utilities";
import { useAccount, useConfig } from "wagmi";
import { formatAddr } from "@/contractApis/contractAddress";



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
    const [payloads, setData] = React.useState<EmployeePayloads>([initEmployeePayload]);
    const [txStatus, setStatus] = React.useState<Status>("Pending");
    // const defaultTheme = createTheme({ palette: { mode } });

    const { isConnected, address } = useAccount();
    const config = useConfig();
  
    const toggleColorMode = () => {
      setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const toggleUsers = () => {
        setShowCustomTheme((prev) => !prev);
    };

    const callback : Callback = (args: {txStatus? : Status, result?: EmployeePayloads}) => {
      const { txStatus, result } = args; 
      if(txStatus) setStatus(txStatus);
      if(result) setData(result);
    };

    React.useEffect(() => {
      const controller = new AbortController();
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
    }, []);

    return (
      <ThemeProvider theme={LPtheme}>
        <CssBaseline />
        <Header { ...{ mode, toggleColorMode, isEmployer } } />
        { isEmployer? <Employer contractData={payloads} {...{callback} } /> : <Employee contractData={payloads} {...{callback} } /> }
        <Box sx={{ bgcolor: 'background.default' }}>
          <FAQ />
          <Footer />
        </Box>
        <ToggleCustomTheme { ...{ isEmployer, toggleUsers } } />
      </ThemeProvider>
    );
};

export default AppMain;
