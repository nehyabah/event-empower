import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { VisionBoardCanvas } from "@/components/workspace/VisionBoardCanvas";

const VisionBoard = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#faf9f7" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
        background: "#ffffff", borderBottom: "1px solid #ece8e2", flexShrink: 0,
      }}>
        <button
          onClick={() => navigate("/workspace")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 13 }}
        >
          <ArrowLeft size={15} /> Workspace
        </button>
        <span style={{ color: "#e8e4df" }}>|</span>
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, color: "#2e3240", letterSpacing: 1 }}>Mood Board</span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <VisionBoardCanvas />
      </div>
    </div>
  );
};

export default VisionBoard;
