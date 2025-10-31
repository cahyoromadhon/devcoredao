import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const NFT_PACKAGE_ID = process.env.NFT_PACKAGE_ID;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !NFT_PACKAGE_ID) {
    console.error("Missing required environment variables!");
    throw new Error("Missing required environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const REQUIRED_NFT_TYPE = `${NFT_PACKAGE_ID}::nft::MyNFT`;
const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });

async function getVoteStatus(address, voteId) {
    // 1. Cek total NFT yang dimiliki
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: { StructType: REQUIRED_NFT_TYPE },
      options: { showType: false }, // Tidak perlu konten, hanya jumlah
    });
    const totalNFTs = objects.data.length;

    if (totalNFTs === 0) {
        return { totalNFTs: 0, usedVotes: 0, remainingVotes: 0 };
    }

    // 2. Cek vote yang sudah digunakan di Supabase
    const { data: usedVotesData, error } = await supabase
        .from('votes')
        .select('voter_address', { count: 'exact' }) // Hanya hitung jumlah
        .eq('vote_id', voteId)
        .eq('voter_address', address);

    if (error) {
        console.error("Gagal mengecek vote (select):", error.message);
        throw new Error("Internal server error (DB Check).");
    }

    const usedVotes = usedVotesData ? usedVotesData.length : 0;
    
    // 3. Hitung sisa
    const remainingVotes = totalNFTs - usedVotes;

    return { totalNFTs, usedVotes, remainingVotes };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
      try {
          const { address, voteId } = req.query;
          if (!address || !voteId) {
              return res.status(400).json({ success: false, message: "Alamat atau vote ID tidak ada." });
          }
          const status = await getVoteStatus(address, voteId);
          return res.status(200).json({ success: true, ...status });
      } catch (error) {
          console.error("Error di GET /api/verify-vote:", error);
          return res.status(500).json({ success: false, message: error.message });
      }
  }

  if (req.method === "POST") {
    try {
      const { address, vote_choice } = req.body;
      const voteId = req.query.voteId; 

      if (!address || !vote_choice || !voteId) {
        console.error("Validation failed. Missing data:", { address, vote_choice, voteId }); 
        return res.status(400).json({ success: false, message: "Data tidak lengkap (alamat, pilihan suara, atau vote ID)." });
      }

      console.log(`Menerima vote: ${address} memilih ${vote_choice} untuk ${voteId}`);

      const { totalNFTs, usedVotes, remainingVotes } = await getVoteStatus(address, voteId);

      if (totalNFTs === 0) {
          console.log(`Kualifikasi GAGAL: ${address} tidak memiliki NFT.`);
          return res.status(403).json({ success: false, message: "Anda tidak memegang NFT yang disyaratkan." });
      }

      if (remainingVotes <= 0) {
          console.log(`Vote DITOLAK: ${address} sudah menggunakan semua ${totalNFTs} suaranya untuk ${voteId}.`);
          return res.status(409).json({ success: false, message: "Anda sudah menggunakan semua suara Anda untuk ID ini." });
      }
      
      console.log(`Kualifikasi SUKSES: ${address} memiliki ${remainingVotes} suara tersisa.`);

      const { data, error } = await supabase
        .from('votes')
        .insert([
          {
            vote_id: voteId, 
            voter_address: address,
            vote_choice: vote_choice,
            vote_weight: 1
          }
        ])
        .select();

      if (error) {
        console.error("Gagal menulis ke Supabase:", error.message);
        return res.status(500).json({ success: false, message: "Gagal mencatat suara (DB Insert Error)." });
      } else {
        console.log("Berhasil mencatat suara ke Supabase:", data);
        return res.status(200).json({ 
            success: true, 
            message: `Vote Berhasil Dicatat!`
        });
      }

    } catch (error) {
      console.error("Error di Backend:", error);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan internal pada server." });
    }
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}