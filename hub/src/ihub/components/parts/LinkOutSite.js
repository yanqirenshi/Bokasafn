import MaterialLink from '@mui/material/Link';

export default function LinkOutSite (props) {
    const href = props.href;
    const children = props.children;

    return (
        <MaterialLink href={href}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                          color: 'rgba(0, 0, 0, 0.87)',
                          textDecorationStyle: 'dotted',
                          textDecorationColor: 'rgba(188, 188, 188, 0.88)',
                          textDecorationThickness: '0.05em',
                      }}>
          {children}
        </MaterialLink>
    );
}
