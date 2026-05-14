export const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "";
export const WORKER_JWT_SECRET = JWT_SECRET + "worker";
export const TOTAL_DECIMALS = 1000_000;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";

export const getCookieDomain = () => {
  switch (process.env.NODE_ENV) {
    case "production":
      // For production domain
      return process.env.COOKIE_DOMAIN || ".kovaikongumatrimony.com"; // Use your actual domain

    case "staging":
      // For staging environment if needed
      return process.env.COOKIE_DOMAIN || ".staging.yourdomain.com";

    default:
      // For development
      return process.env.COOKIE_DOMAIN || "192.168.29.126";
  }
};
