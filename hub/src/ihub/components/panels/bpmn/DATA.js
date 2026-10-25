export const ACTIVITY = [
    {
        name: 'タスク',
        image: ['task.svg'],
        description: []
    },
    {
        name: '送信タスク',
        image: ['send-task.svg'],
        description: []
    },
    {
        name: '受信タスク',
        image: ['receive-task.svg'],
        description: []
    },
    {
        name: 'マニュアル・タスク',
        image: ['manual-task.svg'],
        description: []
    },
    {
        name: 'ユーザー・タスク',
        image: ['user-task.svg'],
        description: []
    },
    {
        name: 'スクリプト・タスク',
        image: ['script-task.svg'],
        description: []
    },
    {
        name: 'サービス・タスク',
        image: ['service-task.svg'],
        description: []
    },
    {
        name: 'ビジネスルール・タスク',
        image: ['business-rule-task.svg'],
        description: []
    },
    {
        name: 'サブプロセス',
        image: ['subprocess-collapsed.svg','subprocess-expanded.svg'],
        description: []
    },
    {
        name: 'コールアクティビティ',
        image: ['call-activity.svg'],
        description: []
    },
];

export const GATEWAY = [
    { name: '排他(XOR)ゲートウェイ', image: [], description: [] },
    { name: 'パラレル・ゲートウェイ', image: [], description: [] },
];

export const EVENT_START = [
    { name: 'トリガーなし開始イベント', image: ['start-event-none.svg'], description: [] },
    { name: 'メッセージ開始イベント', image: ['start-event-message.svg'], description: [] },
    { name: 'タイマー開始イベント', image: ['start-event-timer.svg'], description: [] },
    { name: '多重と多重パラレル開始イベント', image: ['start-event-multiple.svg'], description: [] },
    { name: '代替開始イベント', image: [], description: [] },
];

export const EVENT_END = [
    { name: 'トリガーなし終了イベント', image: ['end-event-none.svg'], description: [] },
    { name: 'メッセージ終了イベント', image: ['end-event-message.svg'], description: [] },
    { name: '停止イベント', image: ['end-event-terminate.svg'], description: [] },
    { name: '多重終了イベント', image: ['end-event-multiple.svg'], description: [] },
];

export const FLOWS = [
    { name: 'シーケンス・フロー', image: [], description: [] },
    { name: 'メッセージ・フロー', image: [], description: [] },
];

export const POOL_LANE = [
    { name: 'プロセス・プール', image: [], description: [] },
    { name: 'ホワイトボックス・プール', image: [], description: [] },
    { name: 'ブラックボックス・プール', image: [], description: [] },
    { name: 'レーン', image: [], description: [] },
    { name: 'レーンセット', image: [], description: [] },
    { name: '子レーンセット', image: [], description: [] },
];

export const DATA_OBJECT_STORE = [
    { name: 'データオブジェクト', image: [], description: [] },
    { name: 'データストア', image: [], description: [] },
];
