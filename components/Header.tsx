import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useConnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";
import React, { useEffect, useState} from 'react';
import { PaletteMode } from '@mui/material';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import ToggleColorMode from './ToggleColorMode';
import FilterAPIs from "./FilterAPIs";

// const logoStyle = {
//     width: '140px',
//     height: 'auto',
//     cursor: 'pointer',
//   };
  
  interface AppAppBarProps {
    mode: PaletteMode;
    isEmployer: boolean;
    toggleColorMode: () => void;
  }

export default function Header({ mode, toggleColorMode, isEmployer }: AppAppBarProps) {
    const [hideConnectBtn, setHideConnectBtn] = useState(false);
    const { isConnected } = useAccount();

    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const scrollToSection = (sectionId: string) => {
        const sectionElement = document.getElementById(sectionId);
        const offset = 128;
        if (sectionElement) {
            const targetScroll = sectionElement.offsetTop - offset;
            sectionElement.scrollIntoView({ behavior: 'smooth' });
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth',
            });
            setOpen(false);
        }
    };

    // useEffect(() => {
    //     if (window.ethereum && window.ethereum.isMiniPay) {
    //         setHideConnectBtn(true);
    //         connect({ connector: injected({ target: "metaMask" }) });
    //     }
    // }, []);

    return (
        <div>
            <AppBar position="fixed" sx={{ boxShadow: 0, bgcolor: 'transparent', backgroundImage: 'none', mt: 2, }}>
                <Container maxWidth="lg">
                    <Toolbar
                        variant="regular"
                        sx={(theme) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                        borderRadius: '999px',
                        bgcolor:
                            theme.palette.mode === 'light'
                            ? 'rgba(255, 255, 255, 0.4)'
                            : 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(24px)',
                        maxHeight: 40,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow:
                            theme.palette.mode === 'light'
                            ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                            : '0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)',
                        })}
                    >
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: '-18px', px: 0, }} >
                            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                                <FilterAPIs { ...{ isEmployer, scrollToSection }} />
                            </Box>
                        </Box>

                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center', }} >
                            <ConnectButton />
                            <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
                        </Box>
                        <Box sx={{width: "100%", display: { sm: 'flex', md: 'none' } }}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                { isConnected && <ConnectButton />}
                                <Button
                                    variant="text"
                                    color="primary"
                                    aria-label="menu"
                                    onClick={toggleDrawer(true)}
                                    sx={{ minWidth: '30px', p: '4px' }}
                                >
                                    <MenuIcon />
                                </Button>

                            </Box>
                            <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                                <Box sx={{ minWidth: '60dvw', p: 2, backgroundColor: 'background.paper', flexGrow: 1, }} >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', flexGrow: 1, }} >
                                        <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
                                    </Box>
                                    <FilterAPIs { ...{ isEmployer, scrollToSection }} />
                                    <Divider />
                                </Box>
                            </Drawer>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    );
}

