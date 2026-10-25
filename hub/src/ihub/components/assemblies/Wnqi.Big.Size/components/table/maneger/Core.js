import merge from 'deepmerge';

export default class Core {
    margin (level) {
        let out = "";
        for (let i=0; i<level ;i++)
            out += "　";
        return out;
    }
    /* **************************************************************** *
     *  Column
     * **************************************************************** */
    templateColumn (i) {
        return {
            number: i,
            label: 'col-' + (i+1),
            required: false,
            visible: true,
            contents: (c, d) => {
                return d._id;
            }
        };
    }
    makeColumn (seed, i) {
        const column = merge(this.templateColumn(i), seed);

        return column;
    }
    makeColumns (seeds) {
        if (!Array.isArray(seeds))
            return [];

        return seeds.map((seed,i) => this.makeColumn(seed, i));
    }
    /* **************************************************************** *
     *  Visible                                                         *
     * **************************************************************** */
    changeColumnsVisible (number, v, columns) {
        const new_columns = columns.map(d => Object.assign(d));

        const col = new_columns.find(d => d.number===number);

        col.visible = v;

        return new_columns;
    }
    /* **************************************************************** *
     *  contract                                                        *
     * **************************************************************** */
    contract (action, _id, closed_wbs) {
        const tmp = {...closed_wbs};

        if (action==='close') {
            if (!tmp[_id])
                tmp[_id] = true;
        } else {
            if (tmp[_id])
                delete tmp[_id];
        }

        return tmp;
    }
    /* **************************************************************** *
     *  filter                                                          *
     * **************************************************************** */
    filterWp (wbs, filter_wp) {
        const core = wbs._core;
        const word = filter_wp.toUpperCase();

        for (const k in core) {
            let v = core[k];
            const type = typeof v;

            if (type==='string' || type==='number')
                v = ('' + v).toUpperCase();
            else
                continue;

            if (v.indexOf(word)!==-1)
                return true;
        }

        return false;
    }
    applyFilter (filter_wp, closed_wbs, records) {
        const out = [];

        let lev = null;

        for (const rec of records) {
            if (rec._class==="WORKPACKAGE" && !this.filterWp(rec, filter_wp))
                continue;

            if (closed_wbs[rec._id]) {
                lev = rec._level;
                out.push(rec);
                continue;
            }

            if (lev!==null && rec._level > lev)
                continue;

            lev = null;

            out.push(rec);
        }

        return out;
    }
    /* **************************************************************** *
     *  csv                                                             *
     * **************************************************************** */
    makeCSV () {
        return {
            headers: [
                { label: "c1",  key: "firstname" },
                { label: "c2",  key: "lastname" },
                { label: "c3",  key: "email" }
            ],
            data: [
                { firstname: "AAA", lastname: "BBB", email: "CCC" },
                { firstname: "AAA", lastname: "BBB", email: "CCC" },
                { firstname: "AAA", lastname: "BBB", email: "CCC" },
            ],
        };
    }
    /* **************************************************************** *
     *  utils                                                           *
     * **************************************************************** */
    maxLev (records) {
        return records.reduce((lev, d) => {
            return d._level > lev ? d._level : lev;
        }, 0);
    }
}
