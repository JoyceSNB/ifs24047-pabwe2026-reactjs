import { STATUS_LABEL } from "../components/StatusBadge";

const OPTIONS = [
  { value: "lost", hint: "Saya kehilangan barang ini", active: "border-rose-500 bg-rose-50 text-rose-700" },
  { value: "found", hint: "Saya menemukan barang ini", active: "border-amber-400 bg-amber-50 text-amber-800" },
];

// Pilihan jenis laporan (hilang/ditemukan) dalam bentuk dua kartu radio
function StatusPicker({ name, value, onChange, testIdPrefix }) {
  return (
    <fieldset>
      <legend className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis laporan</legend>
      <div className="grid grid-cols-2 gap-2.5">
        {OPTIONS.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              data-testid={`${testIdPrefix}-${option.value}`}
              className={`flex flex-col rounded-2xl border-2 px-4 py-3 transition-colors ${
                checked ? option.active : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="font-display text-base font-bold">{STATUS_LABEL[option.value]}</span>
              <span className="text-xs opacity-80">{option.hint}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default StatusPicker;
