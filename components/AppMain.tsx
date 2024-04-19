import React, { FC, ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
// import Divider from '@mui/material/Divider';
import getLPTheme from './getLPTheme';
import Box from '@mui/material/Box';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Employer from './Employer';
// import LogoCollection from './LogoCollection';
// import Highlights from './Highlights';
// import Pricing from './Pricing';
// import Features from './Features';
// import Testimonials from './Testimonials';
import FAQ from './Faq';
import Employee from './Employee';
import { EmployeePayloads } from "@/contractApis/readContract";
import { initEmployeePayload } from "./utilities";



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
    const [contractData, setData] = React.useState<EmployeePayloads>([initEmployeePayload]);
    const defaultTheme = createTheme({ palette: { mode } });
  
    const toggleColorMode = () => {
      setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const toggleUsers = () => {
        setShowCustomTheme((prev) => !prev);
    };

    return (
      <ThemeProvider theme={LPtheme}>
        {/* <CssBaseline /> */}
        <Header { ...{ mode, toggleColorMode, isEmployer } } />
        { 
          isEmployer? <Employer {...{contractData} } /> : <Employee {...{contractData} } /> 
        }
        <Box sx={{ bgcolor: 'background.default' }}>
          <FAQ />
          <Footer />
        </Box>
        {/* <CssBaseline /> */}
        <ToggleCustomTheme { ...{ isEmployer, toggleUsers } } />
      </ThemeProvider>
    );
};

export default AppMain;

            // <div className="bg-gypsum overflow-hidden flex flex-col min-h-screen">
            //     <div className=" mx-auto space-y-2 sm:px-6 lg:px-8">
            //         {/* {children} */}
            //     </div>
            // </div>