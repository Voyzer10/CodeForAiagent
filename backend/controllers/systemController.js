const system = require('systeminformation');
const mongoose = require('mongoose');

// Helper to get formatted uptime
const getUptime = () => {
    const seconds = process.uptime();
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
};

// 1. System Health Overview
const getSystemHealth = async (req, res) => {
    try {
        // Database Status
        const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

        // Server Status (Self)
        const serverStatus = 'Online';

        // API Status (Basic check)
        const apiStatus = 'Healthy'; // If we reached here, API is working

        // Uptime
        const uptime = getUptime();

        // Last Restart - approximated by uptime
        const lastRestart = new Date(Date.now() - process.uptime() * 1000).toLocaleString();

        res.json({
            serverStatus,
            apiStatus,
            dbStatus,
            uptime,
            lastRestart,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Health Check Error:', error);
        res.status(500).json({ message: 'Error fetching health stats' });
    }
};

// 2. Server Resources
const getSystemResources = async (req, res) => {
    try {
        const [cpu, mem, disk, network] = await Promise.all([
            system.currentLoad(),
            system.mem(),
            system.fsSize(),
            system.networkStats()
        ]);

        res.json({
            cpu: {
                usage: cpu.currentLoad.toFixed(2),
                cores: cpu.cpus.length
            },
            memory: {
                total: (mem.total / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                used: (mem.active / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                free: (mem.available / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                percentage: ((mem.active / mem.total) * 100).toFixed(2)
            },
            disk: disk.map(d => ({
                fs: d.fs,
                size: (d.size / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                used: (d.used / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                percent: d.use.toFixed(2)
            })),
            network: network.map(n => ({
                iface: n.iface,
                rx: (n.rx_sec / 1024).toFixed(2) + ' KB/s',
                tx: (n.tx_sec / 1024).toFixed(2) + ' KB/s'
            }))
        });

    } catch (error) {
        console.error('Resource Check Error:', error);
        res.status(500).json({ message: 'Error fetching resources' });
    }
};

module.exports = {
    getSystemHealth,
    getSystemResources
};
