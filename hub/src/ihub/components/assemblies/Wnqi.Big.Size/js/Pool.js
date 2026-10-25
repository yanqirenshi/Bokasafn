export default class Pool {
    list2pool (list) {
        if (!list)
            return [];

        let out = { list: list, ht: {} };

        for (let node of list)
            out.ht[node._id] = node;

        return out;
    }
}
