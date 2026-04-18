export const getCountryFromIP = (ip) => {
  if (!ip) return "Unknown";
  if (ip.startsWith("192") || ip.startsWith("172.16")) return "India";
  if (ip.startsWith("10") || ip.startsWith("172.31")) return "USA";
  if (ip.startsWith("203") || ip.startsWith("202")) return "Australia";
  if (ip.startsWith("185") || ip.startsWith("185.220")) return "Germany";
  if (ip.startsWith("5") || ip.startsWith("45")) return "Brazil";
  return "Europe";
};
