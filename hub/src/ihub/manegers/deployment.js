// システム構成図 (d3.deployment) に使うコレクション。
export const DEPLOYMENT_COLLECTIONS = [
    'deployment/nodes',
    'deployment/edges',
];

// d3.deployment に渡すデータを作る。
// d3.deployment はデータを書き換えるので、複製して渡す。
export function buildDeploymentData (collections) {
    return structuredClone({
        nodes: collections['deployment/nodes'],
        edges: collections['deployment/edges'],
    });
}
