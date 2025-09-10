import { WalletOption } from "./WalletOption";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
            <h1 className="text-2xl font-bold text-[#ff3f81] hover:text-green-300">Crowd Funding Dapp</h1>
            <WalletOption />
        </nav>
    );
}