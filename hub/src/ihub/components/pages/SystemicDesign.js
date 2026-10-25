import React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Frame from '../assemblies/frames/Frame.js';
import Link from '../assemblies/Link.js';

import { useCollections } from '../../redux/api/dataApi.js';

export default function SystemicDesign () {
    const DATA = useCollections()['systemic_design/sections'];

    return (
        <Frame>
          <Box sx={{overflow: 'auto', height:'100%'}}>
            <Container maxWidth="lg" sx={{pt: 3, pb:22}}>
              {DATA.map(row=> {
                  return (
                      <Box sx={{mt: 3}}>
                        <S variant="h5">
                          {row.label}
                        </S>

                        <Box sx={{display:'flex', mt: 1, flexWrap:'wrap'}}>
                          <Cards list={row.cards}/>
                        </Box>
                      </Box>
                  );
              })}
            </Container>
          </Box>
        </Frame>
    );
}

// https://systemic-design.org/
// https://www.systemicdesigntoolkit.org/

function Cards (props) {
    const list = props.list;
    const w = 266;

    return list.map(card=> {
        return (
            <Card key={card.label} sx={{width:w, m:1}}>
              <CardContent>
                <Box>
                  {!card.code && <S>{card.label}</S>}
                  {card.code  && <S><Link href={`/systemic-design/${card.code}`}>{card.label}</Link></S>}
                </Box>

                {card.imgs &&
                 card.imgs.length>0 &&
                 card.imgs.map(img=> {
                     return (
                         <Box key={img}>
                           <img src={`/systemic_design/${img}`}
                                alt={img}
                                style={{width: w - 33}}/>
                         </Box>
                     );
                 })}
              </CardContent>
            </Card>
        );
    });
}
