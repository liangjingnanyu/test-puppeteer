---
description: 自动提交代码到当前分支
auto_execution_mode: 1
---

# 自动提交工作流

**仅按顺序执行以下步骤命令，不允许执行其他操作**
**如遇异常(如代码冲突)则必须暂停任务，等待用户解决问题，并提示用户异常文件链接和输入"继续"等确认词语继续任务**：
**根据变更文件内容(排除合并 master 操作引入的修改)自动生成 commit 信息**

第 1 步
`git pull origin $(git branch --show-current)`
第 2 步
`git add .`
第 3 步
`git commit -m "xxx: xxx..."`
第 4 步
`git push`