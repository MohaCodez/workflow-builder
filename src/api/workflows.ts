import express from 'express';
import WorkflowExecutor from './WorkflowExecutor';

const router = express.Router();

router.post('/workflows/:id/execute', async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { trigger } = req.body;
  
  const executor = new WorkflowExecutor();
  const result = await executor.execute(id, trigger);
  
  res.json(result);
}); 