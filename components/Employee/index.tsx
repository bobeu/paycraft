import * as React from 'react';
import { alpha } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoansAndAdvance from './LoansAndAdvance';
import RequestLoan from './RequestLoan';
import Save4Me from './Save4Me';
import { AdvanceRequestStatus, Callback, EmployeePayload, EmployeePayloads, LoanRequestStatus } from '@/contractApis/readContract';
import { bn, filterUser, initEmployeePayload,  } from '../utilities';
import { useAccount } from 'wagmi';
import { OxString, formatAddr } from '@/contractApis/contractAddress';
import SelectEmployer from '../SelectEmployer';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Employee({contractData, callback} : {contractData: EmployeePayloads, callback: Callback}) {
  const { address } = useAccount();
  const employers = filterUser(formatAddr(address), contractData, false);
  // const [selectedData, setData] = React.useState<EmployeePayload>(initEmployeePayload);
  const [selectedEmployer, setEmployer] = React.useState<EmployeePayload>(initEmployeePayload);
  
  // const disabledLoanButton = bn(selectedEmployer.loanReq.amount).isZero() || selectedEmployer.loanReq.status === LoanRequestStatus.NONE || selectedEmployer.loanReq.status === LoanRequestStatus.SERVICED;
  // const disabledadvanceButton = bn(selectedEmployer.advanceReq.amount).isZero() || selectedEmployer.advanceReq.status === AdvanceRequestStatus.NONE || selectedEmployer.advanceReq.status === AdvanceRequestStatus.SERVICED;
  
  const setSelected = (x: EmployeePayload) => setEmployer(x);
  const actions = Array.from([
    <LoansAndAdvance { ...{ selectedEmployer, callback }  } />,
    <RequestLoan { ...{ selectedEmployer, callback } } />,
    <Save4Me { ...{ selectedEmployer, callback } } />
  ]);
 
  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        backgroundImage:
          theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
            : `linear-gradient(#02294F, ${alpha('#090E10', 0.0)})`,
        backgroundSize: '100% 20%',
        backgroundRepeat: 'no-repeat',
      })}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <ConnectButton />
        <Stack spacing={2} useFlexGap sx={{ width: '100%' }}>
          <SelectEmployer data={employers} setSelected={setSelected} selected={selectedEmployer.employer} />
          {
            actions.map((action, key) => (
              <React.Fragment key={key}>{ action }</React.Fragment>
            ))
          }
        </Stack>
      </Container>
    </Box>
  );
}




// </Stack>
// <Typography variant="caption" textAlign="center" sx={{ opacity: 0.8 }}>
//   By clicking &quot;Start now&quot; you agree to our&nbsp;
//   <Link href="#" color="primary">
//     Terms & Conditions
//   </Link>
//   .
// </Typography>
{/* <Box
  id="image"
  sx={(theme) => ({
    mt: { xs: 8, sm: 10 },
    alignSelf: 'center',
    height: { xs: 200, sm: 700 },
    width: '100%',
    backgroundImage:
      theme.palette.mode === 'light'
        ? 'url("/static/images/templates/templates-images/hero-light.png")'
        : 'url("/static/images/templates/templates-images/hero-dark.png")',
    backgroundSize: 'cover',
    borderRadius: '10px',
    outline: '1px solid',
    outlineColor:
      theme.palette.mode === 'light'
        ? alpha('#BFCCD9', 0.5)
        : alpha('#9CCCFC', 0.1),
    boxShadow:
      theme.palette.mode === 'light'
        ? `0 0 12px 8px ${alpha('#9CCCFC', 0.2)}`
        : `0 0 24px 12px ${alpha('#033363', 0.2)}`,
  })}
/> */}