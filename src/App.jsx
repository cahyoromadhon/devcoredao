import "./App.css";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
// Tidak perlu useSignPersonalMessage
import "@mysten/dapp-kit/dist/index.css";
// Tidak perlu Buffer

function App() {
  const account = useCurrentAccount(); // Hanya butuh ini

  // Fungsi yang dipanggil saat tombol verifikasi diklik
  const handleVerifyVote = () => {
    if (!account) {
      alert("Harap hubungkan dompet Anda terlebih dahulu.");
      return;
    }

    console.log(`Mengirim alamat ${account.address} ke Backend untuk verifikasi NFT.`);

    // Data yang dikirim hanya alamat
    const dataUntukBackend = {
      address: account.address,
      // vote_choice: "Setuju" // Tambahkan ini nanti jika sudah pakai Supabase
    };

    // Kirim ke backend API
    fetch("/api/verify-vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataUntukBackend),
    })
    .then(res => {
      if (!res.ok) {
          return res.text().then(text => {
              throw new Error(`Server error: ${res.status} - ${text}`);
          });
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        alert("Verifikasi Berhasil! NFT ditemukan."); // Pesan sukses sederhana
      } else {
        alert(`Verifikasi Gagal: ${data.message || 'Error tidak diketahui'}`);
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
      alert(`Terjadi Kesalahan: ${error.message}`);
    });
  };

  return (
    <div>
      <h2>Verifikasi Suara DAO</h2>
      <p>Hubungkan dompet Sui Anda untuk melanjutkan.</p>

      <ConnectButton />

      <hr />

      {/* Tampilkan tombol verifikasi HANYA JIKA dompet sudah terhubung */}
      {account && (
        <div>
          <p>Terhubung sebagai: {account.address}</p>
          {/* Tombol sekarang hanya mengirim alamat */}
          <button onClick={handleVerifyVote}>
            Verifikasi Kepemilikan NFT
          </button>
        </div>
      )}
    </div>
  );
}

export default App;