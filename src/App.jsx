import "./App.css";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import { useState, useEffect } from "react";

function App() {
  const account = useCurrentAccount();
  const [proposalId, setProposalId] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const idFromUrl = queryParams.get("proposalId");
    if (idFromUrl) setProposalId(idFromUrl);
  }, []);

  const handleVerifyVote = (choice) => {
    if (!proposalId) {
      alert("Proposal ID tidak ditemukan.");
      return;
    }
    if (!account) {
      alert("Silakan hubungkan dompet Anda.");
      return;
    }

    const payload = {
      address: account.address,
      vote_choice: choice,
      proposalId,
    };

    fetch(`/api/verify-vote?proposalId=${proposalId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((d) => alert(d.message || "Vote terkirim."))
      .catch((e) => alert("Terjadi kesalahan: " + e.message));
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a0a, #1a1a1a)",
        color: "#e5e5e5",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          backdropFilter: "blur(12px)",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "2.5rem 3rem",
          width: "90%",
          maxWidth: "480px",
          textAlign: "center",
          boxShadow: "0 0 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        <h2 style={{ fontWeight: 600, marginBottom: "0.5rem", letterSpacing: "0.5px" }}>
          Verifikasi Suara DAO
        </h2>

        {proposalId && (
          <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Proposal ID: <code style={{ color: "#fff" }}>{proposalId}</code>
          </p>
        )}

        <p style={{ fontSize: "0.9rem", color: "#bbb", marginBottom: "1.5rem" }}>
          Hubungkan dompet Sui Anda untuk melanjutkan.
        </p>

        <div style={{ marginBottom: "1.5rem" }}>
          <ConnectButton />
        </div>

        {account && (
          <>
            <p style={{ fontSize: "0.8rem", color: "#999" }}>Terhubung sebagai:</p>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#ddd",
                marginBottom: "1.5rem",
                wordBreak: "break-all",
              }}
            >
              {account.address}
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => handleVerifyVote("Setuju")}
                style={{
                  background: "#ffffff10",
                  border: "1px solid #ffffff20",
                  color: "#fff",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => (e.target.style.background = "#ffffff20")}
                onMouseOut={(e) => (e.target.style.background = "#ffffff10")}
              >
                👍 Setuju
              </button>

              <button
                onClick={() => handleVerifyVote("Tidak")}
                style={{
                  background: "#ffffff10",
                  border: "1px solid #ffffff20",
                  color: "#fff",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => (e.target.style.background = "#ffffff20")}
                onMouseOut={(e) => (e.target.style.background = "#ffffff10")}
              >
                👎 Tidak
              </button>
            </div>
          </>
        )}
      </div>

      <footer
        style={{
          position: "absolute",
          bottom: "2rem",
          fontSize: "0.8rem",
          color: "#555",
          letterSpacing: "0.5px",
        }}
      >
        © 2025 Devcore DAO
      </footer>
    </div>
  );
}

export default App;
