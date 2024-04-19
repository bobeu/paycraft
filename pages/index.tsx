// // import { useEffect, useState } from "react";
// // import { useAccount } from "wagmi";

// // export default function Home() {
// //     const [userAddress, setUserAddress] = useState("");
// //     const { address, isConnected } = useAccount();
    
// //     useEffect(() => {
// //         if (isConnected && address) {
// //             setUserAddress(address);
// //         }
// //     }, [address, isConnected]);

// //     return (
// //         <div className="flex flex-col justify-center items-center">
// //             <div className="h1">
// //                 There you go... a canvas for your next Celo project!
// //             </div>
// //             {isConnected ? (
// //                 <div className="h2 text-center">
// //                     Your address: {userAddress}
// //                 </div>
// //             ) : (
// //                 <div>No Wallet Connected</div>
// //             )}
// //         </div>
// //     );
// // }



// import * as React from 'react';
// import { PaletteMode } from '@mui/material';
// import CssBaseline from '@mui/material/CssBaseline';
// import Box from '@mui/material/Box';
// import Divider from '@mui/material/Divider';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import ToggleButton from '@mui/material/ToggleButton';
// import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
// import Header from '../components/Header';
// import Hero from '../components/Hero';
// import LogoCollection from '../components/LogoCollection';
// import Highlights from '../components/Highlights';
// import Pricing from '../components/Pricing';
// import Features from '../components/Features';
// import Testimonials from '../components/Testimonials';
// import FAQ from '../components/Faq';
// import Footer from '../components/Footer';
// import getLPTheme from '../components/getLpTheme';

// interface ToggleCustomThemeProps {
//   showCustomTheme: Boolean;
//   toggleCustomTheme: () => void;
// }

// function ToggleCustomTheme({
//   showCustomTheme,
//   toggleCustomTheme,
// }: ToggleCustomThemeProps) {
//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         width: '100dvw',
//         position: 'fixed',
//         bottom: 24,
//       }}
//     >
//       <ToggleButtonGroup
//         color="primary"
//         exclusive
//         value={showCustomTheme}
//         onChange={toggleCustomTheme}
//         aria-label="Platform"
//         sx={{
//           backgroundColor: 'background.default',
//           '& .Mui-selected': {
//             pointerEvents: 'none',
//           },
//         }}
//       >
//         <ToggleButton value>
//           <AutoAwesomeRoundedIcon sx={{ fontSize: '20px', mr: 1 }} />
//           Custom theme
//         </ToggleButton>
//         <ToggleButton value={false}>Material Design 2</ToggleButton>
//       </ToggleButtonGroup>
//     </Box>
//   );
// }

// export default function LandingPage() {
//   const [mode, setMode] = React.useState<PaletteMode>('light');
//   const [showCustomTheme, setShowCustomTheme] = React.useState(true);
//   const LPtheme = createTheme(getLPTheme(mode));
//   const defaultTheme = createTheme({ palette: { mode } });

//   const toggleColorMode = () => {
//     setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
//   };

//   const toggleCustomTheme = () => {
//     setShowCustomTheme((prev) => !prev);
//   };

//   return (
//     <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
//       <CssBaseline />
//       <Header mode={mode} toggleColorMode={toggleColorMode} />
//       <Hero />
//       <Box sx={{ bgcolor: 'background.default' }}>
//         {/* <LogoCollection /> */}
//         {/* <Features /> */}
//         {/* <Divider /> */}
//         {/* <Testimonials /> */}
//         {/* <Divider /> */}
//         {/* <Highlights /> */}
//         {/* <Divider /> */}
//         {/* <Pricing /> */}
//         {/* <Divider /> */}
//         <FAQ />
//         <Divider />
//         {/* <Footer /> */}
//       </Box>
//       <ToggleCustomTheme
//         showCustomTheme={showCustomTheme}
//         toggleCustomTheme={toggleCustomTheme}
//       />
//     </ThemeProvider>
//   );
// }



// import { useEffect, useState } from "react";
// import { useAccount } from "wagmi";

// export default function Home() {
//     const [userAddress, setUserAddress] = useState("");
//     const { address, isConnected } = useAccount();
    
//     useEffect(() => {
//         if (isConnected && address) {
//             setUserAddress(address);
//         }
//     }, [address, isConnected]);

//     return (
//         <div className="flex flex-col justify-center items-center">
//             <div className="h1">
//                 There you go... a canvas for your next Celo project!
//             </div>
//             {isConnected ? (
//                 <div className="h2 text-center">
//                     Your address: {userAddress}
//                 </div>
//             ) : (
//                 <div>No Wallet Connected</div>
//             )}
//         </div>
//     );
// }



import * as React from 'react';
import { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { AutoAwesomeMotionRounded, AutoAwesomeMosaicOutlined } from '@mui/icons-material';
import Header from '../components/Header';
import Employer from '../components/Employer';
import FAQ from '../components/Faq';
import Footer from '../components/Footer';
import getLPTheme from '../components/getLPTheme';
import AppMain from '@/components/AppMain';

// interface ToggleCustomThemeProps {
//   showCustomTheme: Boolean;
//   toggleCustomTheme: () => void;
// }

// function ToggleCustomTheme({ showCustomTheme, toggleCustomTheme }: ToggleCustomThemeProps) {
//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100dvw', position: 'fixed', bottom: 24,}}>
//       <ToggleButtonGroup
//         color="primary"
//         exclusive
//         value={showCustomTheme}
//         onChange={toggleCustomTheme}
//         aria-label="Platform"
//         sx={{
//           backgroundColor: 'background.default',
//           '& .Mui-selected': {
//             pointerEvents: 'visibleFill',
//           },
//         }}
//       >
//         <ToggleButton value>Employer</ToggleButton>
//         <ToggleButton value={false}>Employee</ToggleButton>
//       </ToggleButtonGroup>
//     </Box>
//   );
// }

export default function LandingPage() {
  // const [mode, setMode] = React.useState<PaletteMode>('light');
  // // const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  // const LPtheme = createTheme(getLPTheme(mode));
  // const defaultTheme = createTheme({ palette: { mode } });

  // const toggleCustomTheme = () => {
  //   setShowCustomTheme((prev) => !prev);
  // };

  return (
    <React.Fragment>
      {/* <CssBaseline /> */}
      <AppMain /> 
    </React.Fragment>
  );
}
// {/* { showCustomTheme? <Employer /> : <Employee /> } */}
// <Box sx={{ bgcolor: 'background.default' }}>
//   <FAQ />
// </Box>
// {/* <ToggleCustomTheme { ...{ showCustomTheme, toggleCustomTheme } } /> */}