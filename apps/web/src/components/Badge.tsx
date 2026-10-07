import React from "react";
import {
  OrderStatus,
  OrderStatusLabel,
  QueueCondition,
  QueueConditionLabel,
} from "@kantinq/shared";

interface StatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const getStyle = () => {
    switch (status) {
      case OrderStatus.WAITING:
        return "bg-amber-100 text-amber-800 border-amber-300";
      case OrderStatus.PROCESSING:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case OrderStatus.READY:
        return "bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse";
      case OrderStatus.COMPLETED:
        return "bg-slate-100 text-slate-700 border-slate-300";
      case OrderStatus.CANCELLED:
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const sizeClass = {
    sm: "px-2 py-0.5 text-xs font-semibold",
    md: "px-3 py-1 text-sm font-semibold",
    lg: "px-4 py-1.5 text-base font-bold",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${getStyle()} ${sizeClass}`}
    >
      {OrderStatusLabel[status] || status}
    </span>
  );
};

interface QueueConditionBadgeProps {
  condition: QueueCondition;
  size?: "sm" | "md" | "lg";
}

export const QueueConditionBadge: React.FC<QueueConditionBadgeProps> = ({
  condition,
  size = "md",
}) => {
  const getStyle = () => {
    switch (condition) {
      case QueueCondition.SEPI:
        return "bg-emerald-600 text-white";
      case QueueCondition.SEDANG:
        return "bg-amber-500 text-white";
      case QueueCondition.RAMAI:
        return "bg-rose-600 text-white animate-pulse";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const sizeClass = {
    sm: "px-2 py-0.5 text-xs font-semibold",
    md: "px-3 py-1 text-sm font-bold",
    lg: "px-4 py-1.5 text-base font-extrabold",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full shadow-sm ${getStyle()} ${sizeClass}`}
    >
      <span className="w-2 h-2 rounded-full bg-white opacity-80"></span>
      <span>Antrean {QueueConditionLabel[condition]}</span>
    </span>
  );
};
