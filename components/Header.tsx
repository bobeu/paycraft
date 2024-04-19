import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import React, { useEffect, useState} from 'react';
import { PaletteMode } from '@mui/material';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import ToggleColorMode from './ToggleColorMode';
import FilterAPIs from "./FilterAPIs";

const logoStyle = {
    width: '140px',
    height: 'auto',
    cursor: 'pointer',
  };
  
  interface AppAppBarProps {
    mode: PaletteMode;
    isEmployer: boolean;
    toggleColorMode: () => void;
  }

export default function Header({ mode, toggleColorMode, isEmployer }: AppAppBarProps) {
    const [hideConnectBtn, setHideConnectBtn] = useState(false);
    const { connect } = useConnect();

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

    useEffect(() => {
        if (window.ethereum && window.ethereum.isMiniPay) {
            setHideConnectBtn(true);
            connect({ connector: injected({ target: "metaMask" }) });
        }
    }, []);

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
                            <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
                        </Box>
                        <Box sx={{ display: { sm: '', md: 'none' } }}>
                            <Button
                                variant="text"
                                color="primary"
                                aria-label="menu"
                                onClick={toggleDrawer(true)}
                                sx={{ minWidth: '30px', p: '4px' }}
                            >
                                <MenuIcon />
                            </Button>
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




                    {/* <img
                        src={
                        'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/61f12e6faf73568658154dae_SitemarkDefault.svg'
                        }
                        style={logoStyle}
                        alt="logo of sitemark"
                    /> */}


{/* <MenuItem>
                            <Button
                            color="primary"
                            variant="contained"
                            component="a"
                            href="/material-ui/getting-started/templates/sign-up/"
                            target="_blank"
                            sx={{ width: '100%' }}
                            >
                            Sign up
                            </Button>
                        </MenuItem>
                        <MenuItem>
                            <Button
                            color="primary"
                            variant="outlined"
                            component="a"
                            href="/material-ui/getting-started/templates/sign-in/"
                            target="_blank"
                            sx={{ width: '100%' }}
                            >
                            Sign in
                            </Button>
                        </MenuItem> */}

{/* <Button
                        color="primary"
                        variant="text"
                        size="small"
                        component="a"
                        href="/material-ui/getting-started/templates/sign-in/"
                        target="_blank"
                    >
                        Sign in
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        size="small"
                        component="a"
                        href="/material-ui/getting-started/templates/sign-up/"
                        target="_blank"
                    >
                        Sign up
                    </Button> */}


        // <Disclosure as="nav" className="bg-prosperity border-b border-black">
        //     {({ open }) => (
        //         <>
        //             <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        //                 <div className="relative flex h-16 justify-between">
        //                     <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
        //                         {/* Mobile menu button */}
        //                         <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-black focus:outline-none focus:ring-1 focus:ring-inset focus:rounded-none focus:ring-black">
        //                             <span className="sr-only">
        //                                 Open main menu
        //                             </span>
        //                             {open ? (
        //                                 <XMarkIcon
        //                                     className="block h-6 w-6"
        //                                     aria-hidden="true"
        //                                 />
        //                             ) : (
        //                                 <Bars3Icon
        //                                     className="block h-6 w-6"
        //                                     aria-hidden="true"
        //                                 />
        //                             )}
        //                         </Disclosure.Button>
        //                     </div>
        //                     <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
        //                         <div className="flex flex-shrink-0 items-center">
        //                             <Image
        //                                 className="block h-8 w-auto sm:block lg:block"
        //                                 src="/logo.svg"
        //                                 width="24"
        //                                 height="24"
        //                                 alt="Celo Logo"
        //                             />
        //                         </div>
        //                         <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
        //                             <a
        //                                 href="#"
        //                                 className="inline-flex items-center border-b-2 border-black px-1 pt-1 text-sm font-medium text-gray-900"
        //                             >
        //                                 Home
        //                             </a>
        //                         </div>
        //                     </div>
        //                     <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
        //                         {!hideConnectBtn && (
        //                             <ConnectButton
        //                                 showBalance={{
        //                                     smallScreen: true,
        //                                     largeScreen: false,
        //                                 }}
        //                             />
        //                         )}
        //                     </div>
        //                 </div>
        //             </div>

        //             <Disclosure.Panel className="sm:hidden">
        //                 <div className="space-y-1 pt-2 pb-4">
        //                     <Disclosure.Button
        //                         as="a"
        //                         href="#"
        //                         className="block border-l-4 border-black py-2 pl-3 pr-4 text-base font-medium text-black"
        //                     >
        //                         Home
        //                     </Disclosure.Button>
        //                     {/* Add here your custom menu elements */}
        //                 </div>
        //             </Disclosure.Panel>
        //         </>
        //     )}
        // </Disclosure>