// src/components/Results.jsx
import React from "react";
import "./QueryForm.css";

function Spinner() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div className="spinner" style={{
        width:18, height:18, borderRadius:18,
        border:"3px solid rgba(15,23,42,0.08)",
        borderTopColor: "rgba(107,72,255,0.95)", animation:"spin 0.95s linear infinite"
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{fontSize:13, color:"var(--muted)"}}>Cargando...</div>
    </div>
  );
}

export default function Results({ data, loading, error, entity }) {
  if (loading) return <div className="results"><Spinner/></div>;
  if (error)
    return (
      <div className="results">
        <div style={{
          background:"#fff7f8",
          color:"#b91c1c",
          padding:12,
          borderRadius:10,
          border:"1px solid rgba(239,68,68,0.08)"
        }}>
          <strong>Error:</strong> {error.message || "Algo salió mal"}
        </div>
      </div>
    );
  if (!data) return null;

  const result = entity === "students" ? data.students : data.breed;

  if (Array.isArray(result)) {
    if (result.length === 0) {
      return <div className="results"><em style={{color:"var(--muted)"}}>No hay elementos.</em></div>;
    }
    return (
      <div className="results" style={{
        display:"grid",
        gap:12,
        gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",
        animation:"fadeIn .18s ease"
      }}>
        {result.map((item, idx) => (
          <div key={idx} style={{
            background:"#fff",
            padding:14,
            borderRadius:12,
            boxShadow:"0 10px 30px rgba(15,23,42,0.06)",
            border:"1px solid #f1f6ff",
            transition:"transform .12s ease"
          }}>
            <h3 style={{margin:"0 0 8px 0", fontSize:16, color:"var(--text)"}}>
              {item.name ?? item.id ?? `#${idx+1}`}
            </h3>
            <ul style={{margin:0, padding:0, listStyle:"none", fontSize:13, color:"var(--muted)"}}>
              {Object.entries(item).map(([k,v]) => (
                <li key={k} style={{display:"flex", justifyContent:"space-between", padding:"6px 0", borderTop:"1px dashed #f3f6fb"}}>
                  <span style={{textTransform:"capitalize", color:"var(--muted)", fontWeight:600}}>{k}</span>
                  <span style={{marginLeft:12, textAlign:"right", color:"var(--text)"}}>{String(v)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (result && typeof result === "object") {
    return (
      <div className="results" style={{display:"flex", gap:12, flexDirection:"column", animation:"fadeIn .18s ease"}}>
        <div style={{
          background:"#fff",
          padding:14,
          borderRadius:12,
          boxShadow:"0 10px 30px rgba(15,23,42,0.06)",
          border:"1px solid #f1f6ff",
          maxWidth:700
        }}>
          <h3 style={{margin:"0 0 8px 0", color:"var(--text)"}}>{result.name ?? result.id ?? "Resultado"}</h3>
          <div style={{color:"var(--muted)", fontSize:14, marginBottom:8}}>
            {result.description ?? ""}
          </div>
          <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
            {Object.entries(result).map(([k,v]) => (
              <div key={k} style={{
                background:"#f7f9ff",
                padding:"8px 10px",
                borderRadius:999,
                fontSize:13,
                color:"var(--muted)",
                border:"1px solid #eef4ff"
              }}>
                <strong style={{marginRight:6, color:"var(--text)"}}>{k}:</strong> {String(v)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results">
      <pre style={{background:"#fff", padding:12, borderRadius:8}}>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
