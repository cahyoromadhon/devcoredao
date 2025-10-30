import "./App.css";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import React, { useState, useEffect, useCallback } from "react";

function App() {
  const account = useCurrentAccount();
  const [voteId, setVoteId] = useState(null);
  const [modal, setModal] = useState({ show: false, message: "", type: "info" });
  
  const [voteStatus, setVoteStatus] = useState({
      remainingVotes: 0,
      totalNFTs: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchVoteStatus = useCallback(async (address, vId) => {
      if (!address || !vId) return;
      setIsLoading(true);
      try {
          const response = await fetch(`/api/verify-vote?voteId=${vId}&address=${address}`);
          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.message || "Gagal mengambil status vote.");
          }
          const data = await response.json();
          if (data.success) {
              setVoteStatus({
                  remainingVotes: data.remainingVotes,
                  totalNFTs: data.totalNFTs,
              });
          }
      } catch (error) {
          console.error("Gagal fetchVoteStatus:", error);
          setModal({ show: true, message: error.message, type: "error" });
      }
      setIsLoading(false);
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const idFromUrl = queryParams.get("voteId");
    if (idFromUrl) setVoteId(idFromUrl);
  }, []);

  useEffect(() => {
    if (account && voteId) {
      fetchVoteStatus(account.address, voteId);
    }
    if (!account) {
        setVoteStatus({ remainingVotes: 0, totalNFTs: 0 });
    }
  }, [account, voteId, fetchVoteStatus]); 
  
  const handleVerifyVote = (choice) => {
    if (!voteId || !account) {
        setModal({ show: true, message: !voteId ? "Vote ID tidak ditemukan." : "Silakan hubungkan dompet Anda.", type: "error" });
        return;
    }

    setIsLoading(true); 

    const payload = {
      address: account.address,
      vote_choice: choice,
    };

    fetch(`/api/verify-vote?voteId=${voteId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        const lowerMsg = data.message?.toLowerCase() || "";
        const isError =
          lowerMsg.includes("tidak") ||
          lowerMsg.includes("gagal") ||
          lowerMsg.includes("error") ||
          lowerMsg.includes("belum") ||
          lowerMsg.includes("invalid") ||
          lowerMsg.includes("sudah");

        setModal({
          show: true,
          message: data.message || "Vote berhasil dikirim.",
          type: isError ? "error" : "success",
        });
        
        if (!isError) {
            fetchVoteStatus(account.address, voteId);
        }
        setIsLoading(false);
      })
      .catch((e) => {
        setModal({
          show: true,
          message: "Terjadi kesalahan: " + e.message,
          type: "error",
        });
        setIsLoading(false);
      });
  };

  const closeModal = () => setModal({ show: false, message: "", type: "info" });

  return (
        <div
          style={{
            position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg,#0a0a0a,#151515)", color: "#e5e5e5",
            fontFamily: "Inter,sans-serif", overflowY: "auto", padding: "1rem",
          }}
        >
        <div
          style={{
            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px", padding: "clamp(2rem, 4vw, 3rem)", width: "90%",
            maxWidth: "540px", textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
          }}
        >
        <h2
          style={{
            fontWeight: 600, marginBottom: "0.5rem", fontSize: "1.25rem", letterSpacing: "0.5px",
          }}
        >
          Verifikasi Suara DAO
        </h2>

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
                fontSize: "0.75rem", color: "#ddd", marginBottom: "1.5rem", wordBreak: "break-all",
              }}
            >
              {account.address}
            </p>

            <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.9rem", color: "#999", margin: 0 }}>Sisa Suara Anda:</p>
                <p style={{ 
                    fontSize: "1.75rem", 
                    color: "#fff", 
                    fontWeight: 600, 
                    margin: "0.25rem 0",
                    opacity: isLoading ? 0.5 : 1
                }}>
                  {isLoading ? "..." : voteStatus.remainingVotes}
                </p>
                {voteStatus.remainingVotes === 0 && voteStatus.totalNFTs > 0 && !isLoading && (
                    <p style={{ color: '#F28B82', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                        Anda sudah menggunakan semua suara Anda.
                    </p>
                )}
            </div>

            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center" }}>
              <button
                disabled={isLoading || voteStatus.remainingVotes <= 0}
                onClick={() => handleVerifyVote("Setuju")}
                style={{
                  background: "#ffffff08", border: "1px solid #ffffff20", color: "#fff",
                  padding: "0.7rem 1.3rem", borderRadius: "8px", fontSize: "0.9rem",
                  transition: "all 0.2s ease",
                  opacity: (isLoading || voteStatus.remainingVotes <= 0) ? 0.4 : 1,
                  cursor: (isLoading || voteStatus.remainingVotes <= 0) ? "not-allowed" : "pointer"
                }}
                onMouseOver={(e) => (e.target.style.background = "#ffffff15")}
                onMouseOut={(e) => (e.target.style.background = "#ffffff08")}
              >
                👍 Setuju
              </button>

              <button
                disabled={isLoading || voteStatus.remainingVotes <= 0}
                onClick={() => handleVerifyVote("Tidak")}
                style={{
                  background: "#ffffff08", border: "1px solid #ffffff20", color: "#fff",
                  padding: "0.7rem 1.3rem", borderRadius: "8px", fontSize: "0.9rem",
                  transition: "all 0.2s ease",
                  opacity: (isLoading || voteStatus.remainingVotes <= 0) ? 0.4 : 1,
                  cursor: (isLoading || voteStatus.remainingVotes <= 0) ? "not-allowed" : "pointer"
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
          position: "absolute", bottom: "1.5rem", fontSize: "0.75rem",
          color: "#555", letterSpacing: "0.5px",
        }}
      >
        © 2025 Devcore DAO
      </footer>

      {modal.show && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, height: "100%", width: "100%",
            backgroundColor: "rgba(0,0,0,.85)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 1000, padding: "1rem",
          }}
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(25,25,25,0.9)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px", padding: "1.8rem 1.5rem", width: "100%",
              maxWidth: "360px", textAlign: "center", color: "#fff",
              boxShadow: "0 0 25px rgba(0,0,0,0.6)", animation: "fadeIn 0.3s ease",
            }}
          >
            <h3
              style={{
                marginBottom: "1rem", fontWeight: 600,
                color: modal.type === "success" ? "#9AE69A" : modal.type === "error" ? "#F28B82" : "#E5E5E5",
              }}
            >
              {modal.type === "success" ? "Berhasil" : modal.type === "error" ? "Gagal" : "Info"}
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#ccc", marginBottom: "1.4rem" }}>
              {modal.message}
            </p>
            <button
              onClick={closeModal}
              style={{
                background: "#ffffff10", border: "1px solid #ffffff20", color: "#fff",
                padding: "0.6rem 1.2rem", borderRadius: "6px", fontSize: "0.85rem",
                cursor: "pointer", transition: "all 0.2s ease",
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