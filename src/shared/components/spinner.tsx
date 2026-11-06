type SpinnerProps = {
  label?: string;
  // Kích thước, mặc định size-6
  sizeClass?: string;
};

// Vòng tròn xoay báo đang tải. Màu theo chữ xung quanh (currentColor).
export function Spinner({ label = "Đang tải", sizeClass = "size-6" }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <svg className={`${sizeClass} animate-spin text-red-600`} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </span>
  );
}
