import { QueueCondition } from "../enums/OrderStatus";

export const QueueThreshold = {
  SEPI_MAX: 5,
  SEDANG_MAX: 15,
} as const;

export function getQueueCondition(activeOrderCount: number): QueueCondition {
  if (activeOrderCount <= QueueThreshold.SEPI_MAX) {
    return QueueCondition.SEPI;
  }
  if (activeOrderCount <= QueueThreshold.SEDANG_MAX) {
    return QueueCondition.SEDANG;
  }
  return QueueCondition.RAMAI;
}
