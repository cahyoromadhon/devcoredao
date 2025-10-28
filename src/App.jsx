import "./App.css";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
// Tidak perlu Buffer atau useSignPersonalMessage

// --- TAMBAHAN: Import useEffect dan useState ---
import { useState, useEffect } from 'react';
// ---------------------------------------------

function App() {
  const account = useCurrentAccount();
  
  const [proposalId, setProposalId] = useState(null);

  useEffect(() => {
    // Ambil query parameter dari URL browser saat ini
    const queryParams = new URLSearchParams(window.location.search);
    const idFromUrl = queryParams.get('proposalId'); // Cari parameter 'proposalId'
    if (idFromUrl) {
      console.log("Proposal ID ditemukan di URL:", idFromUrl);
      setProposalId(idFromUrl); // Simpan ID ke state
    } else {
      console.warn("Proposal ID tidak ditemukan di URL query parameters.");
    }
  }, []); // [] berarti hanya dijalankan sekali saat komponen mount
  // -------------------------------------------------------------

  const handleVerifyVote = (pilihan) => {
    // --- TAMBAHAN: Cek apakah proposalId sudah terbaca ---
    if (!proposalId) {
        alert("Error: Proposal ID tidak ditemukan. Pastikan link dari bot benar.");
        return;
    }
    // ----------------------------------------------------

    if (!account) { /* ... (cek dompet tetap sama) ... */ }

    console.log(`Mengirim vote: ${account.address} memilih ${pilihan} untuk ${proposalId}`);

    // Data yang dikirim: alamat, pilihan, DAN proposalId
    const dataUntukBackend = {
      address: account.address,
      vote_choice: pilihan,
      proposalId: proposalId // <-- SERTAKAN proposalId DARI STATE
    };

    console.log("Data YANG DIKIRIM:", JSON.stringify(dataUntukBackend));

    // Kirim ke backend API
    fetch(`/api/verify-vote?proposalId=${proposalId}`, { // <-- Kirim proposalId di URL juga (best practice)
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataUntukBackend), // Body sekarang lengkap
    })
    .then(res => { /* ... (penanganan error fetch tetap sama) ... */ })
    .then(data => { /* ... (penanganan alert tetap sama) ... */ })
    .catch(error => { /* ... (penanganan error catch tetap sama) ... */ });
  };

  return (
    <div>
      {/* --- TAMBAHAN: Tampilkan ID Proposal --- */}
      <h2>Verifikasi Suara DAO</h2>
      {proposalId && <p>Proposal ID: <code>{proposalId}</code></p>}
      {/* -------------------------------------- */}
      <p>Hubungkan dompet Sui Anda untuk melanjutkan.</p>

      <ConnectButton />
      <hr />

      {account && (
        <div>
          <p>Terhubung sebagai: {account.address}</p>
          {/* Tombol Setuju/Tidak tetap sama */}
          <button onClick={() => handleVerifyVote('Setuju')}>
            Verifikasi Pilihan: Setuju 👍
          </button>
          <button onClick={() => handleVerifyVote('Tidak')}>
            Verifikasi Pilihan: Tidak 👎
          </button>
        </div>
      )}
    </div>
  );
}

export default App;