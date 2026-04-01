"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

type MetricPoint = {
  measured_on: string;
  body_weight_kg: number;
};

export default function MetricsPage() {
  const [bodyWeight, setBodyWeight] = useState(80);
  const [measuredOn, setMeasuredOn] = useState(new Date().toISOString().slice(0, 10));
  const [history, setHistory] = useState<MetricPoint[]>([]);
  const [message, setMessage] = useState("");

  async function logMetric() {
    const supabase = createClient();
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setMessage("Please log in first.");
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/body-metrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ measured_on: measuredOn, body_weight_kg: bodyWeight })
    });
    if (!response.ok) {
      setMessage("Save failed.");
      return;
    }

    const saved = await response.json();
    setHistory((prev) => [...prev, saved].sort((a, b) => a.measured_on.localeCompare(b.measured_on)));
    setMessage("Saved.");
  }

  return (
    <main>
      <h1>Body Metrics</h1>
      <div className="card">
        <div>
          <label>Date</label>
          <input type="date" value={measuredOn} onChange={(e) => setMeasuredOn(e.target.value)} />
        </div>
        <div>
          <label>Body weight (kg)</label>
          <input
            type="number"
            value={bodyWeight}
            min={0}
            step="0.1"
            onChange={(e) => setBodyWeight(Number(e.target.value))}
          />
        </div>
        <button type="button" onClick={logMetric}>
          Save metric
        </button>
        <p>{message}</p>
      </div>
      <div className="card" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="measured_on" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="body_weight_kg" stroke="#38bdf8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
