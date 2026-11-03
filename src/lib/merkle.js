/**
 * Merkle Tree Implementation for Vote Verification
 *
 * A Merkle Tree aggregates all vote hashes into a single Root Hash.
 * If any single vote changes, the Root Hash changes.
 * This allows us to "anchor" thousands of votes to a blockchain using just one hash.
 */
// Helper to hash a string using the same algorithm as the votes (SHA-256)
export const sha256 = async (data) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
export class MerkleTree {
    leaves;
    layers;
    constructor(leaves) {
        this.leaves = leaves;
        this.layers = [];
        // Build tree immediately
        // this.build(); // Can't call async in constructor easily, so we'll use a static method or init
    }
    static async create(leaves) {
        const tree = new MerkleTree(leaves);
        await tree.build();
        return tree;
    }
    async build() {
        if (this.leaves.length === 0) {
            this.layers = [['']];
            return;
        }
        let layer = this.leaves;
        this.layers.push(layer);
        while (layer.length > 1) {
            const newLayer = [];
            for (let i = 0; i < layer.length; i += 2) {
                if (i + 1 < layer.length) {
                    // Hash pair
                    newLayer.push(await sha256(layer[i] + layer[i + 1]));
                }
                else {
                    // Carry over odd element
                    newLayer.push(layer[i]);
                }
            }
            layer = newLayer;
            this.layers.push(layer);
        }
    }
    getRoot() {
        if (this.layers.length === 0)
            return '';
        return this.layers[this.layers.length - 1][0];
    }
    getProof(leafIndex) {
        const proof = [];
        let index = leafIndex;
        for (let i = 0; i < this.layers.length - 1; i++) {
            const layer = this.layers[i];
            const isRightNode = index % 2 === 1;
            const pairIndex = isRightNode ? index - 1 : index + 1;
            if (pairIndex < layer.length) {
                proof.push({
                    position: isRightNode ? 'left' : 'right',
                    data: layer[pairIndex]
                });
            }
            index = Math.floor(index / 2);
        }
        return proof;
    }
    static async verify(root, leaf, proof) {
        let hash = leaf;
        for (const node of proof) {
            if (node.position === 'left') {
                hash = await sha256(node.data + hash);
            }
            else {
                hash = await sha256(hash + node.data);
            }
        }
        return hash === root;
    }
}
