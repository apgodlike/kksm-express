export const JWT_SECRET = "AP";
export const WORKER_JWT_SECRET = JWT_SECRET + "worker";
export const TOTAL_DECIMALS = 1000_000;
export const JWT_ACCESS_SECRET = "AP";
export const JWT_REFRESH_SECRET = "REF";

export const getCookieDomain = () => {
  switch (process.env.NODE_ENV) {
    case "production":
      // For production domain
      return process.env.COOKIE_DOMAIN || "kksm-express.vercel.app"; // Use your actual domain

    case "staging":
      // For staging environment if needed
      return process.env.COOKIE_DOMAIN || ".staging.yourdomain.com";

    default:
      // For development
      return process.env.COOKIE_DOMAIN || "192.168.29.126";
  }
};
