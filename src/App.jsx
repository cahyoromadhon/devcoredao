import "./App.css";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";

function App() {
  const account = useCurrentAccount();
  const handleVerifyVote = (pilihan) => {
    if (!account) {
      alert("Harap hubungkan dompet Anda terlebih dahulu.");
      return;
    }

    console.log(`Mengirim vote: ${account.address} memilih ${pilihan}`);

    // Data yang dikirim: alamat dan pilihan
    const dataUntukBackend = {
      address: account.address,
      vote_choice: pilihan // <-- KIRIM PILIHAN YANG DIKLIK
    };

    console.log("Data YANG DIKIRIM:", JSON.stringify(dataUntukBackend)); // Log data sebelum fetch

    // Kirim ke backend API
    fetch("/api/verify-vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataUntukBackend),
    })
    .then(res => {
      if (!res.ok) {
          return res.text().then(text => {
              // Coba parse teks sebagai JSON jika mungkin, jika tidak, tampilkan teks
              try {
                  const errorData = JSON.parse(text);
                  throw new Error(`Server error: ${res.status} - ${errorData.message || text}`);
              } catch (e) {
                  throw new Error(`Server error: ${res.status} - ${text}`);
              }
          });
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        alert(data.message || "Verifikasi Berhasil!")
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

      {account && (
        <div>
          <p>Terhubung sebagai: {account.address}</p>
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