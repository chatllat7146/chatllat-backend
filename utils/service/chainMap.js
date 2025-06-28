const CHAIN_CONFIG = {
    ethereum: {
        chainId: "0x1",
        rpcUrl: `https://mainnet.infura.io/v3/${process.env.MORALIS_API_KEY}`,
        // rpcUrl: process.env.ETH_RPC_URL,
        contractAddress: '0x1c46047afeb8cf5497ff87d4594c4420c1fdf400',
    },
    bsc: {
        chainId: "0x38",
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        contractAddress: '0x37a3be9dc677a1176aa757d6fd23098fc5ed6e90',
    },
    polygon: {
        chainId: "0x89",
        rpcUrl: 'https://polygon-rpc.com',
        contractAddress: '0xfbf4f538a698e5c090c43524e51fe69178ae7bc0',
    },
};

export default CHAIN_CONFIG