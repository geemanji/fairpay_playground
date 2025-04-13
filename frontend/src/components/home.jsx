import React from 'react'
import { useState } from "react";
import { ThirdwebProvider, useAddress, useContract, useContractWrite, useConnectionStatus , ConnectWallet } from "@thirdweb-dev/react";


const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

function Home() {
 const address = useAddress();
   const { contract } = useContract(contractAddress);
   const { mutateAsync: createAgreement } = useContractWrite(contract, "createAgreement");
   const { mutateAsync: acceptAgreement } = useContractWrite(contract, "acceptAgreement");
   const { mutateAsync: releasePayment } = useContractWrite(contract, "releasePayment");
   const { mutateAsync: requestDelay } = useContractWrite(contract, "requestDelay");
 
   const [form, setForm] = useState({
     employee: "",
     termsCID: "",
     duration: "",
     dailyRate: ""
   });
   const [selectedAgreementId, setSelectedAgreementId] = useState("");
   const [delayReason, setDelayReason] = useState("");
 
   const handleCreateAgreement = async () => {
     try {
       const value = BigInt(form.dailyRate) * BigInt(form.duration);
       const tx = await createAgreement({
         args: [
           form.employee,
           form.termsCID,
           parseInt(form.duration),
           parseInt(form.dailyRate)
         ],
         overrides: {
           value: value.toString()
         }
       });
       alert("Agreement created: " + tx.receipt.transactionHash);
     } catch (err) {
       console.error(err);
       alert("Transaction failed");
     }
   };
  return (
    <>
    <div className="p-10 max-w-xl mx-auto">
     <h1 className="text-2xl font-bold mb-4">FairPay — Smart Wallet DApp</h1>
     <ConnectWallet />
     {address ? (
      <>
       <p className="text-sm mb-4">Connected: {address}</p>
       <div className="mb-4">
        <h2 className="text-lg font-semibold">Create Agreement</h2>
        <input type="text" placeholder="Employee Address" value={form.employee}
         onChange={(e) => setForm({ ...form, employee: e.target.value })}
         className="border p-2 mb-2 w-full" />
        <input type="text" placeholder="Terms CID (IPFS)" value={form.termsCID}
         onChange={(e) => setForm({ ...form, termsCID: e.target.value })}
         className="border p-2 mb-2 w-full" />
        <input type="number" placeholder="Duration (days)" value={form.duration}
         onChange={(e) => setForm({ ...form, duration: e.target.value })}
         className="border p-2 mb-2 w-full" />
        <input type="number" placeholder="Daily Rate (ETH)" value={form.dailyRate}
         onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
         className="border p-2 mb-2 w-full" />
        <button onClick={handleCreateAgreement} className="bg-green-600 text-white px-4 py-2 w-full rounded">
         Create Agreement
        </button>
       </div>

       <div className="mb-4">
        <h2 className="text-lg font-semibold">Manage Agreement</h2>
        <input type="number" placeholder="Agreement ID" value={selectedAgreementId}
         onChange={(e) => setSelectedAgreementId(e.target.value)}
         className="border p-2 mb-2 w-full" />
        <button onClick={() => acceptAgreement({ args: [parseInt(selectedAgreementId)] })}
         className="bg-purple-600 text-white px-4 py-2 mb-2 w-full rounded">
         Accept Agreement
        </button>
        <button onClick={() => releasePayment({ args: [parseInt(selectedAgreementId)] })}
         className="bg-yellow-600 text-white px-4 py-2 mb-2 w-full rounded">
         Release Payment
        </button>
        <input type="text" placeholder="Reason for Delay" value={delayReason}
         onChange={(e) => setDelayReason(e.target.value)}
         className="border p-2 mb-2 w-full" />
        <button onClick={() => requestDelay({ args: [parseInt(selectedAgreementId), delayReason] })}
         className="bg-red-600 text-white px-4 py-2 w-full rounded">
         Request Delay
        </button>
       </div>
      </>
     ) : (
      <p className="text-center">Waiting for email login...</p>
     )}
    </div>
    </>
  )
}

export default Home
