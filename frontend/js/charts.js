// ============================================
// ZenPy - Charts JS (Chart.js integration)
// Dashboard analytics charts
// ============================================

function createQuestionTimesChart(questionTimes) {
    const ctx = document.getElementById('questionTimesChart');
    if (!ctx) return;

    const labels = questionTimes.map(qt => 'Q' + qt.q);
    const times = questionTimes.map(qt => qt.time);
    const colors = times.map(t => {
        if (t < 60) return 'rgba(0, 255, 136, 0.7)';      // Green: fast
        if (t < 180) return 'rgba(255, 170, 0, 0.7)';      // Yellow: medium
        return 'rgba(255, 68, 68, 0.7)';                     // Red: slow
    });

    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time (seconds)',
                data: times,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.7', '1')),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Time: ${formatTime(ctx.raw)}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#888', maxRotation: 45 },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y: {
                    ticks: {
                        color: '#888',
                        callback: (v) => formatTime(v)
                    },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            }
        }
    });
}

function createPerformanceChart(progress, user) {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    // Calculate performance metrics (0-100 scale)
    const qt = progress.questionTimes || [];
    const totalQ = qt.length;
    
    const speed = totalQ > 0 ? Math.min(100, Math.round((60 / (progress.averageTime || 60)) * 100)) : 0;
    const accuracy = totalQ > 0 ? Math.min(100, Math.round((qt.filter(q => q.attempts === 1).length / totalQ) * 100)) : 0;
    const consistency = Math.min(100, (user.streak || 0) * 15);
    const progress_score = Math.min(100, totalQ);
    const xp_efficiency = totalQ > 0 ? Math.min(100, Math.round((user.xp / (totalQ * 100)) * 100)) : 0;

    new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Speed', 'Accuracy', 'Consistency', 'Progress', 'XP Efficiency'],
            datasets: [{
                label: 'Your Performance',
                data: [speed, accuracy, consistency, progress_score, xp_efficiency],
                backgroundColor: 'rgba(255, 20, 147, 0.15)',
                borderColor: 'rgba(255, 20, 147, 0.8)',
                borderWidth: 2,
                pointBackgroundColor: '#FF1493',
                pointBorderColor: '#fff',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#888',
                        backdropColor: 'transparent',
                        stepSize: 25
                    },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: {
                        color: '#ccc',
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}
