import { useDisconnect, useAccount, useConnect } from "wagmi";

export function WalletOption() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { connectors, connect } = useConnect();

    if (isConnected) {
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