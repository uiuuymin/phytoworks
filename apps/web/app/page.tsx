type PurchaseMode = "견적 문의" | "학습용 구매";

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  purchaseMode: PurchaseMode;
};

const products: Product[] = [
  {
    id: "nitro",
    name: "NITRO Plant Growth System",
    category: "생육·표현형 분석 시스템",
    description:
      "환경 제어, 멀티모달 이미징과 AI 기반 형질 분석을 연결하는 연구 플랫폼입니다.",
    purchaseMode: "견적 문의",
  },
  {
    id: "thermal-imaging",
    name: "Thermal Imaging Module",
    category: "이미징 모듈",
    description:
      "적외선 열화상으로 식물의 온도 변화와 스트레스 패턴을 관찰합니다.",
    purchaseMode: "학습용 구매",
  },
  {
    id: "chlorophyll-fluorescence",
    name: "Chlorophyll Fluorescence Module",
    category: "이미징 모듈",
    description:
      "엽록소 형광 정보를 촬영해 눈으로 보기 어려운 식물의 생리 상태를 분석합니다.",
    purchaseMode: "학습용 구매",
  },
];

export default function Home() {
  return (
    <main className="container page-layout flow">
      <header className="flow">
        <p>PhytoWorks Shop · Learning Demo</p>
        <h1>식물 연구와 육종을 위한 기술</h1>
        <p>
          PhytoWorks의 생육 시스템, 이미징 모듈과 분석 기술을 바탕으로 쇼핑몰의
          상품·주문·결제 흐름을 학습합니다.
        </p>
      </header>

      <section className="flow" aria-labelledby="products-heading">
        <h2 id="products-heading">연구 제품과 모듈</h2>
        <ul className="flow">
          {products.map((product) => (
            <li key={product.id}>
              <article className="flow">
                <p>{product.category}</p>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>판매 방식: {product.purchaseMode}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <aside className="flow" aria-labelledby="demo-notice-heading">
        <h2 id="demo-notice-heading">학습용 Demo 안내</h2>
        <p>
          이 화면의 직접 구매 가능 여부와 이후 추가할 가격은 실제 PhytoWorks의
          판매 정책이 아닙니다. 결제 기능은 Toss Payments 테스트 환경에서만
          실습합니다.
        </p>
        <a href="https://phyto-works.com/ko/nitro">NITRO 공식 정보 보기</a>
      </aside>
    </main>
  );
}
