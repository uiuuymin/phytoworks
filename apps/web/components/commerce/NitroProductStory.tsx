import Image from "next/image";

import { getProductById } from "@/data/products";

import styles from "./NitroProductStory.module.css";

const analysisProducts = [
  {
    id: "thermal-imaging",
    title: "Thermal Imaging",
    description: "식물의 온도 변화와 스트레스 패턴을 관찰합니다.",
  },
  {
    id: "chlorophyll-fluorescence",
    title: "Chlorophyll Fluorescence",
    description: "눈으로 보기 어려운 생리 상태와 변화를 분석합니다.",
  },
] as const;

type NitroProductStoryProps = {
  summary: string;
  features: readonly string[];
};

export function NitroProductStory({
  summary,
  features,
}: NitroProductStoryProps) {
  const summaryLines = summary.split(", ");

  return (
    <div className={styles.story}>
      <section
        className={styles.manifesto}
        aria-labelledby="nitro-story-heading"
      >
        <p className={styles.eyebrow}>Research workflow</p>
        <h2 id="nitro-story-heading">
          <span>{summaryLines[0]},</span>
          <span>{summaryLines.slice(1).join(", ")}</span>
        </h2>
      </section>

      <section className={styles.workflow} aria-labelledby="workflow-heading">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>From control to insight</p>
          <h2 id="workflow-heading">환경을 제어하고, 반복해서 관찰합니다.</h2>
        </div>

        <ol className={styles.workflowList}>
          <li>
            <span className={styles.stepNumber}>01</span>
            <h3>Control</h3>
            <p>{features[0]}</p>
          </li>
          <li>
            <span className={styles.stepNumber}>02</span>
            <h3>Capture</h3>
            <p>{features[1]}</p>
          </li>
          <li>
            <span className={styles.stepNumber}>03</span>
            <h3>Connect</h3>
            <p>{features[2]}</p>
          </li>
        </ol>
      </section>

      <section className={styles.analysis} aria-labelledby="analysis-heading">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Multimodal imaging</p>
          <h2 id="analysis-heading">
            같은 연구 흐름에서 서로 다른 신호를 읽습니다.
          </h2>
        </div>

        <div className={styles.analysisGrid}>
          {analysisProducts.map((analysisProduct) => {
            const product = getProductById(analysisProduct.id);

            if (!product) {
              return null;
            }

            return (
              <figure className={styles.analysisCard} key={analysisProduct.id}>
                <div className={styles.analysisMedia}>
                  <Image
                    fill
                    src={product.details.media.src}
                    alt={product.details.media.alt}
                    sizes="(min-width: 64rem) 50vw, 100vw"
                  />
                </div>
                <figcaption>
                  <h3>{analysisProduct.title}</h3>
                  <p>{analysisProduct.description}</p>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>
    </div>
  );
}
