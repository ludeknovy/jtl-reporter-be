export const linkUrl = (projectName, scenarioName, id): string | undefined => {
  if (!process.env.FE_URL) {
    return;
  }
  const baseUrl = process.env.FE_URL;
  const url = `${baseUrl}/project/${projectName}/scenario/${scenarioName}/items/${id}`;
  return url;
};
