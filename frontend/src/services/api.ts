export const getHealth = async () => {
  const res = await fetch('/api/health');
  return res.json();
};