import styles from "./ProductMediaPlaceholder.module.css";

type ProductMediaPlaceholderProps = {
  category: string;
  label: string;
};

export function ProductMediaPlaceholder({
  category,
  label,
}: ProductMediaPlaceholderProps) {
  return (
    <div className={styles.media} aria-hidden="true">
      <span className={styles.category}>{category}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
