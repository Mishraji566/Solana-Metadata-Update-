import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js"
import * as anchor from '@project-serum/anchor'

export function loadWalletKey(keypairFile: string): web3.Keypair {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
}



async function main() {
    console.log("Let's name some tokens");

    const myKeypair = loadWalletKey("APiRddQndpCUv4fM1JJZSDnGa4o1kfqT35q19qx2KVfT.json")
    console.log(myKeypair.publicKey.toBase58())
    const mint = new web3.PublicKey("C2AUhXei1T8sCMFjxpPeQoosae1chjE4S15DvASYStwB")


    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.toBytes());

    const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);


    const accounts = {
        metadata: metadataPDA,
        mint,
        mintAuthority: myKeypair.publicKey,
        payer: myKeypair.publicKey,
        updateAuthority: myKeypair.publicKey,
    }


    const dataV2 = {
        name: "Deadpool",
        symbol: "DP",
        uri: "https://gateway.pinata.cloud/ipfs/QmUAeVSwhVrBmtNhVUsB6r1BgBJgpZekpwYNjopvAYyN37?_gl=1*1f2bqcy*_ga*MTkyNzQzMDM2Ny4xNjc3ODYyNDI4*_ga_5RMPXG14TE*MTY3NzkxNjUyMS4yLjEuMTY3NzkxNzQ0OC41Mi4wLjA.",
        // we don't need that
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    }

    const args = {
        createMetadataAccountArgsV2: {
            data: dataV2,
            isMutable: true
        }
    };

    const ix = mpl.createCreateMetadataAccountV2Instruction(accounts, args);
    const tx = new web3.Transaction();
    tx.add(ix);
    const connection = new web3.Connection("https://api.devnet.solana.com");
    const txid = await web3.sendAndConfirmTransaction(connection, tx, [myKeypair]);
    console.log(txid);



}

main()