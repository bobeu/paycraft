import * as React from 'react';
import { alpha } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Activate from './Activate';
import AddEmployee from './AddEmployee';
import Approve from './Approve';
import Deactivate from './Deactivate';
import Pay from './Pay';
import { Callback, EmployeePayload, EmployeePayloads } from '@/contractApis/readContract';
import { filterUser, initEmployeePayload } from '../utilities';
import { useAccount } from 'wagmi';
import { formatAddr } from '@/contractApis/contractAddress';
import SelectEmployer from '../SelectEmployer';

export default function Employer({contractData, callback} : {contractData: EmployeePayloads, callback: Callback}) {
  const [selectedData, setData] = React.useState<EmployeePayload>(initEmployeePayload);
  const { address } = useAccount();
  const employees = filterUser(formatAddr(address), contractData, true);
  const [selectedEmployee, setEmployee] = React.useState<EmployeePayload>(initEmployeePayload);
  
  const setSelected = (x: EmployeePayload) => setEmployee(x);
  const actions = Array.from([
    <AddEmployee { ...{ selectedData, callback } } />,
    <Activate { ...{ selectedData, callback } } />,
    <Deactivate { ...{ selectedData, callback } } />,
    <Pay { ...{ selectedData, callback } } />
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
        <Stack spacing={2} useFlexGap sx={{ width: '100%' }}>
          <SelectEmployer data={employees} setSelected={setSelected} selected={selectedEmployee.identifier} />
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