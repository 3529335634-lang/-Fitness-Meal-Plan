# Fit Diet MVP

手机优先的健身饮食规划记录 PWA。第一版服务个人使用：设置目标，自动生成每日目标，记录计划饮食和实际摄入，并对比完成情况。

## 项目结构

- `src/app/page.tsx`：首页 / 今日概览
- `src/app/goal/page.tsx`：目标设置
- `src/app/plan/page.tsx`：计划饮食
- `src/app/actual/page.tsx`：实际摄入与饮水
- `src/app/stats/page.tsx`：最近 7 天统计
- `src/app/foods/page.tsx`：食物模板
- `src/app/cycles/page.tsx`：当前计划周期与历史周期
- `src/components/`：移动端页面壳、表单、列表、指标卡、趋势图
- `src/lib/types.ts`：数据模型
- `src/lib/nutrition.ts`：目标计算、营养估算、完成率
- `src/lib/storage.ts`：localStorage 本地保存
- `src/data/food-database.json`：内置本地食物数据库
- `public/manifest.webmanifest`、`public/sw.js`：PWA 支持

## 数据模型

核心数据统一保存在 `AppData` 中，便于后续迁移到后端数据库：

- `goal`：当前体重、目标体重、目标类型
- `foodEntries`：计划饮食和实际摄入记录，使用 `mode` 区分
- `foodTemplates`：用户自定义食物
- `waterLogs`：每日计划饮水和实际饮水
- `weightLogs`：每日体重记录
- `activePlan`：当前进行中的计划周期
- `planCycles`：已结束并归档的历史计划周期

## MVP 实现方案

1. 目标设置：根据当前体重和目标类型估算每日热量、蛋白质、脂肪、碳水、饮水。
2. 食物估算：内置食物库独立保存在 JSON 中，用户输入名称后模糊搜索，按生重/熟重和重量自动换算。
3. 计划与实际：同一套食物记录结构，分别保存为 `plan` 和 `actual`。
4. 今日概览：展示目标、实际、计划差值与综合完成率。
5. 统计页：展示最近 7 天热量、蛋白质、碳水、脂肪、饮水和体重趋势。
6. 计划周期：结束当前计划时自动归档周期数据并生成总结，下一周期重新开始记录。
7. 本地保存：第一版使用 `localStorage`，结构接近后端实体表，后续可迁移到 IndexedDB 或数据库。

## 后续扩展

- Recharts 图表增强
- IndexedDB
- 食物数据库校对工具和批量导入
- 扫码和拍照识别
- AI 饮食建议
- 云同步和账号系统

## 食物数据库

内置数据库位于 `src/data/food-database.json`，当前包含 226 条国内常见健身食物记录。生重和熟重拆分为不同记录，每条包含：

- `name`
- `raw_or_cooked`
- `kcal_per_100g`
- `protein_per_100g`
- `fat_per_100g`
- `carbs_per_100g`
- `source`

系统食物库不写死在业务代码中。用户自定义食物保存在 localStorage 的 `foodTemplates` 中，录入时会和系统库一起参与搜索。

## 本地运行

```bash
pnpm install
pnpm dev
```
