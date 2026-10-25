import Box from '@mui/material/Box';

import GithubIssue from './cards/GithubIssue.js';

export default function Card (props) {
    const data = props.data;

    if (data.type==='GITHUB ISSUE')
        return <GithubIssue data={data}/>;

    return (
        <Box className="theme-color3"
             sx={{
                 width: '222px',
                 margin: '11px',
                 borderRadius: '5px',
             }}>
          <Box sx={{
              display:'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              minHeight: '222px', // 中身が無いカードが潰れないようにする
              color: '#ccc',
          }}>
            {data.type || '?'}
          </Box>
        </Box>
    );
}
