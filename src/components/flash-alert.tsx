type FlashAlertProps = {
  error?: string | string[];
  success?: string | string[];
};

function normalizeValue(value?: string | string[]) {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export function FlashAlert({ error, success }: FlashAlertProps) {
  const errorMessage = normalizeValue(error);
  const successMessage = normalizeValue(success);

  if (!errorMessage && !successMessage) {
    return null;
  }

  if (errorMessage) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
        {errorMessage}
      </p>
    );
  }

  return (
    <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
      {successMessage}
    </p>
  );
}
