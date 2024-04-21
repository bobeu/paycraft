import * as React from 'react';
import AppMain from '@/components/AppMain';
import { useAccount, useConnect } from 'wagmi';
import { config, connectors } from '@/config';
import { connect } from "wagmi/actions";
import { injected } from "wagmi/connectors";
export default function Index() {
  const { address, isConnected, } = useAccount();
  // const { connect } = useConnect(config);
 
  React.useEffect(() => {
    if(window.ethereum && window.ethereum.isMinipay && !isConnected){
      connect(config, { connector: injected()});
    }
  }, [address, isConnected]);
  
  return (
    <React.Fragment>
      <AppMain /> 
    </React.Fragment>
  );
}