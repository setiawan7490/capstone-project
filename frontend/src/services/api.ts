const BASE_URL = "http://localhost:5000/api";

export const getHealth = async () => {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
};