import { useEffect, useRef, useState } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path broken by bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// ─── Nominatim geocoding (OpenStreetMap, free, no key needed) ────────────────
async function geocode(address, ville) {
  const query = [address, ville, "Maroc"].filter(Boolean).join(", ");
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { "Accept-Language": "fr" },
    });
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  // eslint-disable-next-line no-unused-vars, no-empty
  } catch (_) {}
  return null;
}

// ─── Map component ────────────────────────────────────────────────────────────
function EtablissementMap({ etablissement }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [geoStatus, setGeoStatus] = useState("loading"); // loading | found | failed

  useEffect(() => {
    if (!etablissement) return;

    let cancelled = false;

    (async () => {
      const coords = await geocode(etablissement.location, etablissement.ville);

      if (cancelled) return;

      if (!coords) {
        setGeoStatus("failed");
        return;
      }

      setGeoStatus("found");

      // Wait for DOM
      setTimeout(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current).setView([coords.lat, coords.lon], 14);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const popupContent = `
          <strong>${etablissement.nom}</strong><br/>
          ${etablissement.location || ""}${etablissement.location && etablissement.ville ? ", " : ""}${etablissement.ville || ""}
        `;

        L.marker([coords.lat, coords.lon])
          .addTo(map)
          .bindPopup(popupContent)
          .openPopup();
      }, 50);
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [etablissement]);

  if (!etablissement) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">
        📍 Localisation
      </h3>

      {geoStatus === "loading" && (
        <div className="h-56 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-sm">
          Chargement de la carte…
        </div>
      )}

      {geoStatus === "failed" && (
        <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-sm">
          Localisation introuvable pour «{" "}
          {[etablissement.location, etablissement.ville]
            .filter(Boolean)
            .join(", ")}{" "}
          »
        </div>
      )}

      {/* Map container — always rendered so the ref is available */}
      <div
        ref={mapRef}
        className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
        style={{
          height: geoStatus === "found" ? "280px" : "0px",
          transition: "height 0.3s ease",
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function StagiairesStag() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchInfos();
  }, []);

  const fetchInfos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/stagiaires/my-infos`, {
        headers: authHeaders(),
      });
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="text-slate-500">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          👨‍🎓 Mon Stage
        </h1>
        <p className="text-sm text-slate-500">
          Informations relatives à votre stage.
        </p>
      </div>

      {/* STAGIAIRE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-emerald-600">
          👨‍🎓 Informations du stagiaire
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Info label="Nom complet" value={data?.stagiaire?.nom_complet} />
          <Info label="Email" value={data?.stagiaire?.email} />
          <Info label="Filière" value={data?.stagiaire?.filiere} />
        </div>
      </div>

      {/* ÉTABLISSEMENT */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-blue-600">
          🏫 Établissement d'accueil
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Info label="Nom de l'établissement" value={data?.etablissement?.nom} />
          <Info label="Ville" value={data?.etablissement?.ville} />
          <Info label="Adresse / Quartier" value={data?.etablissement?.location} />
          <Info label="Email" value={data?.etablissement?.email} />
        </div>

        {/* Map */}
        <EtablissementMap etablissement={data?.etablissement} />
      </div>

      {/* SUPERVISEUR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-purple-600">
          👨‍🏫 Superviseur CRMEF
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Info label="Nom complet" value={data?.superviseur?.nom} />
          <Info label="Email" value={data?.superviseur?.email} />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {value || "—"}
      </p>
    </div>
  );
}