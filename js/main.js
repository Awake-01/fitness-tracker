// 健身记录工具主逻辑

// 全局变量
let currentPage = 'realtime';
let currentExerciseIndex = -1;
let currentSetIndex = -1;
let currentPlan = '';
let today = new Date();

// 默认训练计划
const defaultWeeklyPlan = {
    name: '默认计划',
    isDefault: true,
    exercises: {
        '星期一': '休息日',
        '星期二': '休息日',
        '星期三': '休息日',
        '星期四': '休息日',
        '星期五': '休息日',
        '星期六': '休息日',
        '星期日': '休息日'
    }
};

// 初始化应用
function initApp() {
    // 初始化数据
    initializeData();
    
    // 加载当前计划
    loadCurrentPlan();
    
    // 显示当前页面
    showPage(currentPage);
    
    // 设置事件监听器
    setupEventListeners();
    
    // 更新当前日期显示
    updateCurrentDayDisplay();
}

// 初始化本地存储数据
function initializeData() {
    // 检查是否已有训练计划
    if (!localStorage.getItem('fitnessPlans')) {
        // 创建默认计划
        const plans = [defaultWeeklyPlan];
        localStorage.setItem('fitnessPlans', JSON.stringify(plans));
        localStorage.setItem('currentPlan', defaultWeeklyPlan.name);
    }
    
    // 检查是否已有训练记录
    if (!localStorage.getItem('trainingHistory')) {
        localStorage.setItem('trainingHistory', JSON.stringify([]));
    }
    
    // 检查是否已有今日训练记录
    const todayKey = getTodayKey();
    if (!localStorage.getItem(todayKey)) {
        localStorage.setItem(todayKey, JSON.stringify({}));
    }
}

// 获取今日日期键值
function getTodayKey() {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `training_${year}${month}${day}`;
}

// 获取星期几的中文名称
function getDayOfWeek() {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return days[today.getDay()];
}

// 更新当前日期显示
function updateCurrentDayDisplay() {
    const dayElement = document.getElementById('current-day');
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('zh-CN', dateOptions);
    dayElement.textContent = `${dateString} (${getDayOfWeek()})`;
}

// 加载当前计划
function loadCurrentPlan() {
    currentPlan = localStorage.getItem('currentPlan') || defaultWeeklyPlan.name;
    document.getElementById('plan-name').textContent = currentPlan;
}

// 设置事件监听器
function setupEventListeners() {
    // 导航按钮点击事件
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.page;
            showPage(page);
        });
    });
    
    // 筛选按钮点击事件
    document.getElementById('apply-filter').addEventListener('click', applyFilter);
    
    // 创建计划按钮点击事件
    document.getElementById('create-plan-btn').addEventListener('click', createNewPlan);
    document.getElementById('create-first-plan').addEventListener('click', createNewPlan);
    
    // 弹窗按钮点击事件
    document.getElementById('cancel-update').addEventListener('click', hideModal);
    document.getElementById('confirm-update').addEventListener('click', function() {
        // 根据弹窗内容判断是有氧项目还是力量训练项目
        if (document.getElementById('duration-input')) {
            confirmCardioUpdate();
        } else {
            confirmWeightUpdate();
        }
    });
    
    // 点击弹窗外部关闭弹窗
    document.getElementById('update-weight-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideModal();
        }
    });
}

// 显示指定页面
function showPage(pageName) {
    // 更新当前页面
    currentPage = pageName;
    
    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageName) {
            btn.classList.add('active');
        }
    });
    
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // 显示目标页面
    document.getElementById(`${pageName}-page`).classList.remove('hidden');
    
    // 根据页面类型加载相应内容
    switch (pageName) {
        case 'realtime':
            loadTodayTraining();
            break;
        case 'history':
            loadTrainingHistory();
            break;
        case 'plans':
            loadTrainingPlans();
            break;
    }
}

// 加载今日训练内容
function loadTodayTraining() {
    const trainingContent = document.getElementById('training-content');
    const plans = JSON.parse(localStorage.getItem('fitnessPlans'));
    const currentPlanData = plans.find(plan => plan.name === currentPlan);
    
    if (!currentPlanData) {
        trainingContent.innerHTML = '<p class="no-data">未找到当前训练计划</p>';
        return;
    }
    
    const dayOfWeek = getDayOfWeek();
    const todayExercises = currentPlanData.exercises[dayOfWeek];
    
    if (todayExercises === '休息日') {
        trainingContent.innerHTML = '<p class="no-data">今天是休息日，好好休息！</p>';
        return;
    }
    
    if (!todayExercises || todayExercises.length === 0) {
        trainingContent.innerHTML = '<p class="no-data">今天没有安排训练</p>';
        return;
    }
    
    // 获取今日训练记录
    const todayKey = getTodayKey();
    const todayRecords = JSON.parse(localStorage.getItem(todayKey));
    
    // 生成训练内容HTML
    let html = '';
    todayExercises.forEach((exercise, exerciseIndex) => {
        html += `
            <div class="exercise-card">
                <div class="exercise-header">
                    <h3>${exercise.name}</h3>
                    ${exercise.isCardio ? '' : `<button class="complete-all-btn" onclick="completeAllSets(${exerciseIndex})">
                        <i class="fa fa-check-circle"></i> 一键完成
                    </button>`}
                </div>
                <div class="set-list">
        `;
        
        if (exercise.isCardio) {
            // 有氧项目特殊显示
            const isCompleted = todayRecords[exercise.name] !== undefined;
            const duration = isCompleted ? todayRecords[exercise.name].duration : exercise.duration || 30;
            const pace = isCompleted ? todayRecords[exercise.name].pace : exercise.pace || '中等';
            
            html += `
                <div class="cardio-item ${isCompleted ? 'completed' : ''}">
                    <div class="cardio-info">
                        <span class="cardio-duration">${duration} 分钟</span>
                        <span class="cardio-pace">配速: ${pace}</span>
                    </div>
                    <button class="complete-btn" onclick="openCardioModal(${exerciseIndex})" ${isCompleted ? 'disabled' : ''}>
                        ${isCompleted ? '已完成' : '完成'}
                    </button>
                </div>
            `;
        } else {
            // 力量训练项目
            for (let i = 0; i < exercise.sets; i++) {
                const setNumber = i + 1;
                const isCompleted = todayRecords[exercise.name] && todayRecords[exercise.name][i] !== undefined;
                const weight = isCompleted ? todayRecords[exercise.name][i] : exercise.lastWeights[i] || 0;
                const lastWeight = exercise.lastWeights[i] || 0;
                
                html += `
                    <div class="set-item ${isCompleted ? 'completed' : ''}">
                        <div class="set-info">
                            <span class="set-number">第${setNumber}组</span>
                            <span class="set-weight">${weight} kg</span>
                            ${!isCompleted && lastWeight > 0 ? `<span class="last-weight">上次: ${lastWeight} kg</span>` : ''}
                        </div>
                        <button class="complete-btn" onclick="openUpdateModal(${exerciseIndex}, ${i})" ${isCompleted ? 'disabled' : ''}>
                            ${isCompleted ? '已完成' : '完成'}
                        </button>
                    </div>
                `;
            }
        }
        
        html += `
                </div>
            </div>
        `;
    });
    
    trainingContent.innerHTML = html;
}

// 打开重量更新弹窗
function openUpdateModal(exerciseIndex, setIndex) {
    currentExerciseIndex = exerciseIndex;
    currentSetIndex = setIndex;
    
    const plans = JSON.parse(localStorage.getItem('fitnessPlans'));
    const currentPlanData = plans.find(plan => plan.name === currentPlan);
    const dayOfWeek = getDayOfWeek();
    const exercise = currentPlanData.exercises[dayOfWeek][exerciseIndex];
    
    // 设置弹窗内容
    document.getElementById('exercise-info').textContent = `${exercise.name} 第${setIndex + 1}组`;
    document.getElementById('weight-input').value = exercise.lastWeights[setIndex] || 0;
    
    // 显示弹窗
    document.getElementById('update-weight-modal').classList.remove('hidden');
    document.getElementById('weight-input').focus();
}

// 隐藏弹窗
function hideModal() {
    document.getElementById('update-weight-modal').classList.add('hidden');
    currentExerciseIndex = -1;
    currentSetIndex = -1;
}

// 确认重量更新
function confirmWeightUpdate() {
    const weight = parseFloat(document.getElementById('weight-input').value);
    
    if (isNaN(weight) || weight < 0) {
        alert('请输入有效的重量');
        return;
    }
    
    // 更新今日训练记录
    const todayKey = getTodayKey();
    const todayRecords = JSON.parse(localStorage.getItem(todayKey));
    
    const plans = JSON.parse(localStorage.getItem('fitnessPlans'));
    const currentPlanData = plans.find(plan => plan.name === currentPlan);
    const dayOfWeek = getDayOfWeek();
    const exercise = currentPlanData.exercises[dayOfWeek][currentExerciseIndex];
    
    // 确保该运动的记录数组存在
    if (!todayRecords[exercise.name]) {
        todayRecords[exercise.name] = [];
    }
    
    // 更新重量
    todayRecords[exercise.name][currentSetIndex] = weight;
    localStorage.setItem(todayKey, JSON.stringify(todayRecords));
    
    // 更新运动的最后重量记录
    exercise.lastWeights[currentSetIndex] = weight;
    
    // 保存更新后的计划
    localStorage.setItem('fitnessPlans', JSON.stringify(plans));
    
    // 如果所有组都完成了，添加到历史记录
    checkAndAddToHistory();
    
    // 隐藏弹窗并重新加载今日训练
    hideModal();
    loadTodayTraining();
}

// 一键完成所有组
function completeAllSets(exerciseIndex) {
    const todayKey = getTodayKey();
    const todayRecords = JSON.parse(localStorage.getItem(todayKey));
    
    const plans = JSON.parse(localStorage.getItem('fitnessPlans'));
    const currentPlanData = plans.find(plan => plan.name === currentPlan);
    const dayOfWeek = getDayOfWeek();
    const exercise = currentPlanData.exercises[dayOfWeek][exerciseIndex];
    
    // 确保该运动的记录数组存在
    if (!todayRecords[exercise.name]) {
        todayRecords[exercise.name] = [];
    }
    
    // 使用上次的重量一键完成所有组
    for (let i = 0; i < exercise.sets; i++) {
        const lastWeight = exercise.lastWeights[i] || 0;
        todayRecords[exercise.name][i] = lastWeight;
    }
    
    localStorage.setItem(todayKey, JSON.stringify(todayRecords));
    
    // 如果所有组都完成了，添加到历史记录
    checkAndAddToHistory();
    
    // 重新加载今日训练
    loadTodayTraining();
}

// 打开有氧项目弹窗
function openCardioModal(exerciseIndex) {
    currentExerciseIndex = exerciseIndex;
    
    const plans = JSON.parse(localStorage.getItem('fitnessPlans'));
    const currentPlanData = plans.find(plan => plan.name === currentPlan);
    const dayOfWeek = getDayOfWeek();
    const exercise = currentPlanData.exercises[dayOfWeek][currentExerciseIndex];
    
    // 设置弹窗内容
    document.getElementById('exercise-info').textContent = exercise.name;
    
    // 显示有氧项目专用的输入字段
    document.querySelector('.input-group').innerHTML = `
        <label for="duration-input">时间 (分钟)</label>
        <input type="number" id="duration-input" min="1" max="300" value="${exercise.duration || 30}">
        <label for="pace-input" style="margin-top: 15px;">配速</label>
        <select id="pace-input">
            <option value="慢" ${(exercise.pace || '中等') === '慢' ? 'selected' : ''}>慢</option>
            <option value="中等" ${(exercise.pace || '中等') === '中等' ? 'selected' : ''}>中等</option>
            <option value="快" ${(exercise.pace || '中等') === '快' ? 'selected' : ''}>快</option>
        </select>
    `;
    
    // 显示弹窗
    document.getElementById('update-weight-modal').classList.remove('hidden');
    document.getElementById('duration-input').focus();
}

// 确认有氧项目更新
function confirmCardioUpdate() {
    const duration = parseInt(document.getElementById('duration-input').value);
    const pace = document.getElementById('pace-input').value;
    
    if (isNaN(duration) || duration < 1) {
        alert('请输入有效的时间');
        return;
    }
    
    // 更新今日训练记录
    const todayKey = getTodayKey();
    const todayRecords = JSON.parse(localStorage.getItem(todayKey));
    
    const plans = JSON.parse(localStorage.getItem('fitnessPlans'));
    const currentPlanData = plans.find(plan => plan.name === currentPlan);
    const dayOfWeek = getDayOfWeek();
    const exercise = currentPlanData.exercises[dayOfWeek][currentExerciseIndex];
    
    // 更新有氧项目记录
    todayRecords[exercise.name] = {
        duration: duration,
        pace: pace
    };
    
    localStorage.setItem(todayKey, JSON.stringify(todayRecords));
    
    // 更新运动的默认设置
    exercise.duration = duration;
    exercise.pace = pace;
    
    // 保存更新后的计划
    localStorage.setItem('fitnessPlans', JSON.stringify(plans));
    
    // 如果所有项目都完成了，添加到历史记录
    checkAndAddToHistory();
    
    // 隐藏弹窗并重新加载今日训练
    hideModal();
    loadTodayTraining();
}

// 检查是否所有组都完成了，如果是则添加到历史记录
function checkAndAddToHistory() {
    const todayKey = getTodayKey();
    const todayRecords = JSON.parse(localStorage.getItem(todayKey));
    
    const plans = JSON.parse(localStorage.getItem('fitnessPlans'));
    const currentPlanData = plans.find(plan => plan.name === currentPlan);
    const dayOfWeek = getDayOfWeek();
    const todayExercises = currentPlanData.exercises[dayOfWeek];
    
    if (todayExercises === '休息日') return;
    
    let allCompleted = true;
    
    // 检查是否所有项目都完成了
    todayExercises.forEach(exercise => {
        if (exercise.isCardio) {
            // 有氧项目检查是否有记录
            if (!todayRecords[exercise.name]) {
                allCompleted = false;
            }
        } else {
            // 力量训练项目检查是否所有组都完成
            if (!todayRecords[exercise.name] || todayRecords[exercise.name].length < exercise.sets) {
                allCompleted = false;
            }
        }
    });
    
    // 如果所有项目都完成了，添加到历史记录
    if (allCompleted) {
        const history = JSON.parse(localStorage.getItem('trainingHistory'));
        
        const historyEntry = {
            date: today.toISOString().split('T')[0],
            plan: currentPlan,
            exercises: []
        };
        
        todayExercises.forEach(exercise => {
            if (exercise.isCardio) {
                // 有氧项目记录
                const exerciseRecord = {
                    name: exercise.name,
                    isCardio: true,
                    duration: todayRecords[exercise.name].duration,
                    pace: todayRecords[exercise.name].pace
                };
                historyEntry.exercises.push(exerciseRecord);
            } else {
                // 力量训练项目记录
                const exerciseRecord = {
                    name: exercise.name,
                    isCardio: false,
                    sets: []
                };
                
                for (let i = 0; i < exercise.sets; i++) {
                    exerciseRecord.sets.push({
                        number: i + 1,
                        weight: todayRecords[exercise.name][i]
                    });
                }
                
                historyEntry.exercises.push(exerciseRecord);
            }
        });
        
        // 检查是否已经有今天的记录，如果有则更新，没有则添加
        const existingIndex = history.findIndex(entry => entry.date === historyEntry.date);
        if (existingIndex >= 0) {
            history[existingIndex] = historyEntry;
        } else {
            history.push(historyEntry);
        }
        
        localStorage.setItem('trainingHistory', JSON.stringify(history));
    }
}

// 加载训练历史
function loadTrainingHistory() {
    const historyList = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('trainingHistory'));
    
    if (!history || history.length === 0) {
        historyList.innerHTML = '<p class="no-data">暂无历史训练记录</p>';
        return;
    }
    
    // 按日期降序排序
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 生成历史记录HTML
    let html = '';
    history.forEach(entry => {
        html += `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-date">${formatDate(entry.date)}</span>
                    <span class="history-plan">${entry.plan}</span>
                </div>
        `;
        
        entry.exercises.forEach(exercise => {
            html += `
                <div class="exercise-record">
                    <div class="exercise-name">${exercise.name}</div>
            `;
            
            if (exercise.isCardio) {
                // 有氧项目显示
                html += `
                    <div class="cardio-record">
                        <span>时间: ${exercise.duration} 分钟, 配速: ${exercise.pace}</span>
                    </div>
                `;
            } else {
                // 力量训练项目显示
                exercise.sets.forEach(set => {
                    html += `
                        <div class="set-record">
                            <span>第${set.number}组: ${set.weight} kg</span>
                        </div>
                    `;
                });
            }
            
            html += `
                </div>
            `;
        });
        
        html += `
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

// 应用筛选
function applyFilter() {
    const weekFilter = document.getElementById('week-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    const historyList = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('trainingHistory'));
    
    if (!history || history.length === 0) {
        historyList.innerHTML = '<p class="no-data">暂无历史训练记录</p>';
        return;
    }
    
    let filteredHistory = [...history];
    
    // 应用日期筛选
    if (dateFilter) {
        filteredHistory = filteredHistory.filter(entry => entry.date === dateFilter);
    }
    
    // 应用星期筛选
    if (weekFilter !== 'all') {
        const today = new Date();
        let startDate, endDate;
        
        if (weekFilter === 'this-week') {
            // 本周的开始（周一）
            startDate = new Date(today);
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 调整为周一
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
            
            // 本周的结束（周日）
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else if (weekFilter === 'last-week') {
            // 上周的开始（周一）
            startDate = new Date(today);
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1) - 7; // 调整为上周周一
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
            
            // 上周的结束（周日）
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        }
        
        // 筛选日期范围内的记录
        filteredHistory = filteredHistory.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
        });
    }
    
    // 按日期降序排序
    filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredHistory.length === 0) {
        historyList.innerHTML = '<p class="no-data">没有符合条件的训练记录</p>';
        return;
    }
    
    // 生成筛选后的历史记录HTML
    let html = '';
    filteredHistory.forEach(entry => {
        html += `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-date">${formatDate(entry.date)}</span>
                    <span class="history-plan">${entry.plan}</span>
                </div>
        `;
        
        entry.exercises.forEach(exercise => {
            html += `
                <div class="exercise-record">
                    <div class="exercise-name">${exercise.name}</div>
            `;
            
            if (exercise.isCardio) {
                // 有氧项目显示
                html += `
                    <div class="cardio-record">
                        <span>时间: ${exercise.duration} 分钟, 配速: ${exercise.pace}</span>
                    </div>
                `;
            } else {
                // 力量训练项目显示
                exercise.sets.forEach(set => {
                    html += `
                        <div class="set-record">
                            <span>第${set.number}组: ${set.weight} kg</span>
                        </div>
                    `;
                });
            }
            
            html += `
                </div>
            `;
        });
        
        html += `
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

// 加载训练计划
function loadTrainingPlans() {
    const plansList = document.getElementById('plans-list');
    const plans = JSON.parse(localStorage.getItem('fitnessPlans'));
    
    if (!plans || plans.length === 0) {
        plansList.innerHTML = `
            <div class="no-plans">
                <p>您还没有创建任何训练计划</p>
                <button id="create-first-plan">创建第一个计划</button>
            </div>
        `;
        
        // 重新添加事件监听器
        document.getElementById('create-first-plan').addEventListener('click', createNewPlan);
        return;
    }
    
    // 生成计划列表HTML
    let html = '';
    plans.forEach(plan => {
        html += `
            <div class="plan-card ${plan.isDefault ? 'default' : ''}">
                <div class="plan-info">
                    <span class="plan-name">${plan.name}</span>
                    ${plan.isDefault ? '<span class="default-badge">默认</span>' : ''}
                </div>
                <div class="plan-actions">
                    <button class="plan-btn" onclick="editPlan('${plan.name}')">
                        编辑
                    </button>
                    <button class="plan-btn ${currentPlan === plan.name ? 'primary' : ''}" onclick="switchPlan('${plan.name}')">
                        ${currentPlan === plan.name ? '当前使用' : '使用此计划'}
                    </button>
                    ${!plan.isDefault ? `<button class="plan-btn" onclick="setAsDefault('${plan.name}')">设为默认</button>` : ''}
                    ${!plan.isDefault ? `<button class="plan-btn" onclick="deletePlan('${plan.name}')">删除</button>` : ''}
                </div>
            </div>
        `;
    });
    
    plansList.innerHTML = html;
}

// 创建新计划
function createNewPlan() {
    // 跳转到编辑页面创建新计划
    window.location.href = 'pages/trainingplan.html?mode=create';
}

// 编辑计划
function editPlan(planName) {
    // 跳转到编辑页面编辑现有计划
    window.location.href = `pages/trainingplan.html?mode=edit&plan=${encodeURIComponent(planName)}`;
}

// 切换当前计划
function switchPlan(planName) {
    localStorage.setItem('currentPlan', planName);
    currentPlan = planName;
    document.getElementById('plan-name').textContent = currentPlan;
    
    // 重新加载计划列表和今日训练
    loadTrainingPlans();
    if (currentPage === 'realtime') {
        loadTodayTraining();
    }
}

// 设置默认计划
function setAsDefault(planName) {
    const plans = JSON.parse(localStorage.getItem('fitnessPlans'));
    
    // 移除所有计划的默认状态
    plans.forEach(plan => {
        plan.isDefault = false;
    });
    
    // 设置指定计划为默认
    const targetPlan = plans.find(plan => plan.name === planName);
    if (targetPlan) {
        targetPlan.isDefault = true;
        localStorage.setItem('fitnessPlans', JSON.stringify(plans));
        loadTrainingPlans();
    }
}

// 删除计划
function deletePlan(planName) {
    if (confirm(`确定要删除计划"${planName}"吗？`)) {
        const plans = JSON.parse(localStorage.getItem('fitnessPlans'));
        const updatedPlans = plans.filter(plan => plan.name !== planName);
        
        // 如果删除的是当前使用的计划，切换到默认计划
        if (currentPlan === planName) {
            const defaultPlan = updatedPlans.find(plan => plan.isDefault);
            if (defaultPlan) {
                localStorage.setItem('currentPlan', defaultPlan.name);
                currentPlan = defaultPlan.name;
                document.getElementById('plan-name').textContent = currentPlan;
            }
        }
        
        localStorage.setItem('fitnessPlans', JSON.stringify(updatedPlans));
        loadTrainingPlans();
        
        // 如果当前在实时训练页面，重新加载
        if (currentPage === 'realtime') {
            loadTodayTraining();
        }
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);