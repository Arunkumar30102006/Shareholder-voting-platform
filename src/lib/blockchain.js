/**
 * Utility functions for Blockchain simulations and cryptographic hashing
 */
// Generate a verifiable SHA-256 hash of the vote
export const generateVoteHash = async (shareholderId, resolutionId, voteValue, timestamp) => {
    const data = `${shareholderId}-${resolutionId}-${voteValue}-${timestamp}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return `0x${hashHex}`;
};
// Simulate a blockchain transaction (Polygon Amoy Testnet)
export const simulateBlockchainTransaction = async (delayMs = 800) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    // Generate a random mock transaction hash
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const txHash = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return `0x${txHash}`;
};
export const getExplorerLink = (txHash) => {
    return `https://amoy.polygonscan.com/tx/${txHash}`;
};
