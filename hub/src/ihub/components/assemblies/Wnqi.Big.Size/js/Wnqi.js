import merge from 'deepmerge';

export default class Wnqi {
    template () {
        return {
            label:    '',
            children: { ht:{}, list: [] },
            schedule: null,
            result:   null,
            order:    null,
            _id:      null,
            _class:   null,
        };
    }
    label (core) {
        if (core.name)
            return core.name;

        if (core.label)
            return core.label;

        return '???';
    }
    schedule (data) {
        return data.schedule ? data.schedule : null;
    }
    result (data) {
        return data.result   ? data.result   : null;
    }
    build (data) {
        let new_data = {...data};

        if (new_data._node)
            delete new_data._node;

        new_data = merge(this.template(), new_data);

        new_data.label    = this.label(new_data);
        new_data.schedule = this.schedule(new_data);
        new_data.result   = this.result(new_data);

        new_data._core = data;
        data._node = new_data;

        return new_data;
    }
};
