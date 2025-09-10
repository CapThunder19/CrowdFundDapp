import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ABI from "../abi/CrowdFunding.json";

const CONTRACT_ADDRESS = "0x55bDaFa6b9E7762684305615828A49589f4D7Ee5";

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCampaigns = async () => {
    setLoading(true);
    setError("");
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
      const ids = await contract.getAllCampaignIds();
      const details = await Promise.all(
        ids.map(async (id) => {
          const [owner, description, goal, deadline, amountRaised, withdrawn] = await contract.getCampaignDetails(id);
          let contributors = [];
          try {
            contributors = await contract.getContributors(id);
          } catch {}
          return {
            id: id.toString(),
            owner,
            description,
            goal: ethers.formatEther(goal),
            deadline: Number(deadline),
            amountRaised: ethers.formatEther(amountRaised),
            withdrawn,
            contributors,
          };
        })
      );
      setCampaigns(details);
    } catch (err) {
      setError(err.message || "Failed to fetch campaigns");
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (loading) return <div>Loading campaigns...</div>;
  if (error) return <div className="text-red-600">{error}</div>;


  const now = Math.floor(Date.now() / 1000);
  const activeCampaigns = campaigns.filter(c => now < c.deadline);
  const endedCampaigns = campaigns.filter(c => now >= c.deadline);

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-10">
      <h2 className="text-3xl font-extrabold mb-6 text-white drop-shadow-lg tracking-wide border-b-4 border-[#ff3f81] pb-2">Active Campaigns</h2>
      {activeCampaigns.length === 0 && <div className="text-lg text-gray-200">No campaigns found.</div>}
      <div className="space-y-8">
        {[...activeCampaigns].reverse().map((c) => (
          <div key={c.id} className="bg-gradient-to-br from-[#2d2346]/90 to-[#1a102a]/90 border border-[#ff3f81]/30 shadow-2xl rounded-2xl p-7 backdrop-blur-lg transition-transform hover:scale-[1.02]">
            <div className="font-extrabold text-2xl text-white mb-2 truncate tracking-wide">{c.description}</div>
            <div className="text-sm text-[#ff3f81] mb-1">Owner: <span className="font-mono text-blue-200">{c.owner}</span></div>
            <div className="flex flex-wrap gap-4 mb-2">
              <span className="bg-blue-700/80 text-blue-100 px-3 py-1 rounded-full text-xs font-semibold shadow">Goal: {c.goal} ETH</span>
              <span className="bg-[#ff3f81]/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">Raised: {c.amountRaised} ETH</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">
              <span className="font-semibold text-white">Contributors:</span>
              {c.contributors && c.contributors.length > 0 ? (
                <span className="ml-2">
                  {c.contributors.map((addr, i) => (
                    <span key={addr} className="inline-block font-mono bg-gray-800/60 text-blue-200 px-2 py-0.5 rounded mr-1 text-[11px] align-middle">
                      {addr.slice(0, 6)}...{addr.slice(-4)}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="ml-2 text-gray-500">None</span>
              )}
            </div>
            <div className="text-xs text-gray-300 mb-2">Deadline: <span className="font-mono text-white">{new Date(c.deadline * 1000).toLocaleString()}</span></div>
            <div className="text-xs text-gray-500 mb-2">Current time: {now} | Deadline (unix): {c.deadline}</div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <DonateButton campaignId={c.id} onAction={fetchCampaigns} />
              <WithdrawButton campaign={c} onAction={fetchCampaigns} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-3xl font-extrabold mb-6 mt-16 text-white drop-shadow-lg tracking-wide border-b-4 border-gray-400 pb-2">Ended Campaigns</h2>
      {endedCampaigns.length === 0 && <div className="text-lg text-gray-400">No ended campaigns.</div>}
      <div className="space-y-8">
        {[...endedCampaigns].reverse().map((c) => (
          <div key={c.id} className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-[#ff3f81]/20 shadow-xl rounded-2xl p-7 backdrop-blur-lg opacity-90">
            <div className="font-extrabold text-2xl text-white mb-2 truncate tracking-wide">{c.description}</div>
            <div className="text-sm text-[#ff3f81] mb-1">Owner: <span className="font-mono text-gray-200">{c.owner}</span></div>
            <div className="flex flex-wrap gap-4 mb-2">
              <span className="bg-gray-700/80 text-gray-100 px-3 py-1 rounded-full text-xs font-semibold shadow">Goal: {c.goal} ETH</span>
              <span className="bg-[#ff3f81]/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">Raised: {c.amountRaised} ETH</span>
            </div>
            <div className="text-xs text-gray-300 mb-2">Deadline: <span className="font-mono text-white">{new Date(c.deadline * 1000).toLocaleString()}</span></div>
            <div className="text-xs text-gray-500 mb-2">Ended at (unix): {c.deadline}</div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <WithdrawButton campaign={c} onAction={fetchCampaigns} />
              <RefundButton campaign={c} onAction={fetchCampaigns} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function RefundButton({ campaign, onAction }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEligible, setIsEligible] = useState(false);
  useEffect(() => {
    async function checkEligibility() {
      if (!window.ethereum) return setIsEligible(false);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
        const contributed = await contract.getContribution(Number(campaign.id), accounts[0]);
        setIsEligible(Number(contributed) > 0);
      } catch {
        setIsEligible(false);
      }
    }
    checkEligibility();
  }, [campaign.id]);
  const now = Math.floor(Date.now() / 1000);
  const canRefund = now > campaign.deadline && Number(campaign.amountRaised) < Number(campaign.goal) && isEligible;
  const handleRefund = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
      const tx = await contract.refund(Number(campaign.id));
      await tx.wait();
      setSuccess("Refund successful!");
      if (typeof onAction === 'function') onAction();
    } catch (err) {
      setError(err.message || "Refund failed");
    }
    setLoading(false);
  };
  if (!canRefund) return null;
  return (
    <div className="mt-2">
      <button
        onClick={handleRefund}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Refunding..." : "Refund"}
      </button>
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      {success && <div className="text-blue-400 text-sm mt-1">{success}</div>}
    </div>
  );
}

function WithdrawButton({ campaign, onAction }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleWithdraw = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
      const tx = await contract.withdraw(Number(campaign.id));
      await tx.wait();
      setSuccess("Withdraw successful!");
      if (typeof onAction === 'function') onAction();
    } catch (err) {
      setError(err.message || "Withdraw failed");
    }
    setLoading(false);
  };

  const now = Date.now() / 1000;
  const canWithdraw = !campaign.withdrawn && Number(campaign.amountRaised) >= Number(campaign.goal) && now > campaign.deadline;

  if (!canWithdraw) return null;

  return (
    <div className="mt-2">
      <button
        onClick={handleWithdraw}
        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Withdrawing..." : "Withdraw"}
      </button>
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
  {success && <div className="text-[#ff3f81] text-sm mt-1">{success}</div>}
    </div>
  );
}

function DonateButton({ campaignId, onAction }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleDonate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
      const value = ethers.parseEther(amount.toString());
      const tx = await contract.contribute(Number(campaignId), { value });
      await tx.wait();
      setSuccess("Thank you for your donation!");
      setAmount("");
      if (typeof onAction === 'function') onAction();
    } catch (err) {
      setError(err.message || "Donation failed");
    }
    setLoading(false);
  };

  return (
    <div className="mt-2 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      <input
        type="number"
        className="border-2 border-[#ff3f81] rounded-lg px-3 py-2 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#ff3f81] transition w-40"
        placeholder="ETH amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        min="0.0001"
        step="0.0001"
      />
      <button
        onClick={handleDonate}
        className="bg-[#ff3f81] text-white px-5 py-2 rounded-lg font-semibold text-base shadow hover:bg-pink-600 transition disabled:opacity-50"
        disabled={loading || !amount}
      >
        {loading ? "Donating..." : "Donate"}
      </button>
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      {success && <div className="text-[#ff3f81] text-sm mt-1">{success}</div>}
    </div>
  );
}
