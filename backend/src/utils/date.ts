import { AppError } from "./app-error.js";

const durationPattern = /^(\d+)([smhd])$/;

export const addDurationToDate = (duration: string, baseDate = new Date()): Date => {
  const parsed = durationPattern.exec(duration.trim());

  if (!parsed) {
    throw new AppError(500, `Invalid duration format: ${duration}`, "INVALID_DURATION");
  }

  const amount = Number(parsed[1]);
  const unit = parsed[2];
  const msPerUnit: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000
  };

  return new Date(baseDate.getTime() + amount * msPerUnit[unit]);
};
