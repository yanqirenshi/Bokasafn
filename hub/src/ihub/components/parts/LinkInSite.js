import {Link as RrLink} from "react-router-dom";

export default function LinkInSite (props) {
    const href = props.href;
    const children = props.children;

    return (
        <RrLink to={href}
                style={{
                    color: 'rgba(0, 0, 0, 0.87)',
                    textDecorationStyle: 'dotted',
                    textDecorationColor: 'rgba(188, 188, 188, 0.88)',
                    textDecorationThickness: '0.05em',
                }}>
          {children}
        </RrLink>
    );
}
