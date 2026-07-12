"use client";

import { useState, useEffect } from "react";

const POS_API = process.env.NEXT_PUBLIC_POS_API_URL || "https://saasdeep-pos.vercel.app";

interface Division {
  id: number;
  name: string;
  bn_name: string;
}

interface District {
  id: number;
  division_id: number;
  name: string;
  bn_name: string;
}

interface Upazila {
  id: number;
  district_id: number;
  name: string;
  bn_name: string;
}

interface AddressSelectProps {
  value: string;
  onChange: (fullAddress: string) => void;
}

export function AddressSelect({ value, onChange }: AddressSelectProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedUpazila, setSelectedUpazila] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    fetch(`${POS_API}/api/public/addresses/divisions`)
      .then((r) => r.json())
      .then(setDivisions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDivision) {
      setDistricts([]);
      setSelectedDistrict("");
      return;
    }
    fetch(`${POS_API}/api/public/addresses/divisions/${selectedDivision}/districts`)
      .then((r) => r.json())
      .then(setDistricts)
      .catch(() => {});
    setSelectedDistrict("");
    setSelectedUpazila("");
  }, [selectedDivision]);

  useEffect(() => {
    if (!selectedDistrict) {
      setUpazilas([]);
      setSelectedUpazila("");
      return;
    }
    fetch(`${POS_API}/api/public/addresses/districts/${selectedDistrict}/upazilas`)
      .then((r) => r.json())
      .then(setUpazilas)
      .catch(() => {});
    setSelectedUpazila("");
  }, [selectedDistrict]);

  useEffect(() => {
    const parts: string[] = [];
    if (details) parts.push(details);
    const div = divisions.find((d) => String(d.id) === selectedDivision);
    const dist = districts.find((d) => String(d.id) === selectedDistrict);
    const upa = upazilas.find((u) => String(u.id) === selectedUpazila);
    if (upa) parts.push(`${upa.name} (${upa.bn_name})`);
    if (dist) parts.push(`${dist.name} (${dist.bn_name})`);
    if (div) parts.push(`${div.name} (${div.bn_name})`);
    onChange(parts.join(", "));
  }, [details, selectedDivision, selectedDistrict, selectedUpazila, divisions, districts, upazilas, onChange]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <select
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          className="rounded-lg border border-input bg-background px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Division</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.bn_name})
            </option>
          ))}
        </select>

        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          disabled={!selectedDivision}
          className="rounded-lg border border-input bg-background px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <option value="">District</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.bn_name})
            </option>
          ))}
        </select>

        <select
          value={selectedUpazila}
          onChange={(e) => setSelectedUpazila(e.target.value)}
          disabled={!selectedDistrict}
          className="rounded-lg border border-input bg-background px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <option value="">Upazila</option>
          {upazilas.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.bn_name})
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Street / area details"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
