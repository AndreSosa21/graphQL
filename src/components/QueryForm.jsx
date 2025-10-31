// src/components/QueryForm.jsx
import React, { useState, useEffect } from "react";
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

  // Campos disponibles por introspección
  const [availableFields, setAvailableFields] = useState({ students: [], breeds: [] });
  const [introspectError, setIntrospectError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchTypeFields = async (typeName) => {
      const INTROSPECT_QUERY = gql`
        query IntrospectType($t: String!) {
          __type(name: $t) {
            fields { name }
          }
        }
      `;
      try {
        const r = await client.query({ query: INTROSPECT_QUERY, variables: { t: typeName }, fetchPolicy: "no-cache" });
        return r.data?.__type?.fields?.map(f => f.name) || [];
      } catch {
        return [];
      }
    };

    (async () => {
      try {
        const studentFields = await fetchTypeFields("Student");
        const breedFields = await fetchTypeFields("Breed");

        if (!mounted) return;

        setAvailableFields({
          students: studentFields.length ? studentFields : ["id", "firstName", "lastName", "email", "age", "major"],
          breeds: breedFields.length ? breedFields : ["id", "name", "origin", "description"]
        });

        setIntrospectError(null);
      } catch (err) {
        if (!mounted) return;
        setAvailableFields({
          students: ["id", "firstName", "lastName", "email", "age", "major"],
          breeds: ["id", "name", "origin", "description"]
        });
        setIntrospectError("No se pudo obtener schema del servidor; usando campos por defecto.");
      }
    })();

    return () => { mounted = false; };
  }, [client]);

  // Construye la query dinámicamente
  const buildQuery = (entityType, fieldsArr) => {
    if (!fieldsArr.length) return null;

    if (entityType === "students") {
      return gql`query { students { ${fieldsArr.join("\n")} } }`;
    } else {
      return gql`query($id: ID!) { breed(id: $id) { ${fieldsArr.join("\n")} } }`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setData(null);

    if (!selectedFields.length) {
      alert("Selecciona al menos un campo");
      return;
    }

    if (entity === "breeds" && !id) {
      alert("Ingresa un ID de raza");
      return;
    }

    const allowed = availableFields[entity] || [];
    const finalSelected = selectedFields.filter(f => allowed.includes(f));
    const removed = selectedFields.filter(f => !allowed.includes(f));
    if (removed.length) alert(`Se quitaron campos inválidos: ${removed.join(", ")}`);
    if (!finalSelected.length) return alert("No hay campos válidos seleccionados.");

    const query = buildQuery(entity, finalSelected);
    const variables = entity === "breeds" ? { id } : {};

    try {
      setLoading(true);
      const result = await client.query({ query, variables, fetchPolicy: "no-cache" });
      setData(result.data);
    } catch (err) {
      console.error(err);
      setError({ message: err.message || "Error desconocido" });
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (f) => {
    setSelectedFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  return (
    <div className="light-container">
      <div className="panel">
        <div className="panel-left">
          <h1>Consultas GraphQL</h1>
          <p className="subtitle">Selecciona entidad y campos a mostrar.</p>

          {introspectError && (
            <div style={{ marginBottom: 10, padding: 10, borderRadius: 8, background: "#fff4e6", color: "#92400e", border: "1px solid rgba(245,158,11,0.12)" }}>
              {introspectError}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <div className="row">
              <label>Entidad</label>
              <select value={entity} onChange={e => { setEntity(e.target.value); setSelectedFields([]); setData(null); setError(null); }}>
                <option value="students">Estudiantes</option>
                <option value="breeds">Razas de gatos</option>
              </select>
            </div>

            {entity === "breeds" && (
              <div className="row">
                <label>ID raza</label>
                <input type="text" placeholder="Ej: 1" value={id} onChange={e => setId(e.target.value)} />
              </div>
            )}

            <div className="row fields-row">
              <label>Campos</label>
              <div className="fields" role="list">
                {(availableFields[entity] || []).map(f => {
                  const isChecked = selectedFields.includes(f);
                  return (
                    <label key={f} className={`chip ${isChecked ? "checked" : ""}`} onClick={() => toggleField(f)}>
                      <input type="checkbox" checked={isChecked} readOnly />
                      <span className="chip-text">{f}</span>
                      <span className="chip-check">{isChecked ? "✓" : ""}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="row actions">
              <button type="submit" className="btn-primary">Consultar</button>
              <button type="button" className="btn-ghost" onClick={() => { setSelectedFields([]); setData(null); setError(null); setId(""); }}>Limpiar</button>
            </div>
          </form>
        </div>

        <aside className="panel-right">
          <Results data={data} loading={loading} error={error} entity={entity} />
        </aside>
      </div>
    </div>
  );
}
