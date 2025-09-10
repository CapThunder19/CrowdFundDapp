import { useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import ABI from "../abi/CrowdFunding.json";

export default function CreateCampaign() {
  const { isConnected } = useAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if(!window.ethereum) {
      setError("Please connect to MetaMask");
      setLoading(false);
      return;
    }
    if(!isConnected){
      setError("connect to wallet");
      setLoading(false);
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  const campaignContract = new ethers.Contract("0x55bDaFa6b9E7762684305615828A49589f4D7Ee5", ABI.abi, signer);
      
      if (!goal || isNaN(goal)) {
        setError("enter a valid ETH amount");
        setLoading(false);
        return;
      }
      const goalInWei = ethers.parseEther(goal.toString());
      await campaignContract.createCampaign(description, goalInWei, duration);
      setTitle("");
      setDescription("");
      setGoal("");
      setDuration("");
    } catch (err) {
      setError(err.message || "Failed to create campaign");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-[#ff3f81]/30 shadow-2xl rounded-2xl max-w-lg mx-auto mt-12 p-8 backdrop-blur-md">
      <h2 className="text-2xl font-extrabold mb-4 text-white tracking-wide border-b-4 pb-2" style={{ borderColor: '#ff3f81' }}>Create Campaign</h2>
      <div>
        <label className="block mb-2 font-semibold text-[#ff3f81]">Topic</label>
        <input
          type="text"
          className="w-full rounded-lg px-4 py-2 text-white bg-gray-900 border-2 focus:outline-none focus:ring-2 focus:ring-[#ff3f81] transition"
          style={{ borderColor: '#ff3f81' }}
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-2 font-semibold text-[#ff3f81]">Description</label>
        <input
          type="text"
          className="w-full rounded-lg px-4 py-2 text-white bg-gray-900 border-2 focus:outline-none focus:ring-2 focus:ring-[#ff3f81] transition"
          style={{ borderColor: '#ff3f81' }}
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-2 font-semibold text-[#ff3f81]">Goal (in ETH)</label>
        <input
          type="number"
          className="w-full rounded-lg px-4 py-2 text-white bg-gray-900 border-2 focus:outline-none focus:ring-2 focus:ring-[#ff3f81] transition"
          style={{ borderColor: '#ff3f81' }}
          value={goal}
          onChange={e => setGoal(e.target.value)}
          min="0.0001"
          step="0.0001"
          required
        />
      </div>
      <div>
        <label className="block mb-2 font-semibold text-[#ff3f81]">Duration (seconds)</label>
        <input
          type="number"
          className="w-full rounded-lg px-4 py-2 text-white bg-gray-900 border-2 focus:outline-none focus:ring-2 focus:ring-[#ff3f81] transition"
          style={{ borderColor: '#ff3f81' }}
          value={duration}
          onChange={e => setDuration(e.target.value)}
          required
          min="1"
        />
      </div>
      {error && <div className="font-semibold text-center" style={{ color: '#ff3f81' }}>{error}</div>}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-[#ff3f81] to-pink-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg hover:from-pink-600 hover:to-[#ff3f81] transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Campaign"}
      </button>
    </form>
  );
}
