"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LANG, dict, type DictKey, type Lang } from "@/lib/i18n";
import type { CartLine } from "@/lib/types";

// ---------- Language ----------

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
};

const LanguageContext = createContext<LangCtx | null>(null);

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within Providers");
  return ctx;
}

// ---------- Cart ----------

type CartCtx = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartCtx | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within Providers");
  return ctx;
}

const LANG_KEY = "tradicionale_lang";
const CART_KEY = "tradicionale_cart";

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted state once on mount.
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_KEY) as Lang | null;
      if (savedLang === "sq" || savedLang === "en") setLangState(savedLang);
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) setLines(JSON.parse(savedCart));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LANG_KEY, lang);
  }, [lang, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = useCallback((key: DictKey) => dict[key][lang], [lang]);

  const add = useCallback(
    (line: Omit<CartLine, "quantity">, qty = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === line.productId);
        if (existing) {
          return prev.map((l) =>
            l.productId === line.productId
              ? { ...l, quantity: l.quantity + qty }
              : l
          );
        }
        return [...prev, { ...line, quantity: qty }];
      });
    },
    []
  );

  const setQty = useCallback((productId: number, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, quantity: qty } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const remove = useCallback((productId: number) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(
    () => lines.reduce((s, l) => s + l.quantity, 0),
    [lines]
  );
  const total = useMemo(
    () => lines.reduce((s, l) => s + l.price * l.quantity, 0),
    [lines]
  );

  const langValue = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  const cartValue = useMemo(
    () => ({ lines, add, setQty, remove, clear, count, total }),
    [lines, add, setQty, remove, clear, count, total]
  );

  return (
    <LanguageContext.Provider value={langValue}>
      <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>
    </LanguageContext.Provider>
  );
}
