# 健身记录工具

一个功能完整的健身记录与计划管理工具，帮助用户系统追踪健身进度，管理训练计划，记录训练数据。

## 主要功能

### 1. 实时训练记录
- 根据当前星期几自动显示当天训练内容
- 支持记录每组训练重量和次数
- **一键完成**功能：快速标记整个训练项目为已完成（适用于重量未变化的常规训练）
- 有氧训练项目特殊显示，记录时间和配速信息

### 2. 历史训练记录
- 查看过往所有训练记录
- 支持按星期或日期筛选查看
- 清晰展示每次训练的项目、组数和重量
- 有氧训练项目显示时间和配速数据

### 3. 训练计划管理
- 创建和编辑个性化训练计划
- 为每天设置"训练日"或"休息日"
- 按优化顺序选择训练部位：肩、胸、背、肱三头、肱二头、核心、臀、腿、有氧
- 为每个部位选择推荐的训练动作
- 支持有氧训练项目（跑步机、椭圆机）的配置

## 推荐动作管理

### 查看推荐动作
推荐动作定义在 `js/trainingplan.js` 文件中的 `recommendedExercises` 常量中。

### 添加新的训练部位
```javascript
const recommendedExercises = {
    // 现有部位...
    newPart: { 
        name: '部位名称', 
        exercises: ['动作1', '动作2', '动作3'] 
    }
};
```

### 添加新的训练动作
在对应部位的 `exercises` 数组中添加动作名称：
```javascript
const recommendedExercises = {
    shoulders: { 
        name: '现有部位', 
        exercises: [
            '现有动作1',
            '现有动作2',
            '新动作名称'  // 添加新动作
        ] 
    },
    // 其他部位...
};
```

### 删除训练动作
从对应部位的 `exercises` 数组中删除动作名称。

### 修改训练动作
从对应部位的 `exercises` 数组中修改动作名称。

## 计量单位映射管理

### 查看计量单位映射
计量单位映射定义在 `js/main.js` 文件中的 `exerciseUnitMap` 对象中。

### 添加新的计量单位映射
根据训练类型添加对应的映射：

```javascript
const exerciseUnitMap = {
    // 计数训练（个）
    '动作名称': exerciseTypes.COUNT,
    
    // 计时训练（秒）
    '动作名称': exerciseTypes.TIME,
    
    // 有氧训练（分钟）
    '动作名称': exerciseTypes.CARDIO,
    
    // 重量训练（kg）- 无需映射，系统默认
    // '动作名称': exerciseTypes.WEIGHT,
    
    // 默认类型
    'default': exerciseTypes.WEIGHT
};
