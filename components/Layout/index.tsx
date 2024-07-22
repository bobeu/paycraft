import { AppBar, Container, Toolbar } from '@mui/material';
import React from 'react';
import Header from '../Header';
import Footer from '../Footer';

export default function Layout({lightMode, isEmployer, children} : LayoutProps) {

    return(
        <Container>
            <Header isEmployer={isEmployer} />
            <main className={`h-ful`}>
                { children }
            </main>
            {/* <Footer /> */}
        </Container>
    );
}

interface LayoutProps {
    isEmployer: boolean;
    children: React.ReactNode;
    lightMode: boolean;
}