"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import type { ProductOptionGroup } from "@/data/products";

import { useCart } from "../cart/CartProvider";
import type { QuoteSelection } from "../cart/quote-state";
import styles from "./QuoteConfigurator.module.css";

type QuoteConfiguratorProps = {
  productId: string;
  optionGroups: readonly ProductOptionGroup[];
};

type SelectionState = Record<string, string[]>;

function createInitialSelections(
  optionGroups: readonly ProductOptionGroup[],
): SelectionState {
  return Object.fromEntries(
    optionGroups.map((group) => [group.id, [] as string[]]),
  );
}

export function QuoteConfigurator({
  productId,
  optionGroups,
}: QuoteConfiguratorProps) {
  const { addQuoteItem, hasHydrated } = useCart();
  const [selections, setSelections] = useState(() =>
    createInitialSelections(optionGroups),
  );

  function selectSingleOption(groupId: string, optionId: string) {
    setSelections((current) => ({ ...current, [groupId]: [optionId] }));
  }

  function toggleMultipleOption(groupId: string, optionId: string) {
    setSelections((current) => {
      const selectedOptionIds = current[groupId] ?? [];
      const nextOptionIds = selectedOptionIds.includes(optionId)
        ? selectedOptionIds.filter((id) => id !== optionId)
        : [...selectedOptionIds, optionId];

      return { ...current, [groupId]: nextOptionIds };
    });
  }

  function handleSubmit() {
    const quoteSelections: QuoteSelection[] = optionGroups.map((group) => ({
      groupId: group.id,
      optionIds: selections[group.id] ?? [],
    }));

    addQuoteItem(productId, quoteSelections);
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div className={styles.groups}>
        {optionGroups.map((group) => (
          <fieldset className={styles.group} key={group.id}>
            <legend>{group.label}</legend>
            <p className={styles.selectionHint}>
              {group.selection === "single"
                ? "하나를 선택하세요."
                : "필요한 항목을 선택하세요."}
            </p>
            <div className={styles.options}>
              {group.options.map((option) => {
                const inputId = `quote-${group.id}-${option.id}`;
                const isSelected =
                  selections[group.id]?.includes(option.id) ?? false;

                return (
                  <label
                    className={styles.option}
                    htmlFor={inputId}
                    key={option.id}
                  >
                    <input
                      id={inputId}
                      name={group.id}
                      type={group.selection === "single" ? "radio" : "checkbox"}
                      value={option.id}
                      checked={isSelected}
                      onChange={() =>
                        group.selection === "single"
                          ? selectSingleOption(group.id, option.id)
                          : toggleMultipleOption(group.id, option.id)
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <p className={styles.note}>
        선택한 구성은 이 브라우저의 견적함에 임시 저장됩니다. 옵션별 추가 금액은
        견적에서 확정됩니다.
      </p>

      <div className={styles.actions}>
        <Button type="submit" disabled={!hasHydrated}>
          견적함에 담기
        </Button>
        <LinkButton variant="secondary" href="/cart#quote-box">
          견적함 보기
        </LinkButton>
      </div>
    </form>
  );
}
