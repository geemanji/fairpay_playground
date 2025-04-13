import { ThirdwebProvider, useAddress, useContract, useContractWrite, useConnectionStatus } from "@thirdweb-dev/react";
import { SmartWallet, EmbeddedWallet } from "@thirdweb-dev/wallets";
import { Sepolia } from "@thirdweb-dev/chains";
import Home from "../components/home";


const smartWalletConfig = new SmartWallet({
  factoryAddress: "0x85e23b94e7F5E9cC1fF78BCe78cfb15B81f0DF00", // From Thirdweb dashboard
  gasless: true,
  clientId: "3a8ca3bc43ced4b5845e82e617de0705",
  chain: Sepolia,
  bundlerUrl: "https://bundler.thirdweb.com", // Optional if clientId handles it
  paymasterUrl: "https://paymaster.thirdweb.com"
});

const embeddedWallet = new EmbeddedWallet({
  chain: Sepolia,
  clientId: "3a8ca3bc43ced4b5845e82e617de0705"
})

const wallets = [embeddedWallet];
// 8JcEaWsNO6ol9ZLVXVMJMbO3BMU1ZP2p0xHHI7BwrlFHMXK - xkiK34WPCVG7TdRHW3FFN0ZzdU7lBuTq4aCkVQ
export default function App() {
  

  return (
    <ThirdwebProvider
      clientId="3a8ca3bc43ced4b5845e82e617de0705"
      activeChain={Sepolia}
      supportedWallets={wallets}
      smartWalletConfig={smartWalletConfig}
    >
      <Home/>
    </ThirdwebProvider>
  );
}
