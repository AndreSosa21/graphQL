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

  // UI fields (los mantienes tal cual)
  const fields = {
    students: ["id", "name", "age", "career", "email"],
    breeds: ["id", "name", "origin", "description"],
  };

  // Campos que el servidor realmente soporta (llenados por introspección)
  const [availableFields, setAvailableFields] = useState({ students: [], breeds: [] });
  const [introspectError, setIntrospectError] = useState(null);

  // Introspección simple: pide __type("Student") y __type("Breed")
  useEffect(() => {
    let mounted = true;

    const fetchType = async (typeName) => {
      const Q = gql`
        query IntrospectType($t: String!) {
          __type(name: $t) {
            name
            fields { name }
          }
        }
      `;
      try {
        const r = await client.query({ query: Q, variables: { t: typeName }, fetchPolicy: "no-cache" });
        return r.data && r.data.__type && Array.isArray(r.data.__type.fields)
          ? r.data.__type.fields.map((f) => f.name)
          : [];
      } catch (err) {
        return [];
      }
    };

    (async () => {
      try {
        // intenta con nombres comunes; si tu schema usa otro nombre, ajusta aquí
        const sFields = await fetchType("Student");
        const bFields = await fetchType("Breed");
        // fallback: si no vienen, usamos una heurística: intentar StudentType / CatBreed
        const sFields2 = sFields.length ? sFields : await fetchType("StudentType");
        const bFields2 = bFields.length ? bFields : (await fetchType("CatBreed")).length ? await fetchType("CatBreed") : bFields;

        if (!mounted) return;

        // si no se obtuvo nada, usamos los campos UI como fallback (no queremos bloquear la UI)
        const finalStudents = (sFields2 && sFields2.length) ? sFields2 : fields.students;
        const finalBreeds = (bFields2 && bFields2.length) ? bFields2 : fields.breeds;

        setAvailableFields({
          students: Array.from(new Set(finalStudents)),
          breeds: Array.from(new Set(finalBreeds)),
        });
        setIntrospectError(null);
      } catch (err) {
        // fallback
        if (!mounted) return;
        setAvailableFields({ students: fields.students, breeds: fields.breeds });
        setIntrospectError("No se pudo obtener schema del servidor; usando campos por defecto.");
      }
    })();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  // Construye la query a partir de los campos que sí enviaremos (no desde selectedFields directo)
  const buildQuery = (entityType, fieldsArr) => {
    if (!fieldsArr || fieldsArr.length === 0) return null;
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

    if (!selectedFields.length) {
      alert("Selecciona al menos un campo");
      return;
    }
    if (entity === "breeds" && !id) {
      alert("Ingresa un ID de raza");
      return;
    }

    // Filtrar las selecciones contra lo que el servidor soporta
    const allowed = availableFields[entity] && availableFields[entity].length ? availableFields[entity] : fields[entity];
    const finalSelected = selectedFields.filter((f) => allowed.includes(f));
    const removed = selectedFields.filter((f) => !allowed.includes(f));
    if (removed.length) {
      // informa al usuario qué campos se quitaron para evitar 400
      alert(`Se quitaron campos inválidos que el servidor no soporta: ${removed.join(", ")}`);
    }
    if (!finalSelected.length) {
      alert("Después de filtrar campos inválidos no queda ninguna selección válida.");
      return;
    }

    const query = buildQuery(entity, finalSelected);
    if (!query) {
      alert("Query inválida");
      return;
    }

    const variables = entity === "breeds" ? { id } : {};

    try {
      setLoading(true);

      // log útil para debugging
      try {
        const qtext = query && query.loc && query.loc.source ? query.loc.source.body : String(query);
        console.log("== GraphQL Query ==");
        console.log(qtext);
        console.log("== Variables ==", variables);
      } catch (_) {
        console.log("No se pudo extraer el texto de la query", query);
      }

      const result = await client.query({
        query,
        variables,
        fetchPolicy: "no-cache",
      });

      setData(result.data);
    } catch (err) {
      console.error("GraphQL/Network error:", err);

      let friendly = err.message || "Error desconocido";
      let raw = null;

      if (err.networkError && err.networkError.result) {
        raw = err.networkError.result;
        if (raw.errors && Array.isArray(raw.errors)) {
          friendly = raw.errors.map((e) => e.message).join(" | ");
        }
      }

      if (err.graphQLErrors && err.graphQLErrors.length) {
        raw = err.graphQLErrors;
        friendly = err.graphQLErrors.map((e) => e.message).join(" | ");
      }

      if (!raw && err.networkError && err.networkError.body) {
        raw = err.networkError.body;
      }
      setError({ message: friendly, raw: raw || err });
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (f) => {
    setSelectedFields((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  return (
    <div className="light-container">
      <div className="panel">
        <div className="panel-left">
          <h1>Consultas GraphQL</h1>
          <p className="subtitle">Elige la entidad y selecciona los campos que quieres ver.</p>

          {introspectError && (
            <div style={{ marginBottom: 10, padding: 10, borderRadius: 8, background: "#fff4e6", color: "#92400e", border: "1px solid rgba(245,158,11,0.12)" }}>
              {introspectError}
            </div>
          )}

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
                  // si el campo no está en availableFields, lo marcamos visualmente como disabled
                  const allowed = availableFields[entity] && availableFields[entity].length ? availableFields[entity] : fields[entity];
                  const disabled = !allowed.includes(f);
                  return (
                    <label
                      key={f}
                      className={`chip ${isChecked ? "checked" : ""} ${disabled ? "disabled" : ""}`}
                      onClick={() => !disabled && toggleField(f)}
                      role="button"
                      tabIndex={disabled ? -1 : 0}
                      onKeyDown={(e) => {
                        if (!disabled && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          toggleField(f);
                        }
                      }}
                      aria-pressed={isChecked}
                      htmlFor={inputId}
                      style={disabled ? { opacity: 0.55, cursor: "not-allowed" } : {}}
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => !disabled && toggleField(f)}
                        aria-checked={isChecked}
                        aria-label={`Seleccionar campo ${f}`}
                        disabled={disabled}
                      />
                      <span className="chip-text">{f}</span>
                      <span className="chip-check" aria-hidden>
                        {isChecked ? "✓" : ""}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="row actions">
              <button type="submit" className="btn-primary">
                Consultar
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setSelectedFields([]);
                  setData(null);
                  setError(null);
                  setId("");
                }}
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
              La interfaz devolverá únicamente los campos que marques. Si la introspección falla, uso campos por defecto mínimos.
            </div>
            <div className="badges">
              <span className="badge">Light mode</span>
              <span className="badge">Auto-fields</span>
              <span className="badge">Responsive</span>
            </div>
          </div>

          <Results data={data} loading={loading} error={error} entity={entity} />
        </aside>
      </div>
    </div>
  );
}
