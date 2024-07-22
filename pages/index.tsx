import * as React from 'react';
// import { config, connectors } from '@/config';
import { connect } from "wagmi/actions";
import { injected } from "wagmi/connectors";
import Layout from '@/components/Layout';
// import { Container, PaletteMode } from '@mui/material';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import ToggleButton from '@mui/material/ToggleButton';
// import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Callback, EmployeePayload, EmployeePayloads, Status, getEmployees } from "@/contractApis/readContract";
// import { filterUser, initEmployeePayload } from "./utilities";
import { useAccount, useConfig } from "wagmi";
import { formatAddr } from "@/contractApis/contractAddress";
// import SelectPayload from "./SelectPayload";
import Image from "next/image";
// import getLPTheme from '@/components/getLPTheme';
import { filterUser, initEmployeePayload } from '@/components/utilities';
import SelectPayload from '@/components/SelectPayload';
import Employer from '@/components/Employer';
import Employee from '@/components/Employee';
import SignIn from '@/components/SignIn/Index';
// import SignIn from "./SignIn/Index";

function ToggleCustomTheme({ isEmployer, toggleUsers }: ToggleCustomThemeProps) {
  const [active, setActive] = React.useState<string>('employer');
  const handleClick = (employer: boolean) => {
    if(employer) {
      !isEmployer && (toggleUsers(), setActive('employer'))
    } else {
      isEmployer && (toggleUsers(), setActive('employee'));
    }
  }

  return (
    <Stack className='fixed right-0 bottom-3 w-full place-items-center'>
      <div className='w-full flex justify-center items-center px-4'>
        <button className={`border border-gray-300 rounded p-2 w-full text-wood bg-white hover:bg-gray-200 ${active === 'employer' && 'bg-prosperity'}`} onClick={() => handleClick(true)}>Employer</button>
        <button className={`border border-gray-300 rounded p-2 w-full text-wood bg-white hover:bg-gray-200 ${active === 'employee' && 'bg-prosperity'}`} onClick={() => handleClick(false)}>Employee</button>
      </div>
      {/* <ToggleButtonGroup
        color="secondary"
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
      </ToggleButtonGroup> */}
    </Stack>
  );
}

export default function Index() {
  // const [lightMode, setMode] = React.useState<PaletteMode>('light');
  const [lightMode, setMode] = React.useState<boolean>(false);
  const [isEmployer, setShowCustomTheme] = React.useState(true);
  const [payloads, setPayloads] = React.useState<EmployeePayloads>([initEmployeePayload]);
  const [payload, setPayload] = React.useState<EmployeePayload>(initEmployeePayload);
  const [filteredPayloads, setFilteredPayloads] = React.useState<EmployeePayloads>([initEmployeePayload]);
  const [txStatus, setStatus] = React.useState<Status>("Pending");
  // const [isAuthenticated, authenticate] = React.useState<boolean>(false);
  
  // const LPtheme = createTheme(getLPTheme(mode));
  const { isConnected, address } = useAccount();
  const config = useConfig();

  // const toggleColorMode = () => {
  //   setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  // };

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
      <Stack className='space-y-4 mb-10'>
        {
          isEmployer? <Image src={"/employer2/2636676.jpg"} width={350} height={350} alt="image by Freepick"/> : <Image src={"/employee/20922.jpg"} width={250} height={250} alt="image by Freepick"/>
        }
        <SelectPayload { ...{filteredPayloads, setSelectedPayload, isEmployer}} selectedUser={isEmployer? payload.employer : payload.identifier} />
        { isEmployer? <Employer {...{callback, payload} } /> : <Employee {...{callback, payload} } /> }
      </Stack>
    );
  }

  const stageConnection = () => {
    // connect(config, { connector: injected()});
    if(window.ethereum && window.ethereum.isMinipay && !isConnected){
      console.log("It runs 244");
      connect(config, { connector: injected()});
    }
  } 
 
  // React.useEffect(() => {
  //   if(window.ethereum && window.ethereum.isMinipay && !isConnected){
  //     connect(config, { connector: injected()});
  //   }
  // }, [address, isConnected]);
  
  return (
    <Layout {...{lightMode, isEmployer}}>
      {
        isConnected?
          <SignIn connect={stageConnection}/> : <React.Fragment>
            { appContent() }
            <ToggleCustomTheme { ...{ isEmployer, toggleUsers } } />
          </React.Fragment>
      }
    </Layout>
  );
}

interface ToggleCustomThemeProps {
  isEmployer: Boolean;
  toggleUsers: () => void;
}

  // const { connect } = useConnect(config);
  
  // let walletClient = createWalletClient({
  //   transport: custom(window.ethereum),
  //   chain: celoAlfajores,
  // });
  // const defaultTheme = createTheme({ palette: { mode } });
