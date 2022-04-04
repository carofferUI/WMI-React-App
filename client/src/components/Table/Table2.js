import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import Select from "react-select";

import "./Table.css";

function Table({ rows, isLoading, config }) {
  const {
    search: hasSearch,
    select: hasSelect,
    filters,
    columns = [],
    sortFn,
  } = config;
  const [normalizedRows, setNormalizedRows] = useState(rows);
  const [search, setSearch] = useState("");
  const [filterOptiopns, setFitlerOptiopns] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});

  const rowWithOneColumn = (child) => (
    <tr className="row-with-one-column">
      <td colSpan={columns.length}>{child}</td>
    </tr>
  );

  /*

  const getRowsJsx = () => {
    return transports.map(transport => {
      const wmi = transport.WMI;

      return (
        <tr key={wmi}>
          {keys.map(key => <td key={`${wmi}-${key}`}>{transport[key]}</td>)}
        </tr>
      );
    });
  };
  // HOC
  // TODO: use https://mui.com/components/tables/
  const rowWithOneColumn = child => <tr className="row-with-one-column"><td colSpan={keys.length}>{child}</td></tr>;
  */

  const handleChange = (selected, field) => {
    console.log("selected:40", selected);
    setSelectedOptions({ ...selectedOptions, [field]: {selected, regExp: /asd/ } });
  };

  useEffect(() => {
    let normalizeRows = rows;

    // Add Index for fasting search
    if (hasSearch) {
      normalizeRows = normalizeRows.map((row) => ({
        ...row,
        __index: Object.values(row).join("\n").toLowerCase(),
      }));
    }

    if (sortFn) {
      normalizeRows = normalizeRows.sort(sortFn);
    }

    if (filters.length) {
      const optionsOfFields = {};

      filters.forEach((field) => {
        optionsOfFields[field] = new Set();
      });

      rows.forEach((row) => {
        filters.forEach(
          (field) => row[field] && optionsOfFields[field].add(row[field])
        );
      });

      filters.forEach(
        (field) =>
          (optionsOfFields[field] = [...optionsOfFields[field]]
            .sort()
            .map((option) => ({
              value: option,
              label: option,
            })))
      );

      setFitlerOptiopns(optionsOfFields);
    }

    setNormalizedRows(normalizeRows);
  }, [rows, hasSearch, sortFn, filters]);

  const filteredRows = useMemo(() => {
    return (
      normalizedRows
        // For upping performance better merge two filters on the one
        .filter((row) => row.__index.indexOf(search.toLowerCase()) > -1)
        .filter((row) => {
          // selectedOptions
          return !selectedOptions.length
            ? true
            : filters
                .map((field) => {
                  return row[field].indexOf() > -1;
                })
                .every((value) => value === true);
        })
    );
  }, [search, normalizedRows]);

  return (
    <>
      {hasSearch && (
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}
      <table className="table Table">
        <thead>
          <tr>
            {hasSelect && (
              <th>
                <input type="checkbox" />
              </th>
            )}
            {columns.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
          {filters.length && (
            <tr>
              {hasSelect && <th />}
              {columns.map((field) => (
                <th key={field}>
                  {filters.includes(field) && (
                    <Select
                      value={selectedOptions[field].selected}
                      isMulti
                      onChange={(selected) => handleChange(selected, field)}
                      options={filterOptiopns[field]}
                    />
                  )}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {isLoading &&
            rowWithOneColumn(<img src="/loader.gif" alt="Loading..." />)}
          {!isLoading &&
            filteredRows.map((row, index) => (
              <tr key={index}>
                {hasSelect && (
                  <td>
                    <input type="checkbox" />
                  </td>
                )}
                {columns.map((key) => (
                  <td key={key}>{row[key]}</td>
                ))}
              </tr>
            ))}
        </tbody>
        <tfoot></tfoot>
      </table>
    </>
  );
}

Table.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool,
  config: PropTypes.shape({
    columns: PropTypes.arrayOf(PropTypes.string).isRequired,
    search: PropTypes.bool,
    select: PropTypes.bool,
    filters: PropTypes.array,
  }),
};

Table.defaultProps = {
  isLoading: false,
  config: {
    search: false,
    select: false,
    filters: [],
  },
};

export default Table;
