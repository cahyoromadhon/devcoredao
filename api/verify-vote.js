// api/verify-vote.js

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const NFT_PACKAGE_ID = process.env.NFT_PACKAGE_ID;
const SUI_NETWORK = process.env.SUI_NETWORK || "testnet";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !NFT_PACKAGE_ID) {
    console.error("Missing required environment variables!");
    throw new Error("Missing required environment variables.");
}

// Inisialisasi Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Ganti StructType menggunakan variabel
const REQUIRED_NFT_TYPE = `${NFT_PACKAGE_ID}::nft::MyNFT`; // Pastikan nama modul dan struct benar
// Gunakan SUI_NETWORK
const suiClient = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) });

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    // Ambil data dari body POST
    const { address, vote_choice } = req.body;

    // --- Ambil proposalId dari Query Parameter URL ---
    // URL dari bot akan seperti: ...vercel.app/api/verify-vote?proposalId=proposal_123
    const proposalId = req.query.proposalId;
    // ------------------------------------------------

    // Validasi input
    if (!address || !vote_choice || !proposalId) {
      console.log("Missing data:", { address, vote_choice, proposalId });
      return res.status(400).json({ success: false, message: "Data tidak lengkap (alamat, pilihan suara, atau proposal ID)." });
    }

    console.log(`Menerima vote: ${address} memilih ${vote_choice} untuk ${proposalId}`);

    // --- Cek Kepemilikan NFT ---
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: { StructType: REQUIRED_NFT_TYPE },
      options: { showType: false }, // Tidak perlu tipe, hanya cek keberadaan
      limit: 1, // Hanya perlu 1 untuk konfirmasi
    });

    if (objects.data.length > 0) {
      console.log(`Kualifikasi SUKSES: ${address} memiliki NFT.`);

      // --- TULIS KE SUPABASE (Gunakan proposalId) ---
      const { data, error } = await supabase
        .from('votes')
        .insert([
          {
            proposal_id: proposalId, // <-- Gunakan ID dari URL
            voter_address: address,
            vote_choice: vote_choice
          }
        ])
        .select(); // Tambahkan .select() untuk mendapatkan data yang baru dimasukkan (jika perlu)

      if (error) {
        // Log error Supabase yang lebih detail
        console.error("Gagal menulis ke Supabase:", error.message, error.details, error.hint);
        // Tetap kirim sukses ke frontend, tapi beri catatan
        return res.status(200).json({ success: true, message: "Verifikasi OK, tapi gagal catat suara (DB Error)." });
      } else {
        console.log("Berhasil mencatat suara ke Supabase:", data);
        return res.status(200).json({ success: true, message: `Suara untuk ${proposalId} terverifikasi dan dicatat!` });
      }
      // --- AKHIR TULIS SUPABASE ---

    } else {
      console.log(`Kualifikasi GAGAL: ${address} tidak memiliki NFT.`);
      return res.status(403).json({ success: false, message: "Anda tidak memegang NFT yang disyaratkan." });
    }

  } catch (error) {
    console.error("Error di Backend:", error); // Log error asli
    // Kirim pesan error yang lebih umum ke frontend
    return res.status(500).json({ success: false, message: "Terjadi kesalahan internal pada server." });
  }
}