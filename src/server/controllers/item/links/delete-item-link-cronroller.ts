import { Request, Response, NextFunction } from 'express';

export const deleteItemLinkController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, itemId, tokenId } = req.params;

};
