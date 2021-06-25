import { config } from '../../config';

export const linkUrl = (projectName, scenarioName, id): string | undefined => {
  if (!config.feUrl) {
    return;
  }
  const baseUrl = config.feUrl;
  const url = `${baseUrl}/project/${projectName}/scenario/${scenarioName}/item/${id}`;
  return url;
};
