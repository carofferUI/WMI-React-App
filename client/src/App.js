import React, { useEffect, useState } from "react";
import { Table } from "./components";
import "./App.css";

const tableConfig = {
  columns: ["Name", "WMI", "Country", "CreatedOn", "VehicleType"],
  filters: ["Country"],
  // If fields will be translate, for supporting more/or other language than English, use: a.localeCompare(b)
  sortFn: (a, b) =>
    a.CreatedOn !== b.CreatedOn
      ? Date.parse(a.CreatedOn) - Date.parse(b.CreatedOn)
      : a.WMI <= b.WMI
      ? -1
      : 1,
  search: true,
  select: true,
};

function App() {
  const keys = ["Name", "WMI", "Country", "CreatedOn", "VehicleType"];
  const [transports, setTransports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  let countries = new Set();

  const fetchTransports = async () => {
    try {
      let response = await fetch("/wmi");
      let json = await response.json();
      return { success: true, data: json };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  };
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let res = await fetchTransports();
      if (res.success) {
        setTransports(
          res.data
          /*
            .map(transport => {
              countries.add(transport.Country);
              return ({...transport, __index: Object.values(transport).join("\n").toLowerCase()});
            })
            */
        );
      }
      setIsLoading(false);
    })();
  }, []);

  /*
  const getRow = (data) => {
    return data.map((d) => {
      const wmi = d.WMI;
      return (
        <tr key={wmi}>
          {keys.map((k) => (
            <td key={`${wmi}-${k}`}>{d[k]}</td>
          ))}
        </tr>
      );
    });
  };
  */

  // Should be change: https://mui.com/components/tables/
  return (
    <div className="App">
      <header>WMI Data - Honda | Total: {transports.length}</header>
      <Table rows={transports} isLoading={isLoading} config={tableConfig} />
    </div>
  );
}

export default App;
