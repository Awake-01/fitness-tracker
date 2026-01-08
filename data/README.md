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
