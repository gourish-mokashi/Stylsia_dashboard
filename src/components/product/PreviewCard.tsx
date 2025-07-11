import React from "react";

interface PreviewCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  brand: string;
  onClick: () => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ name, image, price, brand, onClick }) => (
  <div className="bg-white rounded shadow p-2 cursor-pointer" onClick={onClick} tabIndex={0} role="button" aria-label={`View details for ${name}`}
    onKeyDown={e => { if (e.key === 'Enter') onClick(); }}>
    <img src={image} alt={name} loading="lazy" className="w-full h-32 object-cover rounded" />
    <div className="mt-2">
      <div className="font-semibold text-sm">{name}</div>
      <div className="text-xs text-gray-500">{brand}</div>
      <div className="text-primary font-bold mt-1">₹{price}</div>
    </div>
  </div>
);
