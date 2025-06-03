export const getInspections = () => {
  const saved = localStorage.getItem('inspections');
  return saved ? JSON.parse(saved) : [];
};

export const saveInspection = (newInspection) => {
  const inspections = getInspections();
  inspections.push(newInspection);
  localStorage.setItem('inspections', JSON.stringify(inspections));
};
