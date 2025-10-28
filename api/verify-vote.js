// api/verify-vote.js

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
// --- TAMBAHAN: Import Supabase ---
import { createClient } from "@supabase/supabase-js";

// --- KONFIGURASI SUPABASE (GANTI INI!) ---
// Masukkan URL dan Key Supabase Anda di sini
const SUPABASE_URL = "https://tpvpyhlsfxbyctfbeigp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdnB5aGxzZnhieWN0ZmJlaWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDgzMzEsImV4cCI6MjA3NzE4NDMzMX0.MyYCE-LWPXYAuHK7CfBoJWc3B4IPq3r5PDYKX_E3EJQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ------------------------------------

// Ganti ini dengan Tipe Objek NFT DAO-mu yang sebenarnya
const REQUIRED_NFT_TYPE = "0xd7af24b51f28bd5ffae74b5a14e7b1abd21d51dd055357ffb317fe3506dedbd7::nft::MyNFT";
// Pastikan ini terhubung ke jaringan yang benar (testnet atau mainnet)
const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Hanya POST" });
  }

  try {
    // Ambil vote_choice dari frontend
    const { address, vote_choice } = req.body;

    if (!address || !vote_choice) {
      return res.status(400).json({ success: false, message: "Alamat atau pilihan suara tidak ada." });
    }

    console.log(`Menerima vote: ${address} memilih ${vote_choice}`);

    // --- Cek Kepemilikan NFT ---
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: { StructType: REQUIRED_NFT_TYPE },
      options: { showType: false },
      limit: 1,
    });

    if (objects.data.length > 0) {
      console.log(`Kualifikasi SUKSES: ${address} memiliki NFT.`);

      // --- TULIS KE SUPABASE ---
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
        // Tetap kirim sukses ke frontend, tapi beri catatan
        return res.status(200).json({ success: true, message: "Verifikasi OK, tapi gagal catat suara (DB Error)." });
      } else {
        console.log("Berhasil mencatat suara ke Supabase:", data);
        return res.status(200).json({ success: true, message: "Suara terverifikasi dan dicatat!" });
      }
      // --- AKHIR TULIS SUPABASE ---

    } else {
      console.log(`Kualifikasi GAGAL: ${address} tidak memiliki NFT.`);
      return res.status(403).json({ success: false, message: "Anda tidak memegang NFT yang disyaratkan." });
    }

  } catch (error) {
    console.error("Error di Backend:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}