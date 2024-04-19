import * as React from 'react';
import AppMain from '@/components/AppMain';
import { useAccount, useConnect } from 'wagmi';

export default function Index() {
  const { address, isConnected, connector } = useAccount();
  const { connect } = useConnect();

  React.useEffect(() => {
      if (isConnected && connector) {
          connect({connector});
      }
  }, [address, isConnected]);
  
  return (
    <React.Fragment>
      <AppMain /> 
    </React.Fragment>
  );
}