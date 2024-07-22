import React from 'react';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
import { Spinner } from '../Spinner';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const renderNode = (selector: number, handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void, handleLogin?: () => void) => {
    let node : React.ReactNode = <></>;
    switch (selector) {
        case 0:
            node = <div className='flex flex-col justify-center items-center text-center'>
                <Image 
                    src={'/employerfreepick/Wavy_Bus-08_Single-02.jpg'}
                    width={300}
                    height={300}
                    alt={'projectLogo'}
                />
                <h1 className='text-2xl font-semibold text-wood'>PayCraft</h1>
            </div>
            break;
        case 1:
            node = <div className='flex justify-center items-center p-[100px] mt-4 rounded-lg '>
                        <Spinner color={'blue'} />
                    </div>
            break;

        case 2:
            node = <Box className='mt-4 bg-blue-200 rounded-lg h-[500px]'>
                <Stack className='rounded-lg text-wood place-items-center p-4 space-y-2 text-center'>
                    <div className='space-y-4 w-full '>
                        <h3 className='text-3xl font-black'>Logo here</h3>
                        <div className=''>
                            <h3>{`Welcome back!`}</h3>
                            <h3>{`Log in to your account`}</h3>
                        </div>
                        <button className='border border-blue-200 font-semibold rounded p-3 w-full text-sm bg-white'>
                            Continue with Google
                        </button>
                        <h3>Or</h3>
                        <div className='space-y-2'>
                            <h3 className='text-start'>Phone number</h3>
                            <input 
                                // focused
                                type='number'
                                defaultValue={'234'}
                                placeholder={'Phone number'}
                                className='border border-blue-200 font-semibold rounded p-3 w-full text-sm'
                                onChange={handleChange}
                            />
                            <button onClick={() => handleLogin?.()} className='rounded bg-blue-600 w-full p-2 text-white hover:bg-opacity-70 active:bg-opacity-70'>
                                Login
                            </button>
                        </div>
                    </div>
                    <div className='w-full text-start' style={{marginTop: '20px'}}>
                        <h3>{'New to PayCraft?'}</h3>
                        <button onClick={() => handleLogin?.()} className='rounded bg-blue-600 w-full p-2 text-white hover:bg-opacity-70 active:bg-opacity-70'>
                            SignUp
                        </button>
                    </div>
                </Stack>
            </Box> 
    
        default:
            break;
    }
    return node;
}

export default function SignIn({connect} : {connect: () => void}) {
    const setPhoneDetail = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setPhoneNumber(event.target.value);
        console.log(event.target.value);
    }

    const [stepper, setStepper] = React.useState<number>(0);
    const [node, setNode] = React.useState<React.ReactNode>(renderNode(0, setPhoneDetail));
    const [phoneNumber, setPhoneNumber] = React.useState<string>('');
    
    const handleLogin = () => {
        if(phoneNumber !== '') {
            console.log("it runs")
            connect();
        }
    }

    React.useEffect(() => {
        setTimeout(() => {
            setNode(renderNode(1, setPhoneDetail));
            setStepper((prev) => prev + 1);
        }, 6000);
    }, []);

    React.useEffect(() => {
        if(stepper > 0) {
            setTimeout(() => {
                setNode(renderNode(2, setPhoneDetail, handleLogin));
            }, 8000);
        }
        return clearTimeout(8000);
    }, [stepper]);

    return node;
}
