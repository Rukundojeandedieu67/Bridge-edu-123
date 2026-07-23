function FormInput({
  label,
  name,
  type = 'text',
  register,
  error,
  placeholder,
  autoComplete,
  ...props
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        {...register(name)}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        {...props}
      />
      {error ? <span className="block text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}

export default FormInput
