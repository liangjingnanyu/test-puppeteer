---
description: 智能切换对话风格（极简/渐进，自动归类参数，极简输出，无需确认，无依赖）
---

// turbo-all

1. 解析参数，确定目标风格：

   - 如果参数为空、包含"极简"、"极速"、"auto"、"默认"等，则设置 STYLE="极速"
   - 如果参数包含"渐进"、"详细"、"慢速"等，则设置 STYLE="渐进"
   - 其他情况提示错误并退出

2. 直接修改 .windsurf/contexts/default.json 文件：

   ```bash
   # 跨平台兼容的 sed 命令
   if [[ "$OSTYPE" == "darwin"* ]]; then
     sed -i '' 's/"memories": \[\"[^\"]*\"/"memories": ["'$STYLE'"/g' .windsurf/contexts/default.json
   else
     sed -i 's/"memories": \[\"[^\"]*\"/"memories": ["'$STYLE'"/g' .windsurf/contexts/default.json
   fi
   ```

3. 后续所有对话和任务都严格按照当前 memories 风格要求执行。
