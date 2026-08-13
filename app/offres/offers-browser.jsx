"use client";

import { useMemo, useState } from "react";

import { buildFilterOptions, EMPTY_FILTERS, filterOffers } from "../../lib/filters";
import TripCard from "../trip-card";

function Select({ label, name, value, options, onChange }) {
  if (!options.length) return null;

  return (
    <label className="filter-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(name, event.target.value)}>
        <option value="">Toutes</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function OffersBrowser({ offers, phone, labels, guarantees }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const options = useMemo(() => buildFilterOptions(offers), [offers]);
  const visible = useMemo(() => filterOffers(offers, filters), [offers, filters]);

  const active = Object.values(filters).some(Boolean);

  function update(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <div className="filters" role="search">
        <Select
          label="Ville de départ"
          name="city"
          value={filters.city}
          options={options.cities.map((city) => ({ value: city, label: city }))}
          onChange={update}
        />
        <Select
          label="Destination"
          name="destination"
          value={filters.destination}
          options={options.destinations.map((item) => ({ value: item, label: item }))}
          onChange={update}
        />
        <Select
          label="Prix"
          name="price"
          value={filters.price}
          options={options.prices}
          onChange={update}
        />
        <Select
          label="Date de départ"
          name="month"
          value={filters.month}
          options={options.months}
          onChange={update}
        />
        <Select
          label="Durée"
          name="duration"
          value={filters.duration}
          options={options.durations}
          onChange={update}
        />

        {active ? (
          <button className="filter-reset" type="button" onClick={() => setFilters(EMPTY_FILTERS)}>
            Tout effacer
          </button>
        ) : null}
      </div>

      <p className="filter-count" aria-live="polite">
        {visible.length} voyage{visible.length > 1 ? "s" : ""}
        {active ? " correspondent à ta recherche" : " au total"}
      </p>

      {visible.length > 0 ? (
        <div className="trip-grid">
          {visible.map((offer) => (
            <TripCard
              key={offer.slug}
              offer={offer}
              phone={phone}
              labels={labels}
              guarantees={guarantees}
            />
          ))}
        </div>
      ) : (
        <p className="filter-empty">{labels.noResult}</p>
      )}
    </>
  );
}
