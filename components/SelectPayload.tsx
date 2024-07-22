import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { EmployeePayload, EmployeePayloads } from '@/contractApis/readContract';
import { OxString } from '@/contractApis/contractAddress';
import { zeroAddress } from 'viem';

export default function SelectPayload({filteredPayloads : fp, setSelectedPayload, selectedUser: sp, isEmployer} : {filteredPayloads: EmployeePayloads, setSelectedPayload: (x: EmployeePayload) => void, selectedUser: string, isEmployer: boolean}) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const handleMenuItemClick = (
    // event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedPayload(fp[index]);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <Box className='border rounded'>
      <ButtonGroup
        variant="text"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
        sx={{width: '100%'}}
        // style={{padding: "10px"}}
      >
        <Button 
          disabled 
          startIcon={isEmployer? "My Employees: " : "My Employers: "}
          endIcon={getPhoneNumber(sp)}
          sx={{
            width: "100%",
            overflowX: "hidden",
            height: "100%",
          }}
          // style={{border: "none",}}
        />
        <Button
          // size="medium"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
          sx={{height: "100%"}}
          // style={{border: "none",}}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper sx={{ zIndex: 1,}}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper style={{width : "235px"}}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {fp.map((fp, i) => (
                    <MenuItem
                      key={i}
                      // disabled={index === 2}
                      selected={isEmployer? fp.employer === sp : false}
                      onClick={(event) => handleMenuItemClick(i)}
                    >
                      {isEmployer? `${getPhoneNumber(fp.employer)}` : `${getPhoneNumber(fp.identifier)}`}
                      {/* {isEmployer? `${fp.employer.substring(0, 12)}...${fp.employer.substring(23, 42)}` : `${fp.employer.substring(0, 12)}...${fp.identifier.substring(23, 42)}`} */}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
}

const getPhoneNumber = (address: string) => {
  if(address === zeroAddress) return "+234...";
  if(address === "0x813Af3052B521fF0E96576702399a1D5b8C93fCe" || address === "0x7624269a420c12395B743aCF327A61f91bd23b84") return "+2348153014617";
} 