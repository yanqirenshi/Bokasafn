import React from 'react';

import Box from '@mui/material/Box';

export default class ErrorBoundary extends React.Component {
    constructor (props) {
        super(props);
        this.state = { has_error: false };
    }

    static getDerivedStateFromError () {
        return { has_error: true };
    }

    componentDidCatch (error, info) {
        console.error(error, info);
    }

    render () {
        if (this.state.has_error)
            return <Box sx={{p:2, color: 'rgba(0,0,0,0.6)'}}>{this.props.fallback || '表示中にエラーが発生しました。'}</Box>;

        return this.props.children;
    }
}
