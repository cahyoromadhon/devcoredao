import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const NFT_PACKAGE_ID = process.env.NFT_PACKAGE_ID
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const REQUIRED_NFT_TYPE = `${NFT_PACKAGE_ID}::nft::MyNFT`;
const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Hanya POST" });
  }

  try {
    const { address, vote_choice } = req.body;

    if (!address || !vote_choice) {
      return res.status(400).json({ success: false, message: "Alamat atau pilihan suara tidak ada." });
    }

    console.log(`Menerima vote: ${address} memilih ${vote_choice}`);

    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: { StructType: REQUIRED_NFT_TYPE },
      options: { showType: false },
      limit: 1,
    });

    if (objects.data.length > 0) {
      console.log(`Kualifikasi SUKSES: ${address} memiliki NFT.`);

      const proposalIdSaatIni = "proposal_1"; // Nanti ini bisa dinamis

      const { data, error } = await supabase
        .from('votes')
        .insert([
          {
            proposal_id: proposalIdSaatIni,
            voter_address: address,
            vote_choice: vote_choice
          }
        ]);

      if (error) {
        console.error("Gagal menulis ke Supabase:", error);
        return res.status(200).json({ success: true, message: "Verifikasi OK, tapi gagal catat suara (DB Error)." });
      } else {
        console.log("Berhasil mencatat suara ke Supabase:", data);
        return res.status(200).json({ success: true, message: "Suara terverifikasi dan dicatat!" });
      }

    } else {
      console.log(`Kualifikasi GAGAL: ${address} tidak memiliki NFT.`);
      return res.status(403).json({ success: false, message: "Anda tidak memegang NFT yang disyaratkan." });
    }

  } catch (error) {
    console.error("Error di Backend:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}