"use client";

import { useEffect, useState } from "react";
import { BarChart } from "@tremor/react";

const Home = () => {
  const [weights, setWeights] = useState<number[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`http://localhost:80/ws/weights`);
    ws.onmessage = (m) => {
      setWeights(JSON.parse(m.data as string) as number[]);
    };

    return () => {
      if (ws?.readyState !== 3) ws.close();
    };
  }, []);
  return (
    <div className="p-4">
      <div className="rounded-lg bg-black p-4">
        <BarChart
          className="h-80"
          data={weights}
          index="uid"
          categories={["weight"]}
          onValueChange={(v) => console.log(v)}
        />
      </div>
    </div>
  );
};

export default Home;
