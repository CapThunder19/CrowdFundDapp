
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './component/config'
import { Navbar } from './component/Navbar'
import CreateCampaign from './component/CreateCampaign'
import CampaignList from './component/CampaignList'

const queryClient = new QueryClient()

function App() {
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <div><Navbar />
        <div className="pt-20">
          <CreateCampaign />
          <CampaignList />
        </div>
        
        </div>
        
      </QueryClientProvider> 
    </WagmiProvider>
  )
}

export default App
