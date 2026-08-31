import type {
  CatalogProduct,
  CatalogPurchaseMode,
  ProductOptionGroup,
  ProductPricing,
} from "./product-types";

type ProductApiItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  summary: string;
  features: readonly string[];
  mediaLabel: string;
  purchaseMode: CatalogPurchaseMode;
  pricing: ProductPricing;
  optionGroups: readonly ProductOptionGroup[];
};

type ProductApiListResponse = {
  items: readonly ProductApiItem[];
};

export class ProductApiError extends Error {
  constructor() {
    super("Product API is unavailable.");
    this.name = "ProductApiError";
  }
}

function getApiBaseUrl() {
  return process.env.API_BASE_URL?.trim() || "http://localhost:3001";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProductApiListResponse(
  value: unknown,
): value is ProductApiListResponse {
  return isRecord(value) && Array.isArray(value.items);
}

function isProductApiItem(value: unknown): value is ProductApiItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.category === "string" &&
    typeof value.description === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.features) &&
    typeof value.mediaLabel === "string" &&
    (value.purchaseMode === "QUOTE_REQUIRED" ||
      value.purchaseMode === "DIRECT_PURCHASE") &&
    isRecord(value.pricing) &&
    Array.isArray(value.optionGroups)
  );
}

async function fetchProductApi(path: string): Promise<unknown> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ProductApiError();
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ProductApiError) {
      throw error;
    }

    throw new ProductApiError();
  }
}

function toCatalogProduct(product: ProductApiItem): CatalogProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    purchaseMode: product.purchaseMode,
    pricing: product.pricing,
    optionGroups: product.optionGroups,
    details: {
      summary: product.summary,
      features: product.features,
      mediaLabel: product.mediaLabel,
    },
  };
}

export async function getProducts(): Promise<readonly CatalogProduct[]> {
  const response = await fetchProductApi("/api/products");

  if (
    !isProductApiListResponse(response) ||
    !response.items.every(isProductApiItem)
  ) {
    throw new ProductApiError();
  }

  return response.items.map(toCatalogProduct);
}

export async function getProductById(
  productId: string,
): Promise<CatalogProduct | null> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/products/${encodeURIComponent(productId)}`,
      { cache: "no-store" },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new ProductApiError();
    }

    const product: unknown = await response.json();

    if (!isProductApiItem(product)) {
      throw new ProductApiError();
    }

    return toCatalogProduct(product);
  } catch (error) {
    if (error instanceof ProductApiError) {
      throw error;
    }

    throw new ProductApiError();
  }
}
