import { ethers } from "ethers";

export const signWithdrawal = async (userAddress, amount, privateKey) => {
    try {
        // Create wallet from private key
        const wallet = new ethers.Wallet(privateKey);

        // Create message hash (same as contract's getMessageHash)
        const messageHash = ethers.solidityPackedKeccak256(
            ["address", "uint256"],
            [userAddress, amount]
        );

        // Sign the message hash
        const signature = await wallet.signMessage(
            ethers.getBytes(messageHash)
        );

        return {
            messageHash,
            signature,
            signer: wallet.address,
        };
    } catch (error) {
        throw error;
    }
};
