import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';

export default function Overview () {
    return (
        <Container maxWidth="xl" sx={{pt: 3, pb:22}}>
          <Box>
            <S variant="h5">Overview</S>

            <Box>
              <S>ビジネスプロセスモデリング表記法（英語: Business Process Model and Notation, BPMN）</S>
            </Box>

            <Box sx={{mt:2}}>
              <S variant="h6">参照</S>
              <S><a href="https://ja.wikipedia.org/wiki/%E3%83%93%E3%82%B8%E3%83%8D%E3%82%B9%E3%83%97%E3%83%AD%E3%82%BB%E3%82%B9%E3%83%A2%E3%83%87%E3%83%AA%E3%83%B3%E3%82%B0%E8%A1%A8%E8%A8%98%E6%B3%95">Wikipedia</a></S>
              <S><a href="https://www.iso.org/standard/62652.html">ISO/IEC 19510:2013</a></S>
              <S><a href="https://camunda.com/download/modeler/">camunda-modeler</a></S>
              <S>bpmn-js, react-bpmn を WD で利用</S>
            </Box>

            <Box sx={{mt:2}}>
              <S variant="h6">Icons</S>
              <S><a href="https://iconduck.com/sets/bpmn-icons">iconduck.com</a></S>
              <S><a href="https://github.com/bpmn-io/bpmn-font">bpmn-io/bpmn-font (Github)</a></S>
            </Box>
          </Box>

        </Container>
    );
}
