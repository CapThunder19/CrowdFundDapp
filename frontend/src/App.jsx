

import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './component/config'
import { Navbar } from './component/Navbar'
import CreateCampaign from './component/CreateCampaign'
import CampaignList from './component/CampaignList'
import { useEffect, useRef } from 'react'

const queryClient = new QueryClient()


function App() {
  const vantaRef = useRef(null);
  useEffect(() => {
    let vantaEffect;
   
    const loadScript = (src) => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    (async () => {
      if (!window.VANTA) {
        await loadScript('/three.r134.min.js');
        await loadScript('/vanta.net.min.js');
      }
      if (window.VANTA && window.VANTA.NET && vantaRef.current) {
        vantaEffect = window.VANTA.NET({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00
        });
      }
    })();
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div>
          <div ref={vantaRef} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:-1}}></div>
          <Navbar />
          <div className="pt-20">
            <CreateCampaign />
            <CampaignList />
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App
