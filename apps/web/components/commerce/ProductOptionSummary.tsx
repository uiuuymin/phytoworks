import type { ProductOptionGroup } from "@/data/products";

import styles from "./ProductOptionSummary.module.css";

type ProductOptionSummaryProps = {
  optionGroups: readonly ProductOptionGroup[];
};

const selectionLabels = {
  single: "1개 선택",
  multiple: "복수 선택",
} satisfies Record<ProductOptionGroup["selection"], string>;

export function ProductOptionSummary({
  optionGroups,
}: ProductOptionSummaryProps) {
  if (optionGroups.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="option-heading">
      <div className={styles.headingGroup}>
        <h2 id="option-heading">선택 가능한 구성</h2>
        <p className={styles.description}>
          카탈로그에 기재된 구성 후보입니다. 옵션별 추가 금액과 조합 가능 여부는
          견적에서 확정됩니다.
        </p>
      </div>

      <div className={styles.groups}>
        {optionGroups.map((group) => (
          <section className={styles.group} key={group.id}>
            <div className={styles.groupHeading}>
              <h3>{group.label}</h3>
              <span>{selectionLabels[group.selection]}</span>
            </div>
            <ul className={styles.options}>
              {group.options.map((option) => (
                <li key={option.id}>{option.label}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
