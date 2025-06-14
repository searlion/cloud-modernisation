// src/GameConfig.ts

// --- Game Physics & Layout ---
export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 600;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -18;
export const GROUND_Y = GAME_HEIGHT - 100; // Player stands slightly above the bottom

// --- Player Settings ---
export const PLAYER_START_X = 100;
export const PLAYER_WIDTH = 60 * 1.5; // Base width * scale
export const PLAYER_HEIGHT = 80 * 1.5; // Base height * scale

// --- Obstacle Settings ---
export const OBSTACLE_SPEED = 5;
export const OBSTACLE_WIDTH = 120;
export const OBSTACLE_HEIGHT = 60;
export const OBSTACLE_SPAWN_INTERVAL = 1500; // in milliseconds
export const OBSTACLE_MIN_Y = 150;
export const OBSTACLE_MAX_Y = GAME_HEIGHT - 150;

// --- Scoring ---
export const HURDLE_PENALTY = -100;
export const BONUS_POINTS = 50;

// --- Game Time Limit ---
export const GAME_DURATION = 60000; // 1 minute in milliseconds

// --- Game Content ---
export const HURDLES = [
    "Vendor Lock-In",
    "Siloed Data",
    "Legacy Monolith",
    "High Latency",
    "Security Risks",
    "Cost Overruns",
    "Manual Deployments",
    "Cloud complexity",
    "Security vulnerabilities",
    "Cloud cost",
    "Skills gap",
    "Vendor lock-in",
    "Data silos",
    "Change management",
    "Outdated legacy systems"
];

export const BONUSES = [
    "App modernisation",
    "Data modernisation",
    "Real-time data integration",
    "Infrastructure modernisation",
    "Seamless data migration",
    "AI and automation",
    "FinOps",
    "Data encryption",
    "Zero-trust security",
    "Mainframe modernization",
    "Intelligent automation",
    "Edge computing",
    "Cloud migration",
    "Data lakes",
    "Data warehouses",
    "Regular audits and monitoring"
];