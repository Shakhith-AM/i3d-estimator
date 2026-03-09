export default function Header({ setScreen }) {

  return (
    <div style={{
      padding: "8px 22px",
      borderBottom: "1px solid #ddd",
      display: "flex",
      alignItems: "center",
      gap: 10
    }}>
      
      <button onClick={() => setScreen("dashboard")}>
        Dashboard
      </button>

      <button onClick={() => setScreen("plumbing")}>
        Plumbing
      </button>

      <span style={{ fontSize: 11, color: "#444" }}>
        i3d Studio Estimator
      </span>

    </div>
  )
}
