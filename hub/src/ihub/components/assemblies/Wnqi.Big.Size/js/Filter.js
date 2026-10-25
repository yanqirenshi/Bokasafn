export default class Filter {
    template () {
        return {
            hide: {
                wbs: {
                    finished: false
                },
                workpackage: {
                    finished: false
                }
            },
            term: {
                start: null,
                end: null,
            },
        };
    }
    build (options_in) {
        let options = this.template();

        if (!options_in)
            return options;

        if (options_in.hide)
            options.hide = {...options_in.hide};

        if (options_in.term)
            options.term = {...options_in.term};

        return options;

    }
}
