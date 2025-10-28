import "./App.css";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import { useState, useEffect } from "react";

function App() {
  const account = useCurrentAccount();
  const [proposalId, setProposalId] = useState(null);
  const [modal, setModal] = useState({ show: false, message: "", type: "info" });

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const idFromUrl = queryParams.get("proposalId");
    if (idFromUrl) setProposalId(idFromUrl);
  }, []);

  const handleVerifyVote = (choice) => {
    if (!proposalId) {
      setModal({ show: true, message: "Proposal ID tidak ditemukan.", type: "error" });
      return;
    }
    if (!account) {
      setModal({ show: true, message: "Silakan hubungkan dompet Anda.", type: "error" });
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
      .then((d) => {
        const lowerMsg = d.message?.toLowerCase() || "";
        const isError =
          lowerMsg.includes("tidak") ||
          lowerMsg.includes("gagal") ||
          lowerMsg.includes("error") ||
          lowerMsg.includes("belum") ||
          lowerMsg.includes("invalid");

        setModal({
          show: true,
          message: d.message || "Vote berhasil dikirim.",
          type: isError ? "error" : "success",
        });
      })
      .catch((e) =>
        setModal({
          show: true,
          message: "Terjadi kesalahan: " + e.message,
          type: "error",
        })
      );
  };

  const closeModal = () => setModal({ show: false, message: "", type: "info" });

  return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg,#0a0a0a,#151515)",
            color: "#e5e5e5",
            fontFamily: "Inter,sans-serif",
            overflowY: "auto",
            padding: "1rem",
          }}
        >
        <div
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            padding: "clamp(2rem, 4vw, 3rem)",
            width: "90%",
            maxWidth: "540px",
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            transform: "scale(1.02)",
          }}
        >
        <h2
          style={{
            fontWeight: 600,
            marginBottom: "0.5rem",
            fontSize: "1.25rem",
            letterSpacing: "0.5px",
          }}
        >
          Verifikasi Suara DAO
        </h2>

        {proposalId && (
          <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "1rem" }}>
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
                fontSize: "0.75rem",
                color: "#ddd",
                marginBottom: "1.5rem",
                wordBreak: "break-all",
              }}
            >
              {account.address}
            </p>

            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center" }}>
              <button
                onClick={() => handleVerifyVote("Setuju")}
                style={{
                  background: "#ffffff08",
                  border: "1px solid #ffffff20",
                  color: "#fff",
                  padding: "0.7rem 1.3rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => (e.target.style.background = "#ffffff15")}
                onMouseOut={(e) => (e.target.style.background = "#ffffff08")}
              >
                👍 Setuju
              </button>

              <button
                onClick={() => handleVerifyVote("Tidak")}
                style={{
                  background: "#ffffff08",
                  border: "1px solid #ffffff20",
                  color: "#fff",
                  padding: "0.7rem 1.3rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => (e.target.style.background = "#ffffff15")}
                onMouseOut={(e) => (e.target.style.background = "#ffffff08")}
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
          bottom: "1.5rem",
          fontSize: "0.75rem",
          color: "#555",
          letterSpacing: "0.5px",
        }}
      >
        © 2025 Devcore DAO
      </footer>

      {/* Modal */}
      {modal.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(0,0,0,.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(25,25,25,0.9)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "1.8rem 1.5rem",
              width: "100%",
              maxWidth: "360px",
              textAlign: "center",
              color: "#fff",
              boxShadow: "0 0 25px rgba(0,0,0,0.6)",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <h3
              style={{
                marginBottom: "1rem",
                color:
                  modal.type === "success"
                    ? "#9AE69A"
                    : modal.type === "error"
                    ? "#F28B82"
                    : "#E5E5E5",
                fontWeight: 600,
              }}
            >
              {modal.type === "success"
                ? "Berhasil"
                : modal.type === "error"
                ? "Gagal"
                : "Info"}
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#ccc", marginBottom: "1.4rem" }}>
              {modal.message}
            </p>
            <button
              onClick={closeModal}
              style={{
                background: "#ffffff10",
                border: "1px solid #ffffff20",
                color: "#fff",
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => (e.target.style.background = "#ffffff20")}
              onMouseOut={(e) => (e.target.style.background = "#ffffff10")}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
