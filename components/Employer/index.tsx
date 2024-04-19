import * as React from 'react';
import { alpha } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Activate from './Activate';
import AddEmployee from './AddEmployee';
import Pay from './Pay';
import { Callback, EmployeePayload } from '@/contractApis/readContract';
import ApproveLoanOrAdvanceRequest from './ApproveLoanOrAdvanceRequest';

export default function Employer({payload, callback} : {payload: EmployeePayload, callback: Callback}) {
  const actions = Array.from([
    <AddEmployee { ...{ callback } } />,
    <Activate { ...{ callback, payload } } />,
    <Pay { ...{ callback, payload } } />,
    <ApproveLoanOrAdvanceRequest { ...{ callback, payload } } />
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
          pt: { xs: 2, sm: 4 },
          pb: { xs: 6, sm: 4 },
        }}
      >
        <Stack spacing={2} useFlexGap sx={{ width: '100%' }}>
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