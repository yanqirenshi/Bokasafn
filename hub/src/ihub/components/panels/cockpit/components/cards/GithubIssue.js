import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import S from '@mui/material/Typography';

// import Link from '../.././../../parts/LinkInSite.js';
import LinkOutSite from '../.././../../parts/LinkOutSite.js';


export default function GithubIssue (props) {
    const data = props.data;

    const issue = data.data;
    const repository = issue.core().repository;

    return (
        <Card sx={{
            width: '222px',
            margin: '11px',
            background: '#fff',
            borderRadius: '5px',
        }}>
          <CardContent>
            <Box>
            <S>
              {issue.title()}
              <span>
                (
                <LinkOutSite href={issue.url()}>
                  {issue.number()}
                </LinkOutSite>
                )
              </span>
            </S>
            </Box>

            <Box sx={{mt:0.5}}>
              <S sx={{color: '#888'}}>
                <a href={repository.url}>
                  {repository.name}
                </a>
              </S>
            </Box>
          </CardContent>
        </Card>
    );
}
