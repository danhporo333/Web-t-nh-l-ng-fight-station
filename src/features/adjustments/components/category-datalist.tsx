export const CATEGORY_LIST_ID = "penalty-categories";

type CategoryDatalistProps = { categories: string[] };

// Gợi ý các loại lỗi đã dùng cho ô "Loại lỗi". Đặt một lần trong trang.
export function CategoryDatalist({ categories }: CategoryDatalistProps) {
  return (
    <datalist id={CATEGORY_LIST_ID}>
      {categories.map((c) => (
        <option key={c} value={c} />
      ))}
    </datalist>
  );
}
