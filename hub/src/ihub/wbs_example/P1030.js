import React from 'react';

import Container from '@mui/material/Container';
import {Section, P} from 'tion';

import Frame from '../ihub/components/assemblies/frames/FrameWbsNode.js';

// import wbs from '../manegers/wbs.js';

export default function P1030 (props) {
    return (
        <Frame>

          <Container maxWidth="lg" sx={{pt:5}}>

            <Section title="基本的前提(FP) × 10">
              <P>S-Dロジックの「10」の基本的前提(FP)</P>

              <Section lev="5" num="(1)" title="公理 × 4">
                <P>公理1(FP01): サービスが交換の基本的基盤である</P>
                <P>公理2(FP06): 顧客は常に価値の共創者である</P>
                <P>公理3(FP09): すべての経済的および社会的アクターが資源統合者である</P>
                <P>公理4(FP10): 価値は常に受益者によって独自にかつ現象学的に判断される</P>
              </Section>

              <Section lev="5" num="(2)"  title="基本的前提 × 6">
                <Section lev="6" title="公理1(FP01): サービスが交換の基本的基盤である">
                  <P>FP2: 間接的交換は交換の基本的基盤を見えなくしてしまう</P>
                  <P>FP3: グッズはサービス提供のための伝達手段である</P>
                  <P>FP4: オペラント資源が競争優位の基本的源泉である</P>
                  <P>FP5: すべての経済がサービス経済である</P>
                </Section>
                <Section lev="6" title="公理2(FP06): 顧客は常に価値の共創者である">
                  <P>FP7: 事業体は価値を提供することはできず、価値提案しかできない</P>
                  <P>FP8: サービス中心の考え方は、元来 顧客志向的 であり関係的である</P>
                </Section>
              </Section>
            </Section>
          </Container>

        </Frame>
    );
}
