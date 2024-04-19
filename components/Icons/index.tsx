import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import { ArrowDropDown, ArrowRight, ArrowDownward } from '@mui/icons-material';

interface ChevronProps {
  select: string;
}

export const ChevronIcon = (props: ChevronProps) => {
  const { select } = props;

  return select === 'open'? <ArrowDropDown /> : <ArrowRight />;
}

export const NAVBAR_ICONS = [
  {
    to: '/',
    icon: <Tooltip title="Back"><h3 >Back</h3></Tooltip>
  },
  {
    to: 'dashboard',
    icon: <Tooltip title="Dashboard"><h3>Dashboard</h3></Tooltip>
  },
  {
    to: 'wallet',
    icon: <Tooltip title="Wallet"><h3>Wallet</h3></Tooltip>
  },
  {
    to: 'help',
    icon: <Tooltip title="Help"><h3>Help</h3></Tooltip>
  }
]
