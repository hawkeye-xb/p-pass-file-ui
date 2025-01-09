/*
Scheduler:
：待执行任务；每次操作都更新本地存储；
所有任务状态都是waited
1. 按照顺序执行（修改状态为processing）
2. 优先传输，立即执行（修改状态为processing），被动终止当前执行队尾（修改状态为paused）；同时将优先任务放到队头；
3. 任何执行完成之后，任务状态更新为finished；重新从待执行任务中获取任务；（waited 和 paused）的状态的
4. 强行终止等待的和执行的任务；（修改状态为canceled）
*/ 