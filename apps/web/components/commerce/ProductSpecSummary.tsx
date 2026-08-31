import type { ProductSpecGroup } from "@/lib/product-types";

import styles from "./ProductSpecSummary.module.css";

type ProductSpecSummaryProps = {
  specGroups: readonly ProductSpecGroup[];
};

export function ProductSpecSummary({ specGroups }: ProductSpecSummaryProps) {
  if (specGroups.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="spec-heading">
      <div className={styles.headingGroup}>
        <h2 id="spec-heading">기술 사양</h2>
        <p className={styles.description}>
          제공된 NITRO 카탈로그의 기본 구성 기준입니다. 옵션 선택과 커스텀
          구성에 따라 달라질 수 있습니다.
        </p>
      </div>

      <div className={styles.groups}>
        {specGroups.map((group) => (
          <section className={styles.group} key={group.id}>
            <h3>{group.label}</h3>
            <dl className={styles.specs}>
              {group.items.map((item) => (
                <div className={styles.spec} key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </section>
  );
}
