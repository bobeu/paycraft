import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';
import { ChevronIcon } from '../Icons';

interface CollapsibleProps {
  title: string;
  titleSwitch?: string;
  openOnEntry: boolean;
  children: React.ReactNode;
}

interface ChevronProps {
  open: boolean;
}

const collapsibleStyle = {

}

const containerStyle = {

}

const Chevron = (props: ChevronProps) => props.open? <ChevronIcon select='open' /> : <ChevronIcon select='closed' />

export const Collapsible = (props: CollapsibleProps) => {
  const { title, openOnEntry, titleSwitch, children } = props;
  const [open, setOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    openOnEntry && setOpen(openOnEntry);
  }, []);

  return (
    <React.Fragment>
      <Box sx={containerStyle}>
        <Button 
          sx={{width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center"}}
          onClick={() => setOpen(!open)}
        > 
          <Typography>{!open? title : titleSwitch}</Typography>
          <Chevron open={open} />
        </Button>
        <Collapse in={open} timeout="auto" unmountOnExit sx={collapsibleStyle}>{ children }</Collapse>
      </Box>
    </React.Fragment>
  )
}
