// 全局变量
let currentMode = 'create'; // 'create' 或 'edit'
let currentPlanName = '新训练计划';
let originalPlanName = '';
let currentPlan = {
    name: currentPlanName,
    isDefault: false,
    exercises: {
        '星期一': [],
        '星期二': [],
        '星期三': '休息日',
        '星期四': [],
        '星期五': [],
        '星期六': [],
        '星期日': '休息日'
    }
};

// 训练部位对应的推荐动作
const recommendedExercises = {
    shoulders: { name: '肩', exercises: ['杠铃肩推', '哑铃肩推', '侧平举', '前平举', '俯身飞鸟', '反向蝴蝶机', '站姿哑铃推举'] },
    chest: { name: '胸', exercises: ['平板杠铃卧推', '上斜哑铃卧推', '平板哑铃飞鸟', '俯卧撑', '蝴蝶机夹胸', '绳索夹胸'] },
    back: { name: '背', exercises: ['引体向上', '辅助引体向上', '高位下拉', '杠铃划船', '哑铃单臂划船', '坐姿绳索划船'] },
    triceps: { name: '肱三头', exercises: ['哑铃颈后臂屈伸', '绳索三头下压', '窄距卧推'] },
    biceps: { name: '肱二头', exercises: ['杠铃弯举', '哑铃交替弯举', '绳索弯举', '反握引体向上'] },
    core: { name: '核心', exercises: ['平板支撑', '侧平板支撑', '卷腹', '反向卷腹', '仰卧起坐', '俄罗斯转体'] },
    glutes: { name: '臀', exercises: ['杠铃深蹲', '腿举', '保加利亚单腿蹲'] },
    legs: { name: '腿', exercises: ['杠铃深蹲', '坐姿腿屈伸', '腿举'] },
    cardio: { name: '有氧', exercises: ['跑步机', '椭圆机'] }
};

// 初始化页面
function initPage() {
    // 解析URL参数
    parseUrlParams();
    
    // 加载现有计划（如果是编辑模式）
    if (currentMode === 'edit') {
        loadExistingPlan();
    }
    
    // 更新页面显示
    updatePageDisplay();
    
    // 设置事件监听器
    setupEventListeners();
}

// 解析URL参数
function parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    currentMode = urlParams.get('mode') || 'create';
    
    if (currentMode === 'edit') {
        originalPlanName = decodeURIComponent(urlParams.get('plan') || '');
        currentPlanName = originalPlanName;
    }
}

// 加载现有计划
function loadExistingPlan() {
    const plans = JSON.parse(localStorage.getItem('fitnessPlans')) || [];
    const planToEdit = plans.find(plan => plan.name === originalPlanName);
    
    if (planToEdit) {
        currentPlan = JSON.parse(JSON.stringify(planToEdit));
        currentPlanName = currentPlan.name;
    }
}

// 更新页面显示
function updatePageDisplay() {
    // 更新计划名称
    document.getElementById('plan-name-display').textContent = currentPlanName;
    document.getElementById('plan-name-input').value = currentPlanName;
    
    // 更新星期设置
    updateDaySettings();
}

// 更新星期设置
function updateDaySettings() {
    const days = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
    
    days.forEach(day => {
        const dayEditor = document.querySelector(`.day-editor[data-day="${day}"]`);
        const isRestDay = currentPlan.exercises[day] === '休息日';
        
        // 更新切换按钮状态
        const trainingBtn = dayEditor.querySelector('.toggle-btn.training-day');
        const restBtn = dayEditor.querySelector('.toggle-btn.rest-day');
        const dayContent = dayEditor.querySelector('.day-content');
        const restMessage = dayEditor.querySelector('.rest-day-message');
        
        if (isRestDay) {
            trainingBtn.classList.remove('active');
            restBtn.classList.add('active');
            dayContent.classList.add('hidden');
            restMessage.classList.remove('hidden');
        } else {
            trainingBtn.classList.add('active');
            restBtn.classList.remove('active');
            dayContent.classList.remove('hidden');
            restMessage.classList.add('hidden');
            
            // 如果有已选的训练动作，显示动作选择区域
            if (currentPlan.exercises[day] && currentPlan.exercises[day].length > 0) {
                const exercisesSection = dayEditor.querySelector('.exercises-section');
                exercisesSection.classList.remove('hidden');
                
                // 生成已选动作的显示
                generateSelectedExercises(day);
            }
        }
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 休息日/训练日切换
    document.querySelectorAll('.day-type-toggle').forEach(toggle => {
        toggle.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const dayEditor = this.closest('.day-editor');
                const day = dayEditor.dataset.day;
                const type = this.dataset.type;
                
                toggleDayType(day, type);
            });
        });
    });
    
    // 部位选择
    document.querySelectorAll('.part-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dayEditor = this.closest('.day-editor');
            const day = dayEditor.dataset.day;
            const part = this.dataset.part;
            
            toggleBodyPart(day, part);
        });
    });
    
    // 返回按钮
    document.querySelector('.back-btn').addEventListener('click', goBack);
    
    // 保存按钮
    document.querySelector('.save-btn').addEventListener('click', savePlan);
    
    // 重命名相关
    document.querySelector('.rename-btn').addEventListener('click', toggleRename);
    document.querySelector('.name-actions button:first-child').addEventListener('click', confirmRename);
    document.querySelector('.name-actions button:last-child').addEventListener('click', cancelRename);
}

// 切换训练日/休息日
function toggleDayType(day, type) {
    const dayEditor = document.querySelector(`.day-editor[data-day="${day}"]`);
    const trainingBtn = dayEditor.querySelector('.toggle-btn.training-day');
    const restBtn = dayEditor.querySelector('.toggle-btn.rest-day');
    const dayContent = dayEditor.querySelector('.day-content');
    const restMessage = dayEditor.querySelector('.rest-day-message');
    
    if (type === 'rest') {
        // 设置为休息日
        trainingBtn.classList.remove('active');
        restBtn.classList.add('active');
        dayContent.classList.add('hidden');
        restMessage.classList.remove('hidden');
        currentPlan.exercises[day] = '休息日';
    } else {
        // 设置为训练日
        trainingBtn.classList.add('active');
        restBtn.classList.remove('active');
        dayContent.classList.remove('hidden');
        restMessage.classList.add('hidden');
        
        // 如果原来是休息日，重置为空数组
        if (currentPlan.exercises[day] === '休息日') {
            currentPlan.exercises[day] = [];
        }
    }
}

// 切换训练部位选择
function toggleBodyPart(day, part) {
    const dayEditor = document.querySelector(`.day-editor[data-day="${day}"]`);
    const partBtn = dayEditor.querySelector(`.part-btn[data-part="${part}"]`);
    const exercisesSection = dayEditor.querySelector('.exercises-section');
    const exercisesContainer = document.getElementById(`exercises-${day}`);
    
    // 切换按钮状态
    partBtn.classList.toggle('selected');
    
    // 检查是否有任何部位被选中
    const hasSelectedParts = Array.from(dayEditor.querySelectorAll('.part-btn.selected')).length > 0;
    
    if (hasSelectedParts) {
        // 显示动作选择区域
        exercisesSection.classList.remove('hidden');
        
        // 生成动作选择按钮
        generateExerciseButtons(day);
    } else {
        // 隐藏动作选择区域
        exercisesSection.classList.add('hidden');
        
        // 清空当天的训练内容
        currentPlan.exercises[day] = [];
    }
}

// 生成动作选择按钮
function generateExerciseButtons(day) {
    const dayEditor = document.querySelector(`.day-editor[data-day="${day}"]`);
    const exercisesContainer = document.getElementById(`exercises-${day}`);
    
    // 获取选中的部位
    const selectedParts = Array.from(dayEditor.querySelectorAll('.part-btn.selected')).map(btn => btn.dataset.part);
    
    // 清空容器
    exercisesContainer.innerHTML = '';
    
    // 为每个选中的部位生成动作组
    selectedParts.forEach(part => {
        const partData = recommendedExercises[part];
        
        if (partData) {
            const exerciseGroup = document.createElement('div');
            exerciseGroup.className = 'exercise-group';
            
            // 添加部位标题
            const groupTitle = document.createElement('div');
            groupTitle.className = 'exercise-group-title';
            groupTitle.textContent = partData.name;
            exerciseGroup.appendChild(groupTitle);
            
            // 创建动作网格
            const exercisesGrid = document.createElement('div');
            exercisesGrid.className = 'exercises-grid';
            
            // 添加动作按钮
            partData.exercises.forEach(exerciseName => {
                const exerciseBtn = document.createElement('button');
                exerciseBtn.className = 'exercise-btn';
                exerciseBtn.textContent = exerciseName;
                exerciseBtn.dataset.exercise = exerciseName;
                
                // 检查是否已经在当前计划中
                const isSelected = currentPlan.exercises[day] && currentPlan.exercises[day].some(ex => ex.name === exerciseName);
                if (isSelected) {
                    exerciseBtn.classList.add('selected');
                }
                
                // 添加点击事件
                exerciseBtn.addEventListener('click', function() {
                    toggleExercise(day, exerciseName);
                });
                
                exercisesGrid.appendChild(exerciseBtn);
            });
            
            exerciseGroup.appendChild(exercisesGrid);
            exercisesContainer.appendChild(exerciseGroup);
        }
    });
}

// 生成已选动作的显示
function generateSelectedExercises(day) {
    const dayEditor = document.querySelector(`.day-editor[data-day="${day}"]`);
    const exercisesContainer = document.getElementById(`exercises-${day}`);
    
    // 清空容器
    exercisesContainer.innerHTML = '';
    
    if (!currentPlan.exercises[day] || currentPlan.exercises[day].length === 0) {
        return;
    }
    
    // 按部位分组
    const exercisesByPart = {};
    
    currentPlan.exercises[day].forEach(exercise => {
        // 查找动作所属的部位
        for (const [partKey, partData] of Object.entries(recommendedExercises)) {
            if (partData.exercises.includes(exercise.name)) {
                if (!exercisesByPart[partKey]) {
                    exercisesByPart[partKey] = {
                        name: partData.name,
                        exercises: []
                    };
                }
                exercisesByPart[partKey].exercises.push(exercise.name);
                
                // 选中对应的部位按钮
                const partBtn = dayEditor.querySelector(`.part-btn[data-part="${partKey}"]`);
                if (partBtn) {
                    partBtn.classList.add('selected');
                }
                
                break;
            }
        }
    });
    
    // 显示动作选择区域
    const exercisesSection = dayEditor.querySelector('.exercises-section');
    exercisesSection.classList.remove('hidden');
    
    // 为每个部位生成动作组
    for (const [partKey, partData] of Object.entries(exercisesByPart)) {
        const exerciseGroup = document.createElement('div');
        exerciseGroup.className = 'exercise-group';
        
        // 添加部位标题
        const groupTitle = document.createElement('div');
        groupTitle.className = 'exercise-group-title';
        groupTitle.textContent = partData.name;
        exerciseGroup.appendChild(groupTitle);
        
        // 创建动作网格
        const exercisesGrid = document.createElement('div');
        exercisesGrid.className = 'exercises-grid';
        
        // 获取该部位的所有推荐动作
        const allExercises = recommendedExercises[partKey].exercises;
        
        // 添加动作按钮
        allExercises.forEach(exerciseName => {
            const exerciseBtn = document.createElement('button');
            exerciseBtn.className = 'exercise-btn';
            exerciseBtn.textContent = exerciseName;
            exerciseBtn.dataset.exercise = exerciseName;
            
            // 如果是已选动作，添加选中状态
            if (partData.exercises.includes(exerciseName)) {
                exerciseBtn.classList.add('selected');
            }
            
            // 添加点击事件
            exerciseBtn.addEventListener('click', function() {
                toggleExercise(day, exerciseName);
            });
            
            exercisesGrid.appendChild(exerciseBtn);
        });
        
        exerciseGroup.appendChild(exercisesGrid);
        exercisesContainer.appendChild(exerciseGroup);
    }
}

// 切换训练动作选择
function toggleExercise(day, exerciseName) {
    const dayEditor = document.querySelector(`.day-editor[data-day="${day}"]`);
    const exerciseBtn = dayEditor.querySelector(`.exercise-btn[data-exercise="${exerciseName}"]`);
    
    // 切换按钮状态
    exerciseBtn.classList.toggle('selected');
    
    // 确保当天的训练内容数组存在
    if (currentPlan.exercises[day] === '休息日') {
        currentPlan.exercises[day] = [];
    }
    
    if (!currentPlan.exercises[day]) {
        currentPlan.exercises[day] = [];
    }
    
    // 检查动作是否已存在
    const existingIndex = currentPlan.exercises[day].findIndex(ex => ex.name === exerciseName);
    
    if (existingIndex >= 0) {
        // 如果已存在，移除
        currentPlan.exercises[day].splice(existingIndex, 1);
    } else {
        // 如果不存在，添加
        // 查找动作所属的部位
        let isCardio = false;
        for (const [partKey, partData] of Object.entries(recommendedExercises)) {
            if (partData.exercises.includes(exerciseName)) {
                isCardio = partKey === 'cardio';
                break;
            }
        }
        
        if (isCardio) {
            // 有氧项目
            currentPlan.exercises[day].push({
                name: exerciseName,
                isCardio: true,
                duration: 30, // 默认30分钟
                pace: '中等' // 默认中等配速
            });
        } else {
            // 力量训练项目
            currentPlan.exercises[day].push({
                name: exerciseName,
                isCardio: false,
                sets: 4,
                lastWeights: []
            });
        }
    }
}

// 切换重命名模式
function toggleRename() {
    document.querySelector('.name-display').classList.add('hidden');
    document.querySelector('.name-input').classList.remove('hidden');
    document.getElementById('plan-name-input').focus();
}

// 确认重命名
function confirmRename() {
    const newName = document.getElementById('plan-name-input').value.trim();
    
    if (!newName) {
        alert('请输入计划名称');
        return;
    }
    
    // 检查名称是否已存在（排除原计划名称）
    const plans = JSON.parse(localStorage.getItem('fitnessPlans')) || [];
    if (plans.some(plan => plan.name === newName && plan.name !== originalPlanName)) {
        alert('该计划名称已存在，请使用其他名称');
        return;
    }
    
    // 更新计划名称
    currentPlanName = newName;
    currentPlan.name = newName;
    
    // 更新显示
    document.getElementById('plan-name-display').textContent = currentPlanName;
    document.querySelector('.name-display').classList.remove('hidden');
    document.querySelector('.name-input').classList.add('hidden');
}

// 取消重命名
function cancelRename() {
    document.getElementById('plan-name-input').value = currentPlanName;
    document.querySelector('.name-display').classList.remove('hidden');
    document.querySelector('.name-input').classList.add('hidden');
}

// 返回上一页
function goBack() {
    window.location.href = '../index.html';
}

// 保存计划
function savePlan() {
    // 验证计划名称
    if (!currentPlanName.trim()) {
        alert('请输入计划名称');
        return;
    }
    
    // 获取现有计划
    const plans = JSON.parse(localStorage.getItem('fitnessPlans')) || [];
    
    if (currentMode === 'edit') {
        // 编辑模式：更新现有计划
        const planIndex = plans.findIndex(plan => plan.name === originalPlanName);
        
        if (planIndex >= 0) {
            // 如果名称改变了，检查新名称是否已存在
            if (currentPlanName !== originalPlanName && plans.some(plan => plan.name === currentPlanName)) {
                alert('该计划名称已存在，请使用其他名称');
                return;
            }
            
            // 更新计划
            plans[planIndex] = currentPlan;
            
            // 如果是当前使用的计划，更新currentPlan
            if (originalPlanName === localStorage.getItem('currentPlan')) {
                localStorage.setItem('currentPlan', currentPlanName);
            }
        }
    } else {
        // 创建模式：添加新计划
        // 检查名称是否已存在
        if (plans.some(plan => plan.name === currentPlanName)) {
            alert('该计划名称已存在，请使用其他名称');
            return;
        }
        
        // 设置为默认计划（如果是第一个计划）
        currentPlan.isDefault = plans.length === 0;
        
        // 添加新计划
        plans.push(currentPlan);
        
        // 如果是第一个计划，设置为当前计划
        if (plans.length === 1) {
            localStorage.setItem('currentPlan', currentPlanName);
        }
    }
    
    // 保存计划
    localStorage.setItem('fitnessPlans', JSON.stringify(plans));
    
    // 显示保存成功提示
    showSaveSuccess();
    
    // 如果是创建模式，切换到编辑模式
    if (currentMode === 'create') {
        currentMode = 'edit';
        originalPlanName = currentPlanName;
    }
}

// 显示保存成功提示
function showSaveSuccess() {
    const toast = document.getElementById('save-success');
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);
