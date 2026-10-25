import Box from '@mui/material/Box';
import S from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import * as data from '../DATA.js';

export default function Level1 (props) {
    const sx = props.sx;

    return (
        <Box sx={sx}>
          <S variant="h4">パレット レベル1</S>

          <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
            <Box sx={{m:3, p:1}}>
              <S variant="h6">アクティビティ</S>

              <Card>
                <CardContent>
                  <Table rows={data.ACTIVITY}/>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{m:3, p:1}}>
              <S variant="h6">ゲートウェイ</S>

              <Card>
                <CardContent>
                  <Table rows={data.GATEWAY}/>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{m:3, p:1}}>
              <S variant="h6">開始イベント</S>

              <Card>
                <CardContent>
                  <Table rows={data.EVENT_START}/>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{m:3, p:1}}>
              <S variant="h6">終了イベント</S>

              <Card>
                <CardContent>
                  <Table rows={data.EVENT_END}/>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{m:3, p:1}}>
              <S variant="h6">シーケンスフローとメッセージッフロー</S>

              <Card>
                <CardContent>
                  <Table rows={data.FLOWS}/>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{m:3, p:1}}>
              <S variant="h6">プールとレーン</S>

              <Card>
                <CardContent>
                  <Table rows={data.POOL_LANE}/>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{m:3, p:1}}>
              <S variant="h6">データオブジェクト、データストア、データ関連</S>

              <Card>
                <CardContent>
                  <Table rows={data.DATA_OBJECT_STORE}/>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{m:3, p:1}}>
              <S variant="h6">ドキュメンテーション</S>
            </Box>

            <Box sx={{m:3, p:1}}>
              <S variant="h6">アーティファクト</S>
            </Box>
          </Box>
        </Box>
    );
}

function Table (props) {
    const rows = props.rows;

    return (
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row=> {
                return (
                    <tr>
                      <td>
                        {row.image.map(file_name=> {
                            return (
                                <img src={`/bpmn/${file_name}`}
                                     alt={file_name}
                                     style={{width:44, height:44}}/>
                            );
                        })}
                      </td>
                      <td>{row.name}</td>
                      <td>
                        {row.description.map((l,i)=> {
                            return <p key={i}>{l}</p>;
                        })}
                      </td>
                    </tr>
                );
            })}
          </tbody>
        </table>
    );
}
