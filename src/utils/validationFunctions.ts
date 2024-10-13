export function isExpirationMoreThan24HoursFromNow(
  expirationDate: Date | string | number
): boolean {
  let expiration: Date;

  if (expirationDate instanceof Date) {
    expiration = expirationDate;
  } else if (
    typeof expirationDate === "string" ||
    typeof expirationDate === "number"
  ) {
    expiration = new Date(expirationDate);
  } else {
    throw new Error("Invalid expiration date type");
  }

  if (isNaN(expiration.getTime())) {
    throw new Error("Invalid expiration date");
  }

  const now = new Date();
  const timeDifference = expiration.getTime() - now.getTime();

  return timeDifference > 24 * 60 * 60 * 1000;
}

export const isExpired = (expires_at: string | Date) => {
  const expirationDate = new Date(expires_at);
  const currentDate = new Date();

  return expirationDate < currentDate;
};
