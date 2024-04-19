import React, { useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

export interface FilterAPIsProp {
    isEmployer: boolean;
    scrollToSection: (sectionId: string) => void;
}

export default function FilterAPIs({ scrollToSection, isEmployer }: FilterAPIsProp ) {

    return (
        <React.Fragment>

            {
                isEmployer ? EMPLOYER_APIS_TAGS.map((tag) => (
                    <MenuItem onClick={() => {
                        let to = tag;
                        if(tag === "Deactivate") to = "Activate";
                        scrollToSection(to);
                    }} sx={{ py: '6px', px: '12px' }}>
                        <Typography variant="body2" color="text.primary">
                            {tag}
                        </Typography>
                    </MenuItem>
                )) : EMPLOYEES_APIS_TAGS.map((tag) => (
                    <MenuItem onClick={() => scrollToSection(tag)} sx={{ py: '6px', px: '12px' }}>
                        <Typography variant="body2" color="text.primary">
                            {tag}
                        </Typography>
                    </MenuItem>
                ))
            }
        </React.Fragment>
    );
}

export const EMPLOYER_APIS_TAGS = [
    "Add Employee",
    "Approve",
    "Activate",
    "Deactivate",
    "Pay"
];

export const EMPLOYEES_APIS_TAGS = [
    "Save4Me",
    "Loans & Advances",
    "Request Loan",
];









