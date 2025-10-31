// src/components/QueryForm.jsx
import { useState } from "react";
import { useApolloClient, gql } from "@apollo/client";
import Results from "./Results";
import "./QueryForm.css";

export default function QueryForm() {
  const client = useApolloClient();

  const [entity, setEntity] = useState("students");
  const [selectedFields, setSelectedFields] = useState([]);
  const [id, setId] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fields = {
    students: ["id", "name", "age", "career", "email"],
    breeds: ["id", "name", "origin", "description"],
  };

  const buildQuery = (entityType, fieldsArr) => {
    if (!fieldsArr.length) return null;
    if (entityType === "students") {
      return gql`
        query {
          students {
            ${fieldsArr.join("\n")}
          }
        }
      `;
    } else {
      return gql`
        query($id: ID!) {
          breed(id: $id) {
            ${fieldsArr.join("\n")}
          }
        }
      `;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setData(null);

    if (!selectedFields.length) return alert("Selecciona al menos un campo");
    if (entity === "breeds" && !id) return alert("Ingresa un ID de raza");

    const query = buildQuery(entity, selectedFields);
    if (!query) return alert("Query inválida");

    const variables = entity === "breeds" ? { id } : {};

    try {
      setLoading(true);
      const result = await client.query({ query, variables, fetchPolicy: "no-cache" });
      setData(result.data);
    } catch (err) {
      console.error("GraphQL error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (f) => {
    setSelectedFields((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  return (
    <div className="light-container">
      <div className="panel">
        <div className="panel-left">
          <h1>Consultas GraphQL</h1>
          <p className="subtitle">Elige la entidad y selecciona los campos que quieres ver.</p>

          <form className="form" onSubmit={handleSubmit}>
            <div className="row">
              <label htmlFor="entity-select">Entidad</label>
              <select
                id="entity-select"
                value={entity}
                onChange={(e) => {
                  setEntity(e.target.value);
                  setSelectedFields([]);
                  setData(null);
                  setError(null);
                }}
              >
                <option value="students">Estudiantes</option>
                <option value="breeds">Razas de gatos</option>
              </select>
            </div>

            {entity === "breeds" && (
              <div className="row">
                <label htmlFor="breed-id">ID raza</label>
                <input
                  id="breed-id"
                  type="text"
                  placeholder="Ej: 1"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>
            )}

            <div className="row fields-row">
              <label>Campos</label>
              <div className="fields" role="list">
                {fields[entity].map((f) => {
                  const isChecked = selectedFields.includes(f);
                  const inputId = `field-${entity}-${f}`;
                  return (
                    <label
                      key={f}
                      className={`chip ${isChecked ? "checked" : ""}`}
                      onClick={() => toggleField(f)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleField(f); } }}
                      aria-pressed={isChecked}
                      htmlFor={inputId}
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleField(f)}   // <-- cambio clave: manejador en el input
                        aria-checked={isChecked}
                        aria-label={`Seleccionar campo ${f}`}
                      />
                      <span className="chip-text">{f}</span>
                      <span className="chip-check" aria-hidden>{isChecked ? "✓" : ""}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="row actions">
              <button type="submit" className="btn-primary">Consultar</button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => { setSelectedFields([]); setData(null); setError(null); setId(""); }}
              >
                Limpiar
              </button>

              <div className="selected-count" aria-hidden>
                {selectedFields.length > 0 ? `${selectedFields.length} campo(s)` : null}
              </div>
            </div>
          </form>
        </div>

        <aside className="panel-right">
          <div className="card-ghost">
            <div className="card-title">Vista previa</div>
            <div className="card-sub">
              La interfaz devolverá únicamente los campos que marques. Diseño claro, espacioso y legible.
            </div>
            <div className="badges">
              <span className="badge">Light mode</span>
              <span className="badge">Accessible</span>
              <span className="badge">Responsive</span>
            </div>
          </div>

          <Results data={data} loading={loading} error={error} entity={entity} />
        </aside>
      </div>
    </div>
  );
}
