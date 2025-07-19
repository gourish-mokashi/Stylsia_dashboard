import React, { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiChevronDown,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

interface ShiftingDropDownProps {
  onCategorySelect?: (category: string, subcategory?: string) => void;
}

export const ShiftingDropDown: React.FC<ShiftingDropDownProps> = ({ onCategorySelect }) => {
  return (
    <div className="flex justify-center">
      <Tabs onCategorySelect={onCategorySelect} />
    </div>
  );
};

const Tabs = ({ onCategorySelect }: { onCategorySelect?: (category: string, subcategory?: string) => void }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [dir, setDir] = useState<string | null>(null);

  const handleSetSelected = (val: number | null) => {
    if (typeof selected === "number" && typeof val === "number") {
      setDir(selected > val ? "r" : "l");
    } else if (val === null) {
      setDir(null);
    }

    setSelected(val);
  };

  return (
    <div
      onMouseLeave={() => handleSetSelected(null)}
      className="relative flex h-fit gap-2"
    >
      {TABS.map((t) => {
        return (
          <Tab
            key={t.id}
            selected={selected}
            handleSetSelected={handleSetSelected}
            tab={t.id}
          >
            {t.title}
          </Tab>
        );
      })}

      <AnimatePresence>
        {selected && <Content dir={dir} selected={selected} onCategorySelect={onCategorySelect} />}
      </AnimatePresence>
    </div>
  );
};

const Tab = ({ children, tab, handleSetSelected, selected }: {
  children: React.ReactNode;
  tab: number;
  handleSetSelected: (val: number | null) => void;
  selected: number | null;
}) => {
  return (
    <button
      id={`shift-tab-${tab}`}
      onMouseEnter={() => handleSetSelected(tab)}
      onClick={() => handleSetSelected(tab)}
      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors ${
        selected === tab
          ? " bg-gray-100 text-gray-900"
          : "text-gray-700 hover:text-gray-900"
      }`}
    >
      <span className="font-medium">{children}</span>
      <FiChevronDown
        className={`transition-transform ${
          selected === tab ? "rotate-180" : ""
        }`}
      />
    </button>
  );
};

const Content = ({ selected, dir, onCategorySelect }: {
  selected: number | null;
  dir: string | null;
  onCategorySelect?: (category: string, subcategory?: string) => void;
}) => {
  return (
    <motion.div
      id="overlay-content"
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 8,
      }}
      className="absolute left-0 top-[calc(100%_+_24px)] w-96 rounded-lg border border-gray-200 bg-white shadow-lg p-4"
    >
      <Bridge />
      <Nub selected={selected} />

      {TABS.map((t) => {
        return (
          <div className="overflow-hidden" key={t.id}>
            {selected === t.id && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: dir === "l" ? 100 : dir === "r" ? -100 : 0,
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <t.Component onCategorySelect={onCategorySelect} />
              </motion.div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

const Bridge = () => (
  <div className="absolute -top-[24px] left-0 right-0 h-[24px]" />
);

const Nub = ({ selected }: { selected: number | null }) => {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    moveNub();
  }, [selected]);

  const moveNub = () => {
    if (selected) {
      const hoveredTab = document.getElementById(`shift-tab-${selected}`);
      const overlayContent = document.getElementById("overlay-content");

      if (!hoveredTab || !overlayContent) return;

      const tabRect = hoveredTab.getBoundingClientRect();
      const { left: contentLeft } = overlayContent.getBoundingClientRect();

      const tabCenter = tabRect.left + tabRect.width / 2 - contentLeft;

      setLeft(tabCenter);
    }
  };

  return (
    <motion.span
      style={{
        clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)",
      }}
      animate={{ left }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl border border-gray-200 bg-white"
    />
  );
};

const Women = ({ onCategorySelect }: { onCategorySelect?: (category: string, subcategory?: string) => void }) => {
  const subcategories = [
    { name: "Tops", items: ["T-Shirts", "Shirts", "Blouses", "Tank Tops"] },
    { name: "Bottoms", items: ["Jeans", "Trousers", "Skirts", "Shorts"] },
    { name: "Dresses", items: ["Casual Dresses", "Party Dresses", "Maxi Dresses", "Mini Dresses"] },
  ];

  return (
    <div>
      <div className="flex gap-6">
        {subcategories.map((category) => (
          <div key={category.name}>
            <h3 className="mb-2 text-sm font-medium text-gray-900">{category.name}</h3>
            {category.items.map((item) => (
              <button
                key={item}
                onClick={() => onCategorySelect?.("Women", item)}
                className="mb-1 block text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        ))}
      </div>

      <button 
        onClick={() => onCategorySelect?.("Women")}
        className="ml-auto mt-4 flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
      >
        <span>View All Women</span>
        <FiArrowRight />
      </button>
    </div>
  );
};

const Men = ({ onCategorySelect }: { onCategorySelect?: (category: string, subcategory?: string) => void }) => {
  const subcategories = [
    { name: "Tops", items: ["T-Shirts", "Shirts", "Polo Shirts", "Hoodies"] },
    { name: "Bottoms", items: ["Jeans", "Chinos", "Shorts", "Trousers"] },
    { name: "Formal", items: ["Suits", "Blazers", "Dress Shirts", "Ties"] },
  ];

  return (
    <div>
      <div className="flex gap-6">
        {subcategories.map((category) => (
          <div key={category.name}>
            <h3 className="mb-2 text-sm font-medium text-gray-900">{category.name}</h3>
            {category.items.map((item) => (
              <button
                key={item}
                onClick={() => onCategorySelect?.("Men", item)}
                className="mb-1 block text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        ))}
      </div>

      <button 
        onClick={() => onCategorySelect?.("Men")}
        className="ml-auto mt-4 flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
      >
        <span>View All Men</span>
        <FiArrowRight />
      </button>
    </div>
  );
};

const TABS = [
  {
    title: "Women",
    Component: Women,
  },
  {
    title: "Men",
    Component: Men,
  },
].map((n, idx) => ({ ...n, id: idx + 1 }));
