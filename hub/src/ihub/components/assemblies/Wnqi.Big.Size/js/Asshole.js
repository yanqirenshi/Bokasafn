import moment from 'moment';

import Pool from './Pool';
import Wnqi from './Wnqi';
import Filter from './Filter';

const POOL = new Pool();
const WNQI = new Wnqi();
const FILTER = new Filter();

/**
 * this is MyClass description.
 * @example
 * let x = new  Wbs(core);
 */
export default class Asshole {
    ensuserArray (obj) {
        if (obj.isArray()) return obj;

        return [obj];
    }
    /* **************************************************************** *
     *  Action
     * **************************************************************** */
    fixWorkpackageTerm (data) {
        if (data.schedule.start) data.schedule.start = new Date(data.schedule.start);
        if (data.schedule.end)   data.schedule.end   = new Date(data.schedule.end);
        if (data.result.start)   data.result.start   = new Date(data.result.start);
        if (data.result.end)     data.result.end     = new Date(data.result.end);

        let children = data.children;
        for (var i in children)
            this.fixWorkpackageTerm(children[i]);
    }
    fixSchedules(list) {
        let term = {start:null, end:null};

        for (var i in list) {
            let node = list[i];
            if (node.children.length!==0) {
                let term_children = this.fixSchedules(node.children);

                node.schedule.start = term_children.start;
                node.schedule.end   = term_children.end;
            }
            let schedule = node.schedule;
            if (!term.start && schedule.start) term.start = schedule.start;
            if (!term.end   && schedule.end)   term.end   = schedule.end;
            if (term.start  && schedule.start && (term.start > schedule.start)) term.start = schedule.start;
            if (term.end    && schedule.end   && (term.end   < schedule.end))   term.end   = schedule.end;
        }
        return term;
    }
    fixResults(list) {
        let term = {start:null, end:null};

        let exist_not_finished = false;
        for (var i in list) {
            let node = list[i];
            let result = node.result;

            if (node.children.length!==0) {
                let term_children = this.fixResults(node.children);

                result.start = term_children.start;
                result.end   = term_children.end;
            }

            // start
            if (!term.start && result.start) term.start = result.start;
            if (term.start  && result.start && (term.start > result.start)) term.start = result.start;

            // end
            if (!result.end) {
                exist_not_finished = true;
            } else {
                if (!term.end && result.end)
                    term.end   = result.end;
                if (term.end  && result.end && (term.end   < result.end))
                    term.end   = result.end;
            }
        }

        if (exist_not_finished)
            term.end = null;

        return term;
    }
    /* **************************************************************** *
     *  Filter
     * **************************************************************** */
    isInTerm (node, options) {
        //               |       |
        //  x :  s---e   |       |
        //  o :  s-------e       |
        //  o :  s----------e    |
        //  o :  s---------------e
        //  o :  s-------------------e
        //  o :          s--e    |
        //  o :          s-------e
        //  o :          s-----------e
        //  o :          |  s--e |
        //  o :          |  s----e
        //  o :          |  s--------e
        //  x :          |       | s---e
        //      ---------f-------t----------->
        //               |       |

        if (moment(node.schedule.start).toDate() > moment(options.term.end).toDate())
            return false;

        if (moment(node.schedule.end).toDate() < moment(options.term.start).toDate())
            return false;

        return true;
    }
    isShowNode (node, options) {
        if (options.term.start  && options.term.end &&
            node.schedule.start && node.schedule.end)
            if (!this.isInTerm(node, options))
                return false;

        if (node._class==="WBS") {
            if (options.hide.wbs.finished) {
                if (node.result.end)
                    return false;
                else
                    return true;
            }

            return true;
        }

        if (node._class==="WORKPACKAGE") {
            if (options.hide.workpackage.finished) {
                if (node.result.end)
                    return false;
                else
                    return true;
            }

            return true;
        }

        return true;
    }
    filterChildren (children, options) {
        let filterd_children = [];

        for (let child of children.list) {
            if (this.isShowNode(child, options)) {
                let new_child = Object.assign({}, child);

                filterd_children.push(new_child);

                new_child.children = this.filterChildren(new_child.children, options);
            }
        }

        return POOL.list2pool(filterd_children);
    }
    filter (tree, options) {
        let filterd_tree = {...tree};

        filterd_tree.children = this.filterChildren(filterd_tree.children, options);

        return filterd_tree;
    }
    /* **************************************************************** *
     *  ??? utility? このクラスでは利用していないな。。。。
     * **************************************************************** */
    date2str (date) {
        if (!date)
            return '---';

        return moment(date).format('YYYY-MM-DD');
    }
    date2week (date) {
        if (!date)
            return '---';

        const day = moment(date).day();

        switch (day) {
        case 0: return '日';
        case 1: return '月';
        case 2: return '火';
        case 3: return '水';
        case 4: return '木';
        case 5: return '金';
        case 6: return '土';
        default: return '---';
        }
    }
    margin (level) {
        let out = "";

        for (let i=0; i<level ;i++)
            out += "　";

        return out;
    }
    projectClass (str) {
        return str.toLowerCase();
    };
    hashWbsPage (code, cls) {
        let node = '';
        if (cls==='WBS')
            node = 'wbs';
        else if (cls==='WORKPACKAGE')
            node = 'workpackages';
        else if (cls==='PROJECT')
            node = 'projects';

        return window.location.hash + '/' + node + '/' +code;
    };
    /* **************************************************************** *
     *
     *  ComposeTree WBS
     *
     * **************************************************************** */
    getEdgeChildNodePoolKey (_class) {
        switch (_class) {
        case 'PROJECT':     return 'projects';
        case 'WBS':         return 'wbs';
        case 'WORKPACKAGE': return 'workpackages';
        default: return null;
        }
    }
    getEdgeChildNode (edge, pool) {
        let _id = edge.to_id;
        let poolkey = this.getEdgeChildNodePoolKey(edge.to_class);

        let children_ht  = pool[poolkey].ht;

        return children_ht[_id];
    }
    mergeSchedule(type, old_term, new_term) {
        let old_val = old_term ? old_term[type] : null;
        let new_val = new_term ? new_term[type] : null;

        if (!old_val) return new_val;
        if (!new_val) return old_val;

        if (type==='start' && new_val.isBefore(old_val))
            return new_val;

        if (type==='end' && new_val.isAfter(old_val))
            return new_val;

        return old_val;
    }
    mergeResult(type, old_term, new_term) {
        let old_val = old_term ? old_term[type] : null;
        let new_val = new_term ? new_term[type] : null;

        if (type==='start') {
            if (!old_val) return new_val;
            if (!new_val) return old_val;

            if (new_val.isBefore(old_val))
                return new_val;
        }

        if (type==='end') {
            if (!old_val) return new_val;
            if (!new_val) return new_val;

            if (new_val.isAfter(old_val))
                return new_val;
        }

        return old_val;
    }
    getTerms (children) {
        let schedule = { start: null, end: null };
        let result = { start: null, end: null };
        let result_null_exist = false;

        for (let child of children) {
            let child_schedule = child._core.schedule;
            schedule.start = this.mergeSchedule('start', schedule, child_schedule);
            schedule.end   = this.mergeSchedule('end',   schedule, child_schedule);

            let child_result = child._core.result;
            result.start = this.mergeResult('start', result, child_result);
            result.end   = this.mergeResult('end',   result, child_result);

            if (!result.end)
                result_null_exist = true;
        }

        if (result_null_exist)
            result.end = null;

        return { schedule: schedule, result: result };
    }
    sortChildren (parent_node) {
        return parent_node.children.list.sort((a, b) => {
            if (a.order && b.order)
                return (a.order < b.order) ? -1 : 1;

            if (a.schedule || b.schedule) {
                if (a.schedule && !b.schedule)
                    return 1;

                if (!a.schedule && b.schedule)
                    return -1;

                if (!a.schedule.end)
                    return -1;

                if (!b.schedule.end)
                    return 1;

                if (a.schedule.end < b.schedule.end)
                    return -1;
            }

            return (a._id < b._id) ? -1 : 1;
        });
    }
    addChildren (parent_node, pool) {
        let parent = parent_node._core;
        let children = parent_node.children;

        // edges から 木構造を作る。
        for (let edge of pool.edges.list) {
            if (edge.from_id===parent._id && edge.from_class===parent._class) {
                let child = this.getEdgeChildNode(edge, pool);

                if (!child) // 存在しない場合は無視する。
                    continue;

                let child_node = WNQI.build(child);

                this.addChildren(child_node, pool);

                children.list.push(child_node);
                children.ht[child_node._core._id] = child_node;
            }
        }

        // term の設定
        if (parent._class!=='WORKPACKAGE') {
            let terms = this.getTerms(children.list);

            parent.schedule = terms.schedule;
            parent.result   = terms.result;

            parent_node.schedule = terms.schedule;
            parent_node.result   = terms.result;
        } else {
            parent_node.schedule = parent.schedule;
            parent_node.result   = parent.result;
        }

        parent_node.children.list = this.sortChildren (parent_node);;

        return parent_node;
    }
    composeTreeWbs (project, wbs, workpackages, edges, options) {
        let pool = {
            wbs: wbs,
            workpackages: workpackages,
            edges: edges
        };

        let project_node = WNQI.build(project);

        let tree = this.addChildren(project_node, pool);

        if (!options)
            return tree;

        let lower = this.filter(
            tree,
            FILTER.build(options),
        );

        if (lower._class==="PROJECT")
            return lower;

        // 再上位まで遡る。
        return this.composeTreeReverse(lower, wbs, edges);
    }
    /* **************************************************************** *
     *  ComposeTree Workpackage
     * **************************************************************** */
    getParent (wp, wbs, edges) {
        let edge = edges.list.find((d) => {
            return d.to_id === wp._id && d.to_class === wp._class;
        });

        return wbs.ht[edge.from_id];
    }
    composeTreeReverse (node, wbs, edges) {
        let parent = this.getParent(node._core, wbs, edges);
        if (!parent)
            return node;

        let parent_node = WNQI.build(parent);
        parent_node.children.ht[node._id] = node;
        parent_node.children.list.push(node);

        let terms = this.getTerms(parent_node.children.list);
        parent_node._core.schedule = terms.schedule;
        parent_node._core.result   = terms.result;

        return this.composeTreeReverse(parent_node, wbs, edges);
    }
    composeTreeWorkpackage (wp, wbs, workpackages, edges, options) {
        // 親を取得する
        let parent = this.getParent(wp, wbs, edges);

        // 親は通常どおり展開する。
        let lower = this.composeTree(parent, wbs, workpackages, edges, options);

        // 再上位まで遡る。
        return this.composeTreeReverse(lower, wbs, edges);
    }
    /* **************************************************************** *
     *  ComposeTreeFlat
     * **************************************************************** */
    composeTree (start_node, wbs, workpackages, edges, options) {
        if (!start_node)
            return {};

        if (start_node._class==='WORKPACKAGE')
            return this.composeTreeWorkpackage(start_node, wbs, workpackages, edges, options);
        else
            return this.composeTreeWbs(start_node, wbs, workpackages, edges, options);
    }
    /* **************************************************************** *
     *  ComposeTreeFlat
     * **************************************************************** */
    flatten (tree, level) {
        let out = [];

        const sorted_tree = tree.sort((a,b)=> a._id<b._id ? -1 : 1);

        for (let node of sorted_tree) {
            node._level = level;

            out.push(node);

            if (!node.children || node.children.length===0)
                continue;

            let children = this.flatten(node.children.list, level + 1);
            out = out.concat(children);
        }

        return out;
    }
    composeTreeFlat (start_node, wbs, workpackages, edges, options) {
        if (!start_node)
            return [];

        let tree = this.composeTree(start_node, wbs, workpackages, edges, options);

        return this.flatten([tree], 0);
    }
    /* **************************************************************** *
     *  build
     * **************************************************************** */
    startNode (start_id, data) {
        if (!start_id)
            return data.projects.list[0] || null;

        return data.projects.ht[start_id] ||
            data.wbs.ht[start_id] ||
            data.workpackages.ht[start_id] ||
            null;
    }
    buildData (data) {
        return {
            projects:     POOL.list2pool(data.projects),
            wbs:          POOL.list2pool(data.wbs),
            workpackages: POOL.list2pool(data.workpackages),
            edges:        POOL.list2pool(data.edges),
        };
    }
    build (params) {
        const data = this.buildData(params.data);
        const start_id = params.start_id;
        const options = params.options;

        if (!data || data.length===0)
            return [];

        let start = this.startNode(start_id, data);

        if (params.flatten===true)
            return this.composeTreeFlat(
                start,
                data.wbs,
                data.workpackages,
                data.edges,
                options);

        return this.composeTree(
            start,
            data.wbs,
            data.workpackages,
            data.edges,
            options);
    }
    /* **************************************************************** *
     *  find min start and max end
     * **************************************************************** */
    getSmallDate(a, b) {
        if (!a) return b;
        if (!b) return a;

        if (a.isBefore(b))
            return a;

        return b;
    };
    getLargeDate(a, b) {
        if (!a) return b;
        if (!b) return a;

        if (a.isBefore(b))
            return b;

        return a;
    };
    getSmallDateAtNode (node, type) {
        let schedule = node.schedule[type];
        let result = node.result[type];

        return this.getSmallDate(schedule, result);
    }
    getLargeDateAtNode (node, type) {
        let schedule = node.schedule[type];
        let result = node.result[type];

        return this.getLargeDate(schedule, result);
    }
    findStartEndNode (node) {
        let children = node.children.list;

        if (children.length===0)
            return {
                start: this.getLargeDateAtNode (node, 'start'),
                end: this.getLargeDateAtNode (node, 'end'),
            };

        return this.findStartEndChildren(children);
    }
    findStartEndChildren (children) {
        let out = { start: null, end: null };

        for (let child of children) {
            let term = this.findStartEndNode (child);

            out.start = this.getSmallDate(out.start, term.start);
            out.end   = this.getLargeDate(out.end, term.end);
        }

        return out;
    }
    findStartEnd (target) {
        if (target.isArray && target.isArray())
            return this.findStartEndChildren(target);
        else
            return this.findStartEndNode(target);
    }
}
