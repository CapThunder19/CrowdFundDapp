
import { useDisconnect, useAccount, useConnect, useNetwork, useSwitchNetwork } from "wagmi";


export function WalletOption() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { connectors, connect } = useConnect();
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();
    const SEPOLIA_CHAIN_ID = 11155111;


    if (isConnected) {
        
        if (chain && chain.id !== SEPOLIA_CHAIN_ID && switchNetwork) {
            return (
                <div>
                    <p className="mb-2 text-yellow-300">Wrong network: {chain.name}</p>
                    <button
                        onClick={() => switchNetwork(SEPOLIA_CHAIN_ID)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow transition mb-2"
                    >
                        Switch to Sepolia
                    </button>
                    <button
                        onClick={() => disconnect()}
                        className="bg-[#ff3f81] hover:bg-[#ff3f81]-600 text-white px-4 py-2 rounded-lg shadow transition"
                    >
                        Disconnect
                    </button>
                </div>
            );
        }
        return (
            <div>
                <p>Connected as {address}</p>
                <button
                    onClick={() => disconnect()}
                    className="bg-[#ff3f81] hover:bg-[#ff3f81]-600 text-white px-4 py-2 rounded-lg shadow transition"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => connect({ connector: connectors[0] })}
                className="bg-[#ff3f81] hover:bg-[#ff3f81]-600 text-white px-4 py-2 rounded-lg shadow transition"
            >
                Connect Wallet
            </button>
        </div>
    );
}