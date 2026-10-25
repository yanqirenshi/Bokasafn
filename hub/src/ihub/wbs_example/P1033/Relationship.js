import Container from '@mui/material/Container';
import {Section, P, LinkOS} from 'tion'; // , S

import TableTMRelationships from '../../ihub/components/assemblies/TableTMRelationships.js';

export default function Relationship (props) {
    return (
        <Container maxWidth="lg" sx={{pt:5}}>
          <Section title="Relationship">
            <Section lev="5" title="関係の種類">
              <TableTMRelationships/>
            </Section>

            <Section lev="5" title="結線の種類">
              <P>1 対 1</P>
              <img src={process.env.PUBLIC_URL + '/imgs/tm/2024-01-27_130647.png'} alt="/imgs/tm/2024-01-27_130647.png"/>
              <P>1 対 (1 or 値なし)</P>
              <img src={process.env.PUBLIC_URL + '/imgs/tm/2024-01-27_130706.png'} alt="/imgs/tm/2024-01-27_130706.png"/>
              <P>1 対 複数</P>
              <img src={process.env.PUBLIC_URL + '/imgs/tm/2024-01-27_130724.png'} alt="/imgs/tm/2024-01-27_130724.png"/>
              <P>1 対 (複数 or 値なし)</P>
              <img src={process.env.PUBLIC_URL + '/imgs/tm/2024-01-27_130740.png'} alt="/imgs/tm/2024-01-27_130740.png"/>
              <P>対照表、対応表</P>
              <P>再帰</P>
            </Section>
          </Section>
        </Container>
    );
}
