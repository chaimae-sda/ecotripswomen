"use client";

import { useMemo, useState } from "react";

import { buildFilterOptions, EMPTY_FILTERS, filterOffers } from "../../lib/filters";
import { format } from "../../lib/ui";
import TripCard from "../trip-card";

function Select({ label, name, value, options, onChange, toutes }) {
  if (!options.length) return null;

  return (
    <label className="filter-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(name, event.target.value)}>
        <option value="">{toutes}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function OffersBrowser({ offers, phone, labels, guarantees, ui }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const options = useMemo(() => buildFilterOptions(offers, ui), [offers, ui]);
  const visible = useMemo(() => filterOffers(offers, filters), [offers, filters]);

  const active = Object.values(filters).some(Boolean);

  function update(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <div className="filters" role="search">
        <Select
          toutes={ui.toutes}
          label={ui.filtreVille}
          name="city"
          value={filters.city}
          options={options.cities.map((city) => ({ value: city, label: city }))}
          onChange={update}
        />
        <Select
          toutes={ui.toutes}
          label={ui.filtreDestination}
          name="destination"
          value={filters.destination}
          options={options.destinations.map((item) => ({ value: item, label: item }))}
          onChange={update}
        />
        <Select
          toutes={ui.toutes}
          label={ui.filtrePrix}
          name="price"
          value={filters.price}
          options={options.prices}
          onChange={update}
        />
        <Select
          toutes={ui.toutes}
          label={ui.filtreDate}
          name="month"
          value={filters.month}
          options={options.months}
          onChange={update}
        />
        <Select
          toutes={ui.toutes}
          label={ui.filtreDuree}
          name="duration"
          value={filters.duration}
          options={options.durations}
          onChange={update}
        />

        {active ? (
          <button className="filter-reset" type="button" onClick={() => setFilters(EMPTY_FILTERS)}>
            {ui.toutEffacer}
          </button>
        ) : null}
      </div>

      <p className="filter-count" aria-live="polite">
        {format(
          active
            ? visible.length > 1
              ? ui.resultatFiltrePlusieurs
              : ui.resultatFiltreUn
            : visible.length > 1
              ? ui.resultatPlusieurs
              : ui.resultatUn,
          { n: visible.length }
        )}
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
              ui={ui}
            />
          ))}
        </div>
      ) : (
        <p className="filter-empty">{labels.noResult}</p>
      )}
    </>
  );
}
